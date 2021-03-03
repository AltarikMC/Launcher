let win;

function setWindow(browserWindow) {
    win = browserWindow;
}

function minimizeWindow(browserWindow = win) {
	if(browserWindow.minimizable) {
        browserWindow.minimize()
	}
}
  
function closeWindow(browserWindow = win) {
    browserWindow.close()
}

module.exports = {
    setWindow,
    minimizeWindow,
    closeWindow
}