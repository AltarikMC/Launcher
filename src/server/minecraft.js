const isDev = require('electron-is-dev')
const { Client, Authenticator } = require('minecraft-launcher-core')
const axios = require('axios').default
const hasha = require('hasha');
const fs = require('fs')
const { join } = require('path')
const constants = require("constants")
const zip = require('extract-zip')
const logger = require('electron-log')
const msmc = require('msmc')

class Minecraft {

    appdata = process.env.APPDATA || (process.platform === 'darwin' ? process.env.HOME + '/Library/Preferences' : process.env.HOME + "/.local/share")
    minecraftpath = join(this.appdata, ".altarik")
    launcher = new Client()
    auth = null
    modsList = undefined
    showNotification = undefined

    setShowNotification(showNotification) {
        this.showNotification = showNotification
    }

    /**
     * Used to login through Mojang account
     */
    login(event, win, username, password) {
        this.auth = null
        if(isDev || password.trim() !== "") {
            this.auth = Authenticator.getAuth(username, password)
            this.auth.then(v => {
                win.loadFile('src/client/index.html').then(() => {
                    event.sender.send("nick", { name: v.name })
                })
            }).catch(() => {
                event.sender.send("loginError")
                logger.error("[MJ login] User haven't purchase the game")
                this.showNotification("Erreur de connexion", "Vous ne possèdez pas de licence Minecraft sur ce compte", "error")
            })
        } else {
            this.showNotification("Erreur de connexion", "Veuillez renseignez un mot de passe", "warning")
        }
    }

    /**
     * Used to login through a Microsoft account
     */
    microsoftLogin(event, win) {
        msmc.fastLaunch("electron",
        (update) => {
            switch (update.type) {
                case "Error":
                    event.sender.send("loginError")
                    this.showNotification("Une erreur est survenue", update.data, "error")
                    logger.error("MC-Account error:", update.data);
                  break;
              }
        }).then(result => {
            if(msmc.errorCheck(result)) {
                event.sender.send("loginError")
                logger.error(result.reason)
                this.showNotification("Erreur de connexion", result.reason, "error")
            } else {
                if(!msmc.isDemoUser(result)) {
                    this.auth = msmc.getMCLC().getAuth(result)
                    win.loadFile('src/client/index.html').then(() => {
                        event.sender.send("nick", { name: this.auth.name })
                    })
                } else {
                    event.sender.send("loginError")
                    logger.error("[MS login] User haven't purchase the game")
                    this.showNotification("Erreur de connexion", "Vous ne possèdez pas de licence Minecraft sur ce compte", "error")
                }
            }
        }).catch(reason => {
            event.sender.send("loginError")
            logger.error(reason)
            this.showNotification("Erreur de connexion", "Erreur inconnue", "error")
        })
    }

