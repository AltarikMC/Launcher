import { app, shell, BrowserWindow, autoUpdater, dialog, Menu, ipcMain } from 'electron'
import { dirname, join } from 'path'
import { optimizer, is } from '@electron-toolkit/utils'
import logger from 'electron-log'
import Updater from './updater.js'
import electronStartup from 'electron-squirrel-startup'
import install from './install.js'
import Mc from './minecraft.js'
import { minimizeWindow, closeWindow } from './menubar.js'
// import icon from '../../resources/icon.png?asset'

const updaterInstance = new Updater(app, autoUpdater, dialog, logger, showNotification)
updaterInstance.configUpdater()

const minecraft = new Mc()
minecraft.showNotification = showNotification

const __dirname = dirname(__filename)
const iconPath = join(__dirname, 'icon.ico')

let mainWindow

function createWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1000,
    height: 600,
    resizable: false,
    autoHideMenuBar: true,
    icon: iconPath,
    // ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.mjs'),
      sandbox: false,
      nodeIntegration: true,
      contextIsolation: false
    },
    frame: false
  })
  if (!is.dev) {
    Menu.setApplicationMenu(null)
  }

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  mainWindow.on('close', () => {
    app.quit()
  })

  if (is.dev && process.env.ELECTRON_RENDERER_URL) {
    mainWindow.loadURL(process.env.ELECTRON_RENDERER_URL)
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

function showNotification(title, body = '', clazz = 'info') {
  mainWindow.webContents.send('notification', { title, body, class: clazz })
}

ipcMain.on('minimizeWindow', () => {
  minimizeWindow(mainWindow)
})

ipcMain.on('closeWindow', () => {
  closeWindow(mainWindow)
})

ipcMain.on('microsoft-login', (event) => {
  minecraft.microsoftLogin(event, mainWindow)
})

ipcMain.on('invalidateData', (event) => {
  minecraft.invalidateData(event)
})

ipcMain.on('launch', (event, args) => {
  minecraft.launch(event, args)
})

function main() {
  if (electronStartup) {
    install(app)
    app.quit()
    return null
  }
  app.whenReady().then(() => {
    app.on('browser-window-created', (_, window) => {
      optimizer.watchWindowShortcuts(window)
    })
    mainWindow = createWindow()
    app.on('activate', function () {
      if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
  })
}

main()
