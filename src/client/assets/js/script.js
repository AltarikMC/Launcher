'use strict';
const { ipcRenderer, shell } = require('electron');
const vue = require('vue/dist/vue.common.prod')

window.addEventListener("DOMContentLoaded", () => {
    const minimizeButton = document.getElementById("minimize-btn")
    const closeButton = document.getElementById("close-btn")

    minimizeButton.addEventListener("click", () => ipcRenderer.send('minimizeWindow'))

    closeButton.addEventListener("click", () => ipcRenderer.send('closeWindow'))
})