    launch(event, args) {
        this.extractJava(Number(args.chapter), event).then((javaPath) => {
            this.extractMods(Number(args.chapter), event).then((chapter) => {
                this.launcher.launch({
                    authorization: this.auth,
                    root: this.minecraftpath,
                    javaPath: javaPath,
                    version: {
                        number: chapter.minecraftVersion,
                        type: chapter.type | "release",
                        custom: chapter.customVersion
                    },
                    memory: {
                        max: args.maxMem,
                        min: args.minMem
                    }
                })
                this.launcher.on('debug', (e) => logger.info(`debug: ${e}`));
                this.launcher.on('data', (e) => logger.info(`data: ${e}`));
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
                        this.showNotification("Une erreur est survenue", "Minecraft ne s'est pas fermé correctement", "error")
                    }
                })
            }).catch((err) => {
                this.showNotification("Impossible de lancer le jeu", "Erreur inconnue", "error")
                event.sender.send("close", 1)
                logger.error('Unable to launch the game')
                logger.error(err)
            })
        }).catch(err => {
            this.showNotification("Impossible de lancer le jeu", "Impossible d'installer Java pour votre configuration", "error")
            event.sender.send("close", 1)
            logger.warn("Unable to install java")
            logger.warn(err)
        })
        
    }

    getModsInformations(event) {
        axios.get("https://altarik.fr/launcher.json").then(o => {
            if(o.status === 200 && o.headers["content-type"] === "application/json") {
                let folder = join(process.env.LOCALAPPDATA, "altarik-launcher", "data")
                if(!fs.existsSync(folder))
                    fs.mkdirSync(folder)
                let file = join(folder, "launcher.json")
                if(fs.existsSync(file))
                    fs.rmSync(file)
                fs.writeFileSync(file, JSON.stringify(o.data))
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
        let filepath = join(process.env.LOCALAPPDATA, "altarik-launcher/data/launcher.json")
        if(fs.existsSync(filepath)) {
            let content = fs.readFileSync(filepath)
            if(content !== null) {
                this.showNotification("Impossible de récupérer certaines informations en ligne", "utilisation des dernières données récupérées", "warning")
                return this.extractModsInformations(JSON.parse(content))
            } else {
                this.showNotification("Impossible de récupérer certaines informations en ligne", "Veuillez réessayez en cliquant sur le bouton", "warning")
                logger.error("Unable to get chapters informations from server or filesystem")
                return null
            }
        } else {
            return null;
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
                        event.sender.send("progress", {type: "mods", task: 0, total: chapter.modspack.mods.length })
                        let modpackFolder = join(this.minecraftpath, "modpack", chapter.title)
                        if(!fs.existsSync(modpackFolder))
                            fs.mkdirSync(modpackFolder, { recursive: true })
                        const path = join(modpackFolder, `modpack${j}.zip`)
                        try {
                            fs.accessSync(path, constants.W_OK)
                            let sha1 = await hasha.fromFile(path, {algorithm: 'sha1'})
                            if(sha1 === chapter.modspack.sha1sum[j]) {
                                await this.unzipMods(path).catch(err => {
                                    reject(err)
                                })
                            } else {
                                logger.warn(`sha1sum ${sha1} don't correspond to ${chapter.modspack.sha1sum[j]} of mods ${path}`)
                                await this.downloadAndExtractMods(chapter.modspack.mods[j], path).catch(err => {
                                    reject(err)
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
        })
    }
    
    downloadMods(link, path) {
        return new Promise((resolve, reject) => {
            axios.get(link, {responseType: "stream"}).then(res => {
                if(res.status === 200) {
                    if(fs.existsSync(path))
                        fs.rmSync(path)
                    res.data.pipe(fs.createWriteStream(path));
                    res.data.on("end", () => {
                        logger.log("download completed");
                        resolve("download completed")
                    })
                } else {
                    reject(res.status)
                }
            }).catch(err => {
                reject(err)
            })
        })
    }
    
    async unzipMods(zipLocation, outLocation=this.minecraftpath) {
        return new Promise(async (resolve, reject) => {
            logger.info(`unzipping ${zipLocation} file to ${outLocation}`)
            zip(zipLocation, { dir: outLocation }).then(() => {
                resolve()
            }).catch(err => {
                logger.err(`failed to unzip file`)
                reject(err)
            })
            
        })
        
    }
    
    async downloadAndExtractMods(link, path) {
        return new Promise(async (resolve, reject) => {
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

    async extractJava(chapterId, event) {
        return new Promise(async (resolve, reject) => {
            const runtime = join(this.minecraftpath, "runtime")
            if(this.modsList[chapterId].java.platform[process.platform][process.arch] !== undefined) {
                event.sender.send("progress", {type: "java", task: 0, total: 1 })
                const infos = this.modsList[chapterId].java.platform[process.platform][process.arch]
                const jre = join(runtime, infos.name)
                const downloadFolder = join(runtime, "download")
                const downloadFile = join(downloadFolder, `${infos.name}.zip`)
                if(fs.existsSync(jre))
                    fs.rmSync(jre, { recursive: true })
                if(!fs.existsSync(downloadFolder))
                    fs.mkdirSync(downloadFolder, { recursive: true })
                if(fs.existsSync(downloadFile)) {
                    let sha1 = await hasha.fromFile(downloadFile, {algorithm: 'sha256'})
                    if(sha1 === infos.sha256sum) {
                        await this.unzipMods(downloadFile, runtime)
                        resolve(join(jre, 'bin', 'java.exe'))
                    } else {
                        logger.warn(`java sha256sum ${sha1} don't correspond to ${infos.sha256sum}`)
                        await this.downloadAndExtractJava(infos, downloadFolder, runtime).then(() => resolve(join(jre, 'bin', 'java.exe'))).catch(err => reject(err))
                    }
                } else {
                    await this.downloadAndExtractJava(infos, downloadFolder, runtime).then(() => resolve(join(jre, 'bin', 'java.exe'))).catch(err => reject(err))
                }
                event.sender.send("progress", {type: "java", task: 1, total: 1 })
            } else {
                reject("There is not available version for this system")
            }
        })
    }

    async downloadAndExtractJava(infos, downloadFolder, runtimeFolder) {
        return new Promise((resolve, reject) => {
            logger.info(`Downloading ${infos.name}`)
            this.downloadMods(infos.link, join(downloadFolder, `${infos.name}.zip`)).then(() => {
                logger.info(`download completed`)
                this.unzipMods(join(downloadFolder, `${infos.name}.zip`), runtimeFolder).then(() => {
                    logger.info(`File unzipped`)
                    resolve()
                }).catch(err => {
                    logger.info(`Failed to unzip ${join(downloadFolder, `${infos.name}.zip`)}`)
                    reject(err)
                })
            }).catch(err => {
                logger.err(`Download failed`)
                reject(err)
            })
        })
    }

    invalidateData(event) {
        logger.info("invalidate game data...")
        const assets = join(this.minecraftpath, 'assets')
        const librairies = join(this.minecraftpath,'libraries')
        const natives = join(this.minecraftpath, 'natives')
        if(fs.existsSync(assets))
            fs.rmdirSync(assets, { recursive: true })
        if(fs.existsSync(librairies))
            fs.rmdirSync(librairies, { recursive: true })
        if(fs.existsSync(natives))
            fs.rmdirSync(natives, { recursive: true })
        logger.info("Game data invalidated")
        event.sender.send("invalidated")
    }
}

module.exports = new Minecraft