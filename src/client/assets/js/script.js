'use strict';
const {ipcRenderer} = require('electron');
const {
    getCurrentWindow,
    minimizeWindow,
    closeWindow,
  } = require("./assets/js/menubar.js");

window.addEventListener("DOMContentLoaded", () => {
    window.getCurrentWindow = getCurrentWindow
    window.minimizeWindow = minimizeWindow
    window.closeWindow = closeWindow
    const minimizeButton = document.getElementById("minimize-btn")
    const closeButton = document.getElementById("close-btn")

    minimizeButton.addEventListener("click", e => window.minimizeWindow())

    // maxUnmaxButton.addEventListener("click", e => window.maxUnmaxWindow())

    closeButton.addEventListener("click", e => window.closeWindow())
})
