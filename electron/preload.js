const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    send: (channel, data) => ipcRenderer.send(channel, data),
    on: (channel, listener) => ipcRenderer.on(channel, listener),
    removeAllListeners: (channel) => ipcRenderer.removeAllListeners(channel),
    getViolationScreenshotDir: () => {
        return new Promise((resolve) => {
            ipcRenderer.once("violation-screenshot-dir-result", (_, dir) => resolve(dir));
            ipcRenderer.send("get-violation-screenshot-dir");
        });
    }
});
