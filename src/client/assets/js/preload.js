'use strict';
const { ipcRenderer } = require('electron');
let app;
window.addEventListener("DOMContentLoaded", () => {
    const minimizeButton = document.getElementById("minimize-btn")
    const closeButton = document.getElementById("close-btn")

    minimizeButton.addEventListener("click", () => ipcRenderer.send('minimizeWindow'))

    closeButton.addEventListener("click", () => ipcRenderer.send('closeWindow'))
})

ipcRenderer.on('notification', (_e, args) => {
    app.notificationTitle = args.title
    app.notificationMessage = args.body
    switch(args.class) {
        case "success":
            app._component.methods.showSuccess(args.title, args.body)
            break;
        case "warning":
            app._component.methods.showWarning(args.title, args.body)
            break;
        case "error":
            app._component.methods.showError(args.title, args.body)
            break;
        case "info":default:
            app._component.methods.showInfo(args.title, args.body)
    }
})
