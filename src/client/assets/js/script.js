'use strict';
const { ipcRenderer, shell } = require('electron');
// const isDev = require("electron-is-dev")
const vue = require(/*isDev ? */ 'vue/dist/vue'/* : 'vue' */)

window.addEventListener("DOMContentLoaded", () => {
    const minimizeButton = document.getElementById("minimize-btn")
    const closeButton = document.getElementById("close-btn")

    minimizeButton.addEventListener("click", e => ipcRenderer.send('minimizeWindow'))

    closeButton.addEventListener("click", e => ipcRenderer.send('closeWindow'))
})
