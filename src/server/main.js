const { app, BrowserWindow, Menu, ipcMain, Notification, autoUpdater, dialog } = require('electron')
const logger = require('electron-log')
const { join } = require('path')
if (require('electron-squirrel-startup')) {
  require("./install.js").handleSquirrelEvent(app)
  app.quit()
  return;
}
require('./updater.js').configUpdater(app, autoUpdater, dialog, logger) 

const axios = require('axios').default
const sha1File = require('sha1-file')
const fs = require('fs')
const constants = require("constants")
const zip = require('extract-zip')

const { Client, Authenticator } = require('minecraft-launcher-core')
const appdata = process.env.APPDATA || (process.platform == 'darwin' ? process.env.HOME + '/Library/Preferences' : process.env.HOME + "/.local/share")

const launcher = new Client()
const iconPath = join(__dirname, "icon.ico")
let win = null
let auth = null

let Minecraftpath = join(appdata, ".altarik")
// let clientPackage = "https://www.dropbox.com/s/ww6a052nzzgojdm/modpack.zip?dl=1"
let version = "1.16.4"
let versionFolder = "fabric-loader-0.10.8-1.16.4"
let modsList = undefined

function createWindow () {
  win = new BrowserWindow({
    width: 1000,
    minWidth: 1000,
    maxWidth: 1000,
    height: 600,
    minHeight: 600,
    maxHeight: 600,
    icon: iconPath,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    },
    frame: false,
  })
  // Menu.setApplicationMenu(null)
  win.loadFile('src/client/login.html')
}

const {
    setWindow,
    minimizeWindow,
    closeWindow
  } = require("./menubar.js");

  setWindow(win)

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
  if (win === null){
    createWindow()
  }
})

ipcMain.on("login", (event, args) => {
  auth = Authenticator.getAuth(args.user, args.pass)
  auth.then(v => {
    win.loadFile('src/client/index.html')
    setTimeout(() => {
      event.sender.send("nick", {
        name: v.name
      })
    }, 1000)
    
  }).catch((err) => {
    logger.error(err)
    showNotification("Erreur de connexion")
  })
})

function showNotification(title, body="") {
  new Notification({ title: title, body: body }).show()
}

ipcMain.on("notification", (event, args) => {
  showNotification(args.title, args.body)
})

ipcMain.on("launch", (event, args) => {
    extractMods(Number(args.chapter), event).then(() => {
        launcher.launch({
            // clientPackage: clientPackage,
            authorization: auth,
            root: Minecraftpath,
            version: {
                number: version,
                type: "release",
                custom: versionFolder
            },
            memory: {
                max: args.maxMem,
                min: args.minMem
            }
        })
        // launcher.on('debug', (e) => console.log("debug", e));
        // launcher.on('data', (e) => console.log("data", e));
        launcher.on('progress', (e) => {
            event.sender.send("progress", e)
            logger.info(`progress ${e.type} :${e.task} / ${e.total}`)
        })
        launcher.on('arguments', (e) => {
            event.sender.send("launch", e)
            logger.info("launching the game")
            logger.info(e)
        })
        launcher.on('close', (e) => {
            event.sender.send("close", e)
            if(e !== 0){
                logger.warn("Minecraft didn't close properly")
                logger.warn(e)
                showNotification("Une erreur est survenue", "Minecraft ne s'est pas fermé correctement")
            }
        })
    }).catch((err) => {
        showNotification("Impossible de lancer le jeu")
        event.sender.send("close", 1)
        logger.error('Unable to launch the game')
        logger.error(err)
    })
})

ipcMain.on("disconnect", (e) => {
  win.loadFile('src/client/login.html')
})


ipcMain.on("demandModsInformations", (e) => {
    getModsInformations(e)
})

