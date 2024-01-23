export function minimizeWindow (browserWindow) {
  if (browserWindow.minimizable) {
    browserWindow.minimize()
  }
}

export function closeWindow (browserWindow) {
  browserWindow.close()
}
