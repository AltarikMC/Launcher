const isDev = require('electron-is-dev')
const { Notification } = require('electron')
const os = require('os')
const pkg = require('../../package.json')
const { format } = require('util')
const server = 'https://update.electronjs.org'

function initUpdater(autoUpdater) {
    autoUpdater.checkForUpdates()
    setInterval(() => {
        autoUpdater.checkForUpdates()
    }, 10 * 60 * 1000) // 10 minutes
}

function configUpdater(app, autoUpdater, dialog) {
    if(isDev)
        return
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
            if (returnValue.response === 0) autoUpdater.quitAndInstall()
        })
    })

    autoUpdater.on('error', message => {
        console.error('There was a problem updating the application')
        console.error(message)
        /*
        showNotification(feed)
        const dialogOpts = {
            type: 'info',
            buttons: ['Fermer'],
            title: 'Erreur lors de la tentative de mise à jour du launcher',
            message: "Une erreur est survenue lros de la tentative de mise à jour du launcher",
            detail: message
        }

        dialog.showMessageBox(dialogOpts) */
    })

    autoUpdater.on('update-available', () => {
        showNotification("Altarik launcher", "downloading update")
        autoUpdater.down
    })
}

function showNotification(title, body="") {
    const content = {
      title: title,
      body: body
    }
    new Notification(content).show()
}

module.exports = {
    configUpdater
}
