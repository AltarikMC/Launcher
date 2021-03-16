'use strict';
const { ipcRenderer } = require('electron');

window.addEventListener("DOMContentLoaded", () => {
    const minimizeButton = document.getElementById("minimize-btn")
    const closeButton = document.getElementById("close-btn")

    minimizeButton.addEventListener("click", e => ipcRenderer.send('minimizeWindow'))

    closeButton.addEventListener("click", e => ipcRenderer.send('closeWindow'))
})
