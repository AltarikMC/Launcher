const { remote } = require('electron')
  
function getCurrentWindow() {
  return remote.getCurrentWindow()
}

function minimizeWindow(browserWindow = getCurrentWindow()) {
	if (browserWindow.minimizable) {
    browserWindow.minimize()
	}
}
  
function closeWindow(browserWindow = getCurrentWindow()) {
    browserWindow.close()
}

module.exports = {
    getCurrentWindow,
    minimizeWindow,
    closeWindow,
}