const { app, BrowserWindow, Menu } = require('electron')

function createWindow () {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true
    },
    frame: false
  })
  Menu.setApplicationMenu(null)
  win.loadFile('index.html')
}

app.whenReady().then(() => {
  createWindow()
  // setMainMenu()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (win === null){
    createWindow()
  }
})

// function setMainMenu() {
//   const template = [
//     {
//       label: 'Filter',
//       submenu: [
//         {
//           label: 'Hello',
//           accelerator: 'Shift+CmdOrCtrl+H',
//           click() {
//               console.log('Oh, hi there!')
//           }
//         }
//       ]
//     }
//   ];
//   Menu.setApplicationMenu(Menu.buildFromTemplate(template));
// }

