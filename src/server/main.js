import { app, BrowserWindow, Menu, ipcMain, autoUpdater, dialog } from 'electron'
import isDev from 'electron-is-dev'
import logger from 'electron-log'
import { join } from 'path'
import { totalmem } from 'os'
import Updater from './updater.js'
import electronStartup from 'electron-squirrel-startup'
import install from './install.js'
import Mc from './minecraft.js'
import { minimizeWindow, closeWindow } from './menubar.js'
// import { fileURLToPath } from 'url'

const updaterInstance = new Updater(app, autoUpdater, dialog, logger)
updaterInstance.configUpdater()

const minecraft = new Mc()

console.log('__filename: ' + __dirname)
// const __dirname = dirname(__filename)

// const iconPath = join(__dirname, 'icon.ico')

let win = null

function createWindow () {
  win = new BrowserWindow({
    width: 1000,
    height: 600,
    resizable: false,
    // icon: iconPath,
    webPreferences: {
      sandbox: false,
      preload: join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true
    },
    frame: false
  })
  if (!isDev) {
    Menu.setApplicationMenu(null)
  }
  // eslint-disable-next-line no-undef
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    // eslint-disable-next-line no-undef
    win.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL)
  } else {
    // eslint-disable-next-line no-undef
    win.loadFile(join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`))
  }
  win.webContents.send('pc-configuration', { totalMem: totalmem() })

  win.on('close', () => {
    app.quit()
  })
}

ipcMain.on('pageReady', (event) => {
  event.sender.send('nick', { name: minecraft.auth.name })
  minecraft.getModsInformations(event)
})

ipcMain.on('checking-update', (event) => {
  updaterInstance.checkForUpdates(event)
})

function main () {
  if (electronStartup) {
    install(app)
    app.quit()
    return
  }

  app.whenReady().then(() => {
    createWindow()
  })

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.quit()
    }
  })

  ipcMain.on('minimizeWindow', () => {
    minimizeWindow(win)
  })

  ipcMain.on('closeWindow', () => {
    closeWindow(win)
  })

  app.on('activate', () => {
    if (win === null) {
      createWindow()
    }
  })

  ipcMain.on('login', (event, args) => {
    minecraft.login(event, win, args.user, args.pass)
  })

  ipcMain.on('microsoft-login', (event) => {
    minecraft.microsoftLogin(event)
  })

  ipcMain.on('invalidateData', event => {
    minecraft.invalidateData(event)
  })

  ipcMain.on('launch', (event, args) => {
    minecraft.launch(event, args)
  })
}

main()
