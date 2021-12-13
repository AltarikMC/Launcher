'use strict';
const { ipcRenderer, shell } = require('electron');
const vue = require('vue/dist/vue.common.prod')

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
            app.showSuccess()
            break;
        case "warning":
            app.showWarning()
            break;
        case "error":
            app.showError()
            break;
        case "info":default:
            app.showInfo()
    }
})
