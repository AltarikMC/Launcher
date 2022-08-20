const isDev = require('electron-is-dev')
const pkg = require('../../package.json')
const server = 'https://update.electronjs.org'

class Updater {

    constructor(app, win, autoUpdater, dialog, logger, ipcMain) {
        this.app = app
        this.win = win
        this.autoUpdater = autoUpdater
        this.dialog = dialog
        this.logger = logger
        this.ipcMain = ipcMain
    }

    configUpdater() {
        this.logger.info(`electron version: ${process.versions['electron']}`)
        this.logger.info(`chrome version: ${process.versions['chrome']}`)
        this.logger.info(`Node version: ${process.versions['node']}`)
        this.logger.info(`platform: ${process.platform}`)
        this.logger.info(`arch: ${process.arch}`)
        if(isDev) {
            this.logger.info(`developpement version ${this.app.getVersion()}`)
            this.win.loadFile('src/client/login.html')
            return
        }
        this.logger.info(`production version ${this.app.getVersion()}`)
            
        const feed = `${server}/${pkg.repository}/${process.platform}-${process.arch}/${this.app.getVersion()}`
        this.autoUpdater.setFeedURL(feed)
        
        // TODO : replace dialog by automatic restart
        this.autoUpdater.on('update-downloaded', (_event, releaseNotes, releaseName) => {
            this.logger.info(`update downloaded ${releaseName}`)
            this.logger.info("Leaving application to install update...")
            this.autoUpdater.quitAndInstall()
        })
    
    }

    checkForUpdates(win, showNotification) {
        this.logger.info("Checking for update...")
        this.autoUpdater.checkForUpdates()
        this.autoUpdater.on('error', message => {
            this.logger.error('There was a problem updating the application')
            this.logger.error(message)
            win.loadFile('src/client/login.html').then(() => {
                showNotification("Une erreur est survenue lors de la vérification de la mise à jour", "Veuillez vérifier votre connexion internet et réessayer", "error")
            })
        })
    
        this.autoUpdater.on('update-available', () => {
            this.logger.info("update available, downloading...")
            win.webContents.send("update-available")
        })
        this.autoUpdater.on("update-not-available", () => {
            this.logger.info("update not available")
            win.loadFile('src/client/login.html')
        })
    }

}

module.exports = {
    Updater
}
