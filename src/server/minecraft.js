const isDev = require('electron-is-dev')
const { Client, Authenticator } = require('minecraft-launcher-core')
const axios = require('axios').default
const sha1File = require('sha1-file')
const fs = require('fs')
const { join } = require('path')
const constants = require("constants")
const zip = require('extract-zip')
const logger = require('electron-log')

class Minecraft {

    appdata = process.env.APPDATA || (process.platform == 'darwin' ? process.env.HOME + '/Library/Preferences' : process.env.HOME + "/.local/share")
    minecraftpath = join(this.appdata, ".altarik")
    launcher = new Client()
    auth = null
    modsList = undefined
    jre8 = "https://github.com/AdoptOpenJDK/openjdk8-binaries/releases/download/jdk8u292-b10/OpenJDK8U-jre_x64_windows_hotspot_8u292b10.zip"

    login(event, win, showNotification, username, password) {
        this.auth = null
        if(isDev || password.trim() !== "") {
            this.auth = Authenticator.getAuth(username, password)
            this.auth.then(v => {
                win.loadFile('src/client/index.html').then(() => {
                    event.sender.send("nick", { name: v.name })
                })
            }).catch((err) => {
                logger.error(err)
                showNotification("Erreur de connexion")
            })
        } else {
            showNotification("Veuillez renseignez un mot de passe")
        }
    }

    launch(event, args) {
        this.extractMods(Number(args.chapter), event).then((chapter) => {
            this.launcher.launch({
                authorization: this.auth,
                root: this.minecraftpath,
                version: {
                    number: chapter.minecraftVersion,
                    type: "release",
                    custom: chapter.customVersion
                },
                memory: {
                    max: args.maxMem,
                    min: args.minMem
                }
            })
            // this.launcher.on('debug', (e) => console.log("debug", e));
            // this.launcher.on('data', (e) => console.log("data", e));
            this.launcher.on('progress', (e) => {
                event.sender.send("progress", e)
                logger.info(`progress ${e.type} :${e.task} / ${e.total}`)
            })
            this.launcher.on('arguments', (e) => {
                event.sender.send("launch", e)
                logger.info("launching the game")
                logger.info(e)
            })
            this.launcher.on('close', (e) => {
                event.sender.send("close", e)
                if(e !== 0) {
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
    }

    getModsInformations(event) {
        axios.get("https://altarik.fr/launcher.json").then(o => {
            if(o.status === 200 && o.headers["content-type"] === "application/json") {
                let folder = join(process.env.LOCALAPPDATA, "altarik-launcher", "data")
                if(!fs.existsSync(folder))
                    fs.mkdirSync(folder)
                fs.writeFileSync(join(folder, "launcher.json"), JSON.stringify(o.data))
                event.sender.send('modsInformations', this.extractModsInformations(o.data))
            } else {
                event.sender.send('modsInformations', this.extractModsFromFileSystem())
            }
        }).catch(err => {
            logger.warn("Unable to connect to server")
            logger.warn(err)
            event.sender.send('modsInformations', this.extractModsFromFileSystem())
        })
    }
    
    extractModsFromFileSystem() {
        content = fs.readFileSync(join(process.env.LOCALAPPDATA, "altarik-launcher/data/launcher.json"))
        if(content !== null) {
            showNotification("Impossible de récupérer certaines informations en ligne", "utilisation des dernières données récupérées")
            return this.extractModsInformations(JSON.parse(content))
        } else {
            showNotification("Impossible de récupérer certaines informations en ligne", "Veuillez réessayez en cliquant sur le bouton")
            logger.error("Unable to get chapters informations from server or filesystem")
            return null
        }
    }
    
    extractModsInformations(json) {
        this.modsList = json.chapters
        return this.modsList
    }
    
    async extractMods(chapterId, event) {
        return new Promise(async (resolve, reject) => {
            const modsFolder = join(this.minecraftpath, "mods")
            const shaderFolder = join(this.minecraftpath, "shaderpacks")
            if(fs.existsSync(modsFolder))
                fs.rmSync(modsFolder, { recursive: true })
            if(fs.existsSync(shaderFolder))
                fs.rmSync(shaderFolder, { recursive: true })
            for(const i in this.modsList) {
                if(Number(i) === chapterId) {
                    const chapter = this.modsList[i]
                    for(let j in chapter.modspack.mods) {
                        event.sender.send("progress", {type: "mods", task: i, total: chapter.modspack.mods.length })
                        let modpackFolder = join(this.minecraftpath, "modpack", chapter.title)
                        if(!fs.existsSync(modpackFolder))
                            fs.mkdirSync(modpackFolder, { recursive: true })
                        const path = join(modpackFolder, `modpack${j}.zip`)
                        try {
                            fs.accessSync(path, constants.W_OK)
                            let sha1 = await sha1File(path)
                            if(sha1 === chapter.modspack.sha1sum[j]) {
                                await this.unzipMods(path).catch(err => {
                                    reject(err)
                                    return
                                })
                            } else {
                                logger.warn(`sha1sum ${sha1} don't correspond to ${chapter.modspack.sha1sum[j]} of mods ${path}`)
                                await this.downloadAndExtractMods(chapter.modspack.mods[j], path).catch(err => {
                                    reject(err)
                                    return
                                })
                            }
                            event.sender.send("progress", {type: "mods", task: Number(j)+1, total: chapter.modspack.mods.length })
                        } catch (err) {
                            try {
                                await this.downloadAndExtractMods(chapter.modspack.mods[j], path)
                            } catch(e) {
                                reject({ err, e })
                                return
                            }
                        }
                    }
                    resolve(chapter)
                    return
                    
                }
            }
            reject("didn't found the correct chapter" + chapter)
            return
        })
    }
    
    downloadMods(link, path) {
        return new Promise((resolve, reject) => {
            axios.get(link, {
                responseType: "stream"
            }).then(res => {
                if(res.status === 200) {
                    fs.rmSync(path)
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
    
    async unzipMods(path) {
        return new Promise(async (resolve, reject) => {
            zip(path, { dir: this.minecraftpath }).then(() => {
                resolve()
            }).catch(err => {
                reject(err)
            })
            
        })
        
    }
    
    async downloadAndExtractMods(link, path) {
        return new Promise(async(resolve, reject) => {
            this.downloadMods(link, path).then(() => {
                this.unzipMods(path).then(() => {
                    resolve()
                }).catch(err => {
                    reject(err)
                })
            }).catch(err => {
                reject(err)
            })
            
        })
    }
}

module.exports = new Minecraft