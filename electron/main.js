// pc客户端 main.js（ES Module）
import { app, BrowserWindow, Menu, desktopCapturer, nativeImage, ipcMain } from "electron";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let mainWindow;

// 每个考生独立状态
const examContext = {
    candidateIdCard: null,
    blurCount: 0,
    monitorEnabled: false
};

const MAX_BLUR_COUNT = 3;

// 接收身份证
ipcMain.on('set-user-info', (event, data) => {
    examContext.candidateIdCard = data.idCard;
    examContext.blurCount = 0; // ✅ 每个考生独立次数
});

// 开启截图监控
ipcMain.on('enable-screen-monitor', () => {
    examContext.monitorEnabled = true;
    examContext.blurCount = 0; // 重置切屏次数
});

// 关闭截图监控
ipcMain.on('disable-screen-monitor', () => {
    examContext.monitorEnabled = false;
});

function createWindow() {
    Menu.setApplicationMenu(null);

    mainWindow = new BrowserWindow({
        fullscreen: true,
        frame: false,
        webPreferences: {
            preload: path.join(__dirname, "preload.js"),
            nodeIntegration: false,
            contextIsolation: true,
        },
    });

    if (process.env.NODE_ENV === 'development') {
        mainWindow.loadURL('http://localhost:5175');
        mainWindow.webContents.openDevTools();
    } else {
        mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
    }

    mainWindow.show();

    // 切屏 / 窗口失去焦点事件
    mainWindow.on('blur', async () => {
        if (!examContext.monitorEnabled) return;
        if (!examContext.candidateIdCard) return;

        examContext.blurCount++;

        // 截屏
        await captureScreen();

        // 通知前端切屏次数
        mainWindow.webContents.send('screen-blur-count', {
            count: examContext.blurCount,
            max: MAX_BLUR_COUNT
        });

        // 超过最大次数 → 自动交卷
        if (examContext.blurCount > MAX_BLUR_COUNT) {
            mainWindow.webContents.send('force-submit', {
                reason: '切屏超过3次'
            });
        }
    });
}

// 截屏函数
async function captureScreen() {
    try {
        const sources = await desktopCapturer.getSources({ types: ['screen'] });

        const userFolder = path.join(
            app.getPath('userData'),
            examContext.candidateIdCard || 'unknown'
        );

        if (!fs.existsSync(userFolder)) {
            fs.mkdirSync(userFolder, { recursive: true });
        }

        for (let i = 0; i < sources.length; i++) {
            const screen = sources[i];
            const image = nativeImage.createFromDataURL(
                screen.thumbnail.toDataURL()
            );

            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const filePath = path.join(
                userFolder,
                `screenshot-${i}-${timestamp}.png`
            );

            fs.writeFileSync(filePath, image.toPNG());
        }
    } catch (err) {
        console.error('截屏失败:', err);
    }
}

app.whenReady().then(() => {
    createWindow();
});

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") app.quit();
});
