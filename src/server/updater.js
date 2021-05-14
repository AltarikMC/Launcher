const isDev = require('electron-is-dev')
const { Notification } = require('electron')
const os = require('os')
const pkg = require('../../package.json')
const server = 'https://update.electronjs.org'

function initUpdater(autoUpdater) {
    autoUpdater.checkForUpdates()
    setInterval(() => {
        autoUpdater.checkForUpdates()
    }, 10 * 60 * 1000) // 10 minutes
}

function configUpdater(app, autoUpdater, dialog, logger) {
    logger.info(`platform: ${process.platform}`)
    logger.info(`arch: ${process.arch}`)
    if(isDev) {
        logger.info(`developpement version ${app.getVersion()}`)
        return
    }
    logger.info(`production version ${app.getVersion()}`)
        
    const feed = `${server}/${pkg.repository}/${process.platform}-${process.arch}/${app.getVersion()}`
    autoUpdater.setFeedURL(feed)
    app.isReady ? initUpdater(autoUpdater) : app.on("ready", () => initUpdater(autoUpdater))
    

    autoUpdater.on('update-downloaded', (event, releaseNotes, releaseName, releaseDate, updateURL) => {
        showNotification(releaseNotes, updateURL)
        const dialogOpts = {
            type: 'info',
            buttons: ['Rédémarrer', 'Plus tard'],
            title: 'Une mise à jour du launcher est disponible',
            message: process.platform === 'win32' ? releaseNotes : releaseName,
            detail: 'Une nouvelle version du launcher a été téléchargé. Redémarrez l\'application pour appliquer les mises à jour.'
        }

        dialog.showMessageBox(dialogOpts).then((returnValue) => {
            if (returnValue.response === 0) {
                logger.info("Quit applicaiton to install update")
                autoUpdater.quitAndInstall()
            }
        })
    })

    autoUpdater.on('error', message => {
        logger.error('There was a problem updating the application')
        logger.error(message)
    })

    autoUpdater.on('update-available', () => {
        showNotification("Altarik launcher", "downloading update")
        logger.info("update available, downloading...")
    })
}

function showNotification(title, body="") {
    new Notification({ title: title, body: body }).show()
}

module.exports = {
    configUpdater
}
