const isDev = require('electron-is-dev')
const fetch = require('node-fetch').default
const pkg = require('../../package.json')
const server = 'https://update.electronjs.org'

class Updater {

    constructor(app, autoUpdater, dialog, logger, ipcMain) {
        this.app = app
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
            return
        }
        this.logger.info(`production version ${this.app.getVersion()}`)
        // TODO : replace dialog by automatic restart
        this.autoUpdater.on('update-downloaded', (_event, releaseNotes, releaseName) => {
            this.logger.info(`update downloaded ${releaseName}`)
            this.logger.info("Leaving application to install update...")
            this.autoUpdater.quitAndInstall()
        })
    
    }

    checkForUpdates(win, showNotification) {
        if(isDev) {
            win.loadFile('src/client/login.html')
            return;
        }
        this.logger.info("Checking for update...")
        const feed = `${server}/${pkg.repository}/${process.platform}-${process.arch}/${this.app.getVersion()}`
        if(process.platform != 'linux') {
            this.autoUpdater.setFeedURL(feed)
            this.autoUpdater.checkForUpdates()
            this.autoUpdater.on('error', message => {
                this.displayError(win, showNotification, message)
            })
        
            this.autoUpdater.on('update-available', () => {
                this.logger.info("update available, downloading...")
                win.webContents.send("update-available")
            })
            this.autoUpdater.on("update-not-available", () => {
                this.logger.info("update not available")
                win.loadFile('src/client/login.html')
            })
        } else {
            fetch(feed).then(response => {
                if(response.status === 200) {
                    response.json().then(json => {
                        win.webContents.send("please-download-update", { url: json.url} )
                    })
                } else {
                    if(response.status === 204) {
                        this.logger.info("update not available")
                        win.loadFile('src/client/login.html')
                    } else {
                        this.displayError(win, showNotification, "Server return " + response.status + " http code")
                    }
                    
                }
            }).catch(err => {
                this.displayError(win, showNotification, err)
            })
        }
        
    }

    displayError(win, showNotification, errorMessage) {
        this.logger.error('There was a problem updating the application')
        this.logger.error(errorMessage)
        win.loadFile('src/client/login.html').then(() => {
            showNotification("Une erreur est survenue lors de la vérification de la mise à jour", "Veuillez vérifier votre connexion internet et réessayer", "error")
        })
    }

}

module.exports = {
    Updater
}
