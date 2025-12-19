// pc客户端 main.js（ES Module）
import { app, BrowserWindow, Menu, desktopCapturer, nativeImage, ipcMain } from "electron";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let mainWindow;

// 是否开启了违规操作提醒
let monitorEnabled = false


// 开启截图监控
ipcMain.on('enable-screen-monitor', () => {
    monitorEnabled = true;
});

// 关闭截图监控
ipcMain.on('disable-screen-monitor', () => {
    monitorEnabled = false;
});

function createWindow() {
    Menu.setApplicationMenu(null);

    mainWindow = new BrowserWindow({
        fullscreen: true,
        frame: false,
        webPreferences: {
            preload: path.join(__dirname, "preload.js"),
            contextIsolation: true,
            nodeIntegration: false,
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
        if (!monitorEnabled) return;
        // 截屏
        await captureScreen();
    });
}

// 截屏函数
async function captureScreen() {
    try {
        const sources = await desktopCapturer.getSources({
            types: ['screen'],
            thumbnailSize: { width: 1920, height: 1080 }
        });

        const screenshots = [];

        for (let i = 0; i < sources.length; i++) {
            const screen = sources[i];

            // 转成 NativeImage
            const image = nativeImage.createFromDataURL(
                screen.thumbnail.toDataURL()
            );

            // Buffer → base64
            const base64 = image.toPNG().toString('base64');

            screenshots.push({
                name: `screenshot-${Date.now()}-${i}.png`,
                base64
            });
        }
        // 直接发给渲染进程
        mainWindow?.webContents.send('screen-captured', screenshots);

    } catch (err) {
    }
}



app.whenReady().then(() => {
    createWindow();
});

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") app.quit();
});
