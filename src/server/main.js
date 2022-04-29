const { app, BrowserWindow, Menu, ipcMain, autoUpdater, dialog } = require('electron')
const logger = require('electron-log')
const { join } = require('path')

if (require('electron-squirrel-startup')) {
    require("./install.js").handleSquirrelEvent(app)
    app.quit()
    return
}
const minecraft = require('./minecraft.js')
minecraft.showNotification = showNotification

const iconPath = join(__dirname, "icon.ico")
let win = null

function createWindow () {
    win = new BrowserWindow({
        width: 1000,
        height: 600,
        resizable: false,
        icon: iconPath,
        webPreferences: {
        nodeIntegration: true,
        contextIsolation: false
        },
        frame: false
    })
    //Menu.setApplicationMenu(null)
    win.loadFile('src/client/login.html').then(() => {
        require('./updater.js').configUpdater(app, autoUpdater, dialog, logger, showNotification)
    })
    win.on("close", () => {
        app.quit()
    })
}

const { setWindow, minimizeWindow, closeWindow } = require("./menubar.js");

app.whenReady().then(() => {
    createWindow()
    setWindow(win)
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
    if (win === null){
        createWindow()
    }
})

ipcMain.on("credits", () => {
    const dialogOpts = {
        type: 'info',
        buttons: ['OK'],
        title: 'Crédits',
        message: 'Crédits',
        detail: `Altarik Launcher
BSD 3-Clause License

Copyright (c) 2021, Altarik
All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:

1. Redistributions of source code must retain the above copyright notice, this
   list of conditions and the following disclaimer.

2. Redistributions in binary form must reproduce the above copyright notice,
   this list of conditions and the following disclaimer in the documentation
   and/or other materials provided with the distribution.

3. Neither the name of the copyright holder nor the names of its
   contributors may be used to endorse or promote products derived from
   this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
`
    }
    dialog.showMessageBox(dialogOpts)
})

ipcMain.on("login", (event, args) => {
    minecraft.login(event, win, args.user, args.pass)
})

ipcMain.on("microsoft-login", (event) => {
    minecraft.microsoftLogin(event, win)
})

ipcMain.on("invalidateData", event => {
    minecraft.invalidateData(event)
})

ipcMain.on("launch", (event, args) => {
  minecraft.launch(event, args)
})

function showNotification(title, body="", clazz="info") {
    win.webContents.send('notification', {title: title, body: body, class: clazz})
}

ipcMain.on("disconnect", () => {
    minecraft.auth = null
    win.loadFile('src/client/login.html').then(() =>  showNotification("Déconnecté", "Vous avez été déconnecté de votre compte", "success"))
   
})

ipcMain.on("pageReady", (event) => {
    event.sender.send("nick", { name: minecraft.auth.name })
    minecraft.getModsInformations(event)
})