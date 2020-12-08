const {remote} = require('electron')
const {Menu, BrowserWindow, MenuItem, shell} = remote
  
function getCurrentWindow() {
  return remote.getCurrentWindow()
}

function minimizeWindow(browserWindow = getCurrentWindow()) {
	if (browserWindow.minimizable) {
    // browserWindow.isMinimizable() for old electron versions
    browserWindow.minimize()
	}
}
  
function unmaximizeWindow(browserWindow = getCurrentWindow()) {
    browserWindow.unmaximize()
}
  
function maxUnmaxWindow(browserWindow = getCurrentWindow()) {
    if (browserWindow.isMaximized()) {
      browserWindow.unmaximize()
    } else {
      browserWindow.maximize()
    }
}
  
function closeWindow(browserWindow = getCurrentWindow()) {
    browserWindow.close()
}
  
function isWindowMaximized(browserWindow = getCurrentWindow()) {
    return browserWindow.isMaximized()
}
  
module.exports = {
    getCurrentWindow,
    minimizeWindow,
    unmaximizeWindow,
    maxUnmaxWindow,
    isWindowMaximized,
    closeWindow,
}