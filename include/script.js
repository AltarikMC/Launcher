'use strict';
const {remote, ipcRenderer} = require('electron');
const {
    getCurrentWindow,
    minimizeWindow,
    unmaximizeWindow,
    maxUnmaxWindow,
    isWindowMaximized,
    closeWindow,
  } = require("./include/menubar.js");

window.addEventListener("DOMContentLoaded", () => {
    window.getCurrentWindow = getCurrentWindow
    window.minimizeWindow = minimizeWindow
    window.unmaximizeWindow = unmaximizeWindow
    window.maxUnmaxWindow = maxUnmaxWindow
    window.isWindowMaximized = isWindowMaximized
    window.closeWindow = closeWindow
    const minimizeButton = document.getElementById("minimize-btn")
    const maxUnmaxButton = document.getElementById("max-unmax-btn")
    const closeButton = document.getElementById("close-btn")

    minimizeButton.addEventListener("click", e => {
        window.minimizeWindow()
    })

    maxUnmaxButton.addEventListener("click", e => {
        const icon = maxUnmaxButton.querySelector("#icon-maxUnmax")
    
        window.maxUnmaxWindow()
    
        // Change the middle maximize-unmaximize icons.
        if (window.isWindowMaximized()) {
          icon.classList.remove("icon-square")
          icon.classList.add("icon-clone")
        } else {
          icon.classList.add("icon-square")
          icon.classList.remove("icon-clone")
        }
      })

      closeButton.addEventListener("click", e => {
        window.closeWindow()
      })
})