function getModsInformations(event) {
    axios.get("https://altarik.fr/launcher.json").then(o => {
        if(o.status === 200 && o.headers["content-type"] === "application/json") {
            folder = join(process.env.LOCALAPPDATA, "altarik-launcher", "data")
            if(!fs.existsSync(folder))
                fs.mkdirSync(folder)
            fs.writeFileSync(join(folder, "launcher.json"), JSON.stringify(o.data))
            event.sender.send('modsInformations', extractModsInformations(o.data))
        } else {
            event.sender.send('modsInformations', extractModsFromFileSystem())
        }
    }).catch(err => {
        logger.warn("Unable to connect to server")
        logger.warn(err)
        event.sender.send('modsInformations', extractModsFromFileSystem())
    })
}

function extractModsFromFileSystem() {
    content = fs.readFileSync(join(process.env.LOCALAPPDATA, "altarik-launcher/data/launcher.json"))
    if(content !== null) {
        showNotification("Impossible de récupérer certaines informations en ligne", "utilisation des dernières données récupérées")
        return extractModsInformations(JSON.parse(o.data))
    } else {
        showNotification("Impossible de récupérer certaines informations en ligne", "Veuillez réessayez en cliquant sur le bouton")
        logger.error("Unable to get chapters informations from server or filesystem")
        return null
    }
}

function extractModsInformations(json) {
    modsList = json.chapters
    return modsList
}

async function extractMods(chapterId, event) {
    return new Promise(async (resolve, reject) => {
        modsFolder = join(Minecraftpath, "mods")
        shaderFolder = join(Minecraftpath, "shaderpacks")
        if(fs.existsSync(modsFolder))
            fs.rmSync(modsFolder, { recursive: true })
        if(fs.existsSync(shaderFolder))
            fs.rmSync(shaderFolder, { recursive: true })
        for(const i in modsList) {
            if(Number(i) === chapterId) {
                const chapter = modsList[i]
                let j
                for(j in chapter.modspack.mods) {
                    event.sender.send("progress", {type: "mods", task: i, total: chapter.modspack.mods.length })
                    modpackFolder = join(Minecraftpath, "modpack", chapter.title)
                    if(!fs.existsSync(modpackFolder))
                        fs.mkdirSync(modpackFolder, { recursive: true })
                    const path = join(modpackFolder, `modpack${j}.zip`)
                    try {
                        fs.accessSync(path, constants.W_OK)
                        sha1 = await sha1File(path)
                        if(sha1 === chapter.modspack.sha1sum) {
                            await unzipMods(path)
                        } else {
                            await downloadAndExtractMods(chapter.modspack.mods[j], path).catch(err => {
                                reject(err)
                            })
                        }
                    } catch (err) {
                        try {
                            await downloadAndExtractMods(chapter.modspack.mods[j], path)
                        } catch(e) {
                            reject({ err, e })
                            return
                        }
                    }
                }
                event.sender.send("progress", {type: "mods", task: Number(j)+1, total: chapter.modspack.mods.length })
                resolve()
                return
                
            }
        }
        reject("didn't found the correct chapter" + chapter)
        return
    })
}

function downloadMods(link, path) {
    return new Promise((resolve, reject) => {
        axios.get(link, {
            responseType: "stream"
        }).then(res => {
            if(res.status === 200) {
                res.data.pipe(fs.createWriteStream(path));
                res.data.on("end", () => {
                    logger.log("download completed");
                    resolve("download completed")
                });
            } else {
                reject(res.status)
            }
        }).catch(err => {
            reject(err)
        })
    })
}

async function unzipMods(path) {
    return new Promise(async (resolve, reject) => {
        zip(path, { dir: Minecraftpath }).then(() => {
            resolve()
        }).catch(err => {
            reject(err)
        })
        
    })
    
    
}

async function downloadAndExtractMods(link, path) {
    return new Promise(async(resolve, reject) => {
        downloadMods(link, path).then(() => {
            unzipMods(path).then(() => {
                resolve()
            }).catch(err => {
                reject(err)
            })
        }).catch(err => {
            reject(err)
        })
        
    })
}

