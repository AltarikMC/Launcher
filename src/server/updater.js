import isDev from 'electron-is-dev'
import fetch from 'node-fetch'
import pkg from '../../package.json' with {type: 'json'}

const server = 'https://update.electronjs.org'

export default class Updater {
  constructor (app, autoUpdater, dialog, logger) {
    this.app = app
    this.autoUpdater = autoUpdater
    this.dialog = dialog
    this.logger = logger
  }

  configUpdater () {
    this.logger.info(`electron version: ${process.versions.electron}`)
    this.logger.info(`chrome version: ${process.versions.chrome}`)
    this.logger.info(`Node version: ${process.versions.node}`)
    this.logger.info(`platform: ${process.platform}`)
    this.logger.info(`arch: ${process.arch}`)
    if (isDev) {
      this.logger.info(`developpement version ${this.app.getVersion()}`)
      return
    }
    this.logger.info(`production version ${this.app.getVersion()}`)
    // TODO : replace dialog by automatic restart
    this.autoUpdater.on('update-downloaded', (_event, releaseNotes, releaseName) => {
      this.logger.info(`update downloaded ${releaseName}`)
      this.logger.info('Leaving application to install update...')
      this.autoUpdater.quitAndInstall()
    })
  }

  checkForUpdates (event) {
    if (isDev) {
      event.sender.send('updater', { status: 'success' })
      // win.loadFile('src/client/login.html')
      return
    }
    const feed = `${server}/${pkg.repository}/${process.platform}-${process.arch}/${this.app.getVersion()}`
    if (process.platform !== 'linux') {
      this.autoUpdater.setFeedURL(feed)
      this.autoUpdater.on('error', message => {
        this.logger.error('An error occurred when trying to check for update', message)
        event.sender.send('updater', { status: 'error', message })
        // this.displayError(showNotification, message)
      })

      this.autoUpdater.on('update-available', () => {
        this.logger.info('update available, downloading...')
        event.sender.send('updater', { status: 'info', message: 'update-available' })
        // event.sender.webContents.send('update-available')
      })
      this.autoUpdater.on('update-not-available', () => {
        this.logger.info('update not available')
        event.sender.send('updater', { status: 'success', message: 'no-update' })
        // event.sender.loadFile('src/client/login.html')
      })
      this.logger.info('Checking for update...')
      this.autoUpdater.checkForUpdates()
    } else {
      this.searchUpdateLinux(event)
    }
  }

  searchUpdateLinux (ipcEvent) {
    const url = 'https://api.github.com/repos/AltarikMc/Launcher/releases/latest'
    fetch(url).then(response => {
      if (response.status === 200) {
        response.json().then(json => {
          if (json.tag_name !== pkg.version) {
            const asset = json.assets.filter(el => el.browser_download_url.includes('.zip'))
            if (asset.length === 1) {
              const downloadUrl = asset[0].browser_download_url
              // win.webContents.send('please-download-update', { url: downloadUrl })
              ipcEvent.sender.webContents.send('updater', { status: 'info', message: 'please-download-update', content: downloadUrl })
              this.logger.info('update available, please download')
            } else {
              ipcEvent.sender.webContents.send('updater', { status: 'error', message: 'Can\'t find right asset in last update' })
            }
          } else {
            this.logger.info('update not available')
            ipcEvent.sender.webContents.send('updater', { status: 'success', message: 'no-update' })
            // win.loadFile('src/client/login.html')
          }
        }).catch(err => ipcEvent.sender.webContents.send('updater', { status: 'error', message: err }))
      } else {
        ipcEvent.sender.webContents.send('updater', { status: 'error', message: 'Server unavailable' })
        // this.displayError(win, showNotification, 'Server unavailable')
      }
    }).catch(err => ipcEvent.sender.webContents.send('updater', { status: 'error', message: err }))
  }
}
