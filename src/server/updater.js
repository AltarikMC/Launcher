const isDev = require('electron-is-dev')
const pkg = require('../../package.json')
const server = 'https://update.electronjs.org'

function configUpdater(app, autoUpdater, dialog, logger, showNotification) {
    logger.info(`electron version: ${process.versions['electron']}`)
    logger.info(`chrome version: ${process.versions['chrome']}`)
    logger.info(`Node version: ${process.versions['node']}`)
    logger.info(`platform: ${process.platform}`)
    logger.info(`arch: ${process.arch}`)
    if(isDev) {
        logger.info(`developpement version ${app.getVersion()}`)
        return
    }
    logger.info(`production version ${app.getVersion()}`)
        
    const feed = `${server}/${pkg.repository}/${process.platform}-${process.arch}/${app.getVersion()}`
    autoUpdater.setFeedURL(feed)
    logger.info("Checking for update...")
    autoUpdater.checkForUpdates()

    autoUpdater.on('update-downloaded', (_event, releaseNotes, releaseName) => {
        const dialogOpts = {
            type: 'info',
            buttons: ['Rédémarrer', 'Plus tard'],
            title: 'Une mise à jour du launcher est disponible',
            message: process.platform === 'win32' ? releaseNotes : releaseName,
            detail: 'Une nouvelle version du launcher a été téléchargé. Redémarrez l\'application pour appliquer les mises à jour.'
        }

        dialog.showMessageBox(dialogOpts).then((returnValue) => {
            if (returnValue.response === 0) {
                logger.info("Leaving application to install update...")
                autoUpdater.quitAndInstall()
            }
        })
    })

    autoUpdater.on('error', message => {
        showNotification("Impossible de mettre à jour le launcher", "vérifier votre connexion", "warning")
        logger.error('There was a problem updating the application')
        logger.error(message)
    })

    autoUpdater.on('update-available', () => {
        showNotification("Mise à jour", "Téléchargement de la mise à jour", "warning")
        logger.info("update available, downloading...")
    })
}

module.exports = {
    configUpdater
}
