import { is } from '@electron-toolkit/utils'
import mlc from 'minecraft-launcher-core'
import fetch from 'node-fetch'
import { hashFile } from 'hasha'
import fs from 'fs'
import { join } from 'path'
import zip from 'extract-zip'
import logger from 'electron-log'
import { Auth, lst } from 'msmc'
import decompress from 'decompress'
import decompressTar from 'decompress-targz'

const { Authenticator, Client } = mlc

export default class Minecraft {
  appdata = process.env.APPDATA || (process.platform === 'darwin' ? process.env.HOME + '/Library/Preferences' : process.env.HOME + '/.local/share')
  localappdata = process.env.LOCALAPPDATA || (process.platform === 'darwin' ? process.env.HOME + '/Library/Application Support/' : process.env.HOME + '/.config')
  minecraftpath = join(this.appdata, '.altarik')
  launcher = new Client()
  auth = null
  modsList = undefined
  showNotification = undefined
  modsInformationsEndpoint = 'https://launcher.altarik.fr'

  setShowNotification (showNotification) {
    this.showNotification = showNotification
  }

  /**
     * @deprecated Mojang removed this method of authentification
     * Used to login through Mojang account
     */
  login (event, win, username, password) {
    this.auth = null
    if (is.dev || password.trim() !== '') {
      this.auth = Authenticator.getAuth(username, password)
      this.auth.then(v => {
        win.loadFile('src/client/index.html')
      }).catch(() => {
        event.sender.send('loginError')
        logger.error("[MJ login] User haven't purchase the game")
        this.showNotification('Erreur de connexion', 'Vous ne possèdez pas de licence Minecraft sur ce compte', 'error')
      })
    } else {
      this.showNotification('Erreur de connexion', 'Veuillez renseignez un mot de passe', 'warning')
    }
  }

  /**
     * Used to login through a Microsoft account
     */
  microsoftLogin (event, win) {
    const authManager = new Auth('select_account')
    authManager.launch('electron').then(async xboxManager => {
      xboxManager.getMinecraft().then(async token => {
        if (!token.isDemo()) {
          this.auth = token.mclc()
          logger.info('[MS login] User has been connected successfully to them account')
          win.loadFile('src/client/index.html')
        } else {
          event.sender.send('loginError')
          logger.error("[MS login] User haven't purchase the game")
          this.showNotification('Erreur de connexion', 'Vous ne possèdez pas de licence Minecraft sur ce compte', 'error')
        }
      }).catch(err => {
        event.sender.send('loginError')
        this.showNotification('Erreur de connexion à Mojang', err, 'error')
        logger.error('[MS login] ' + lst(err))
      })
    }).catch(err => {
      event.sender.send('loginError')
      if (err !== 'error.gui.closed') {
        this.showNotification('Une erreur de connexion à Xbox est survenue', err, 'error')
        logger.error('[MS login] ' + lst(err))
      }
    })
  }

  launch (event, args) {
    this.extractJava(Number(args.chapter), event).then((javaPath) => {
      this.extractMods(Number(args.chapter), event).then((chapter) => {
        this.launcher.launch({
          authorization: this.auth,
          root: this.minecraftpath,
          javaPath,
          version: {
            number: chapter.minecraftVersion,
            type: chapter.type | 'release',
            custom: chapter.customVersion
          },
          memory: {
            max: args.maxMem,
            min: args.minMem
          }
        }).then(v => {
          if (v === null) {
            this.close(event, -1)
          }
        })
        this.launcher.on('debug', (e) => logger.info(`debug: ${e}`))
        this.launcher.on('data', (e) => logger.info(`data: ${e}`))
        this.launcher.on('progress', (e) => {
          event.sender.send('progress', e)
          logger.info(`progress ${e.type} :${e.task} / ${e.total}`)
        })
        this.launcher.on('arguments', (e) => {
          event.sender.send('launch', e)
          logger.info('launching the game')
          logger.info(e)
        })
        this.launcher.on('close', (e) => {
          this.close(event, e)
        })
      }).catch((err) => {
        this.showNotification('Impossible de lancer le jeu', 'Erreur inconnue', 'error')
        event.sender.send('close', 1)
        logger.error('Unable to launch the game')
        logger.error(err)
      })
    }).catch(err => {
      this.showNotification('Impossible de lancer le jeu', "Impossible d'installer Java pour votre configuration", 'error')
      event.sender.send('close', 1)
      logger.warn('Unable to install java')
      logger.warn(err)
    })
  }

  close (event, code) {
    event.sender.send('close', code)
    if (code !== 0) {
      logger.warn("Minecraft didn't close properly")
      logger.warn(code)
      this.showNotification('Une erreur est survenue', "Minecraft ne s'est pas fermé correctement", 'error')
    }
  }

  getModsInformations (event) {
    fetch(this.modsInformationsEndpoint).then(response => {
      if (response.ok) {
        response.json().then(data => {
          const folder = join(this.localappdata, 'altarik-launcher', 'data')
          if (!fs.existsSync(folder)) { fs.mkdirSync(folder, { recursive: true }) }
          const file = join(folder, 'launcher.json')
          if (fs.existsSync(file)) { fs.rmSync(file) }
          fs.writeFileSync(file, JSON.stringify(data))
          event.sender.send('modsInformations', this.extractModsInformations(data))
        }).catch(err => {
          event.sender.send('modsInformations', this.extractModsFromFileSystem())
          logger.warn(err)
          logger.warn('An error occured while trying to connect to server')
        })
      } else {
        logger.warn('Unable to connect to server')
        logger.warn(response.status)
        event.sender.send('modsInformations', this.extractModsFromFileSystem())
      }
    }).catch(err => {
      logger.warn('Unable to connect to server')
      logger.warn(err)
      event.sender.send('modsInformations', this.extractModsFromFileSystem())
    })
  }

  extractModsFromFileSystem () {
    const filepath = join(this.localappdata, 'altarik-launcher/data/launcher.json')
    if (fs.existsSync(filepath)) {
      const content = fs.readFileSync(filepath)
      if (content !== null) {
        this.showNotification('Impossible de récupérer certaines informations en ligne', 'utilisation des dernières données récupérées', 'warning')
        return this.extractModsInformations(JSON.parse(content))
      } else {
        this.showNotification('Impossible de récupérer certaines informations en ligne', 'Veuillez réessayez en cliquant sur le bouton', 'warning')
        logger.error('Unable to get chapters informations from server or filesystem')
        return null
      }
    } else {
      return null
    }
  }

  extractModsInformations (json) {
    this.modsList = json.chapters
    return this.modsList
  }

  async extractMods (chapterId, event) {
    return new Promise((resolve, reject) => {
      const modsFolder = join(this.minecraftpath, 'mods')
      // const shaderFolder = join(this.minecraftpath, 'shaderpacks')
      if (fs.existsSync(modsFolder)) { fs.rmSync(modsFolder, { recursive: true }) }
      // if (fs.existsSync(shaderFolder)) { fs.rmSync(shaderFolder, { recursive: true }) }
      for (const i in this.modsList) {
        if (Number(i) === chapterId) {
          const chapter = this.modsList[i]
          for (const j in chapter.modspack.mods) {
            event.sender.send('progress', { type: 'mods', task: 0, total: chapter.modspack.mods.length })
            const modpackFolder = join(this.minecraftpath, 'modpack', chapter.title)
            if (!fs.existsSync(modpackFolder)) { fs.mkdirSync(modpackFolder, { recursive: true }) }
            const path = join(modpackFolder, `modpack${j}.zip`)
            try {
              fs.accessSync(path, fs.W_OK)
              hashFile(path, { algorithm: 'sha1' }).then(sha1 => {
                if (sha1 === chapter.modspack.sha1sum[j]) {
                  this.unzipMods(path).catch(err => {
                    reject(err)
                  })
                } else {
                  logger.warn(`sha1sum ${sha1} don't correspond to ${chapter.modspack.sha1sum[j]} of mods ${path}`)
                  this.downloadAndExtractMods(chapter.modspack.mods[j], path).catch(err => {
                    reject(err)
                  })
                }
              }).catch(err => {
                reject(new Error('Can obtain md5 hash of file ' + path + ': ' + err))
              })
              event.sender.send('progress', { type: 'mods', task: Number(j) + 1, total: chapter.modspack.mods.length })
            } catch (err) {
              this.downloadAndExtractMods(chapter.modspack.mods[j], path).catch(err => {
                reject(err)
              })
            }
          }
          resolve(chapter)
          return
        }
      }
      reject(new Error("didn't found the correct chapter" + chapterId))
    })
  }

  downloadMods (link, path) {
    return new Promise((resolve, reject) => {
      fetch(link).then(response => {
        if (response.ok) {
          if (fs.existsSync(path)) { fs.rmSync(path) }
          const dest = fs.createWriteStream(path)
          response.body.pipe(dest)
          response.body.on('end', () => {
            logger.log('download completed')
            resolve('download completed')
          })
          dest.on('error', () => {
            reject(new Error('An error appenned when using stream'))
          })
        } else {
          reject(response.status)
        }
      }).catch(err => {
        reject(err)
      })
    })
  }

  async unzipMods (zipLocation, outLocation = this.minecraftpath) {
    return new Promise((resolve, reject) => {
      logger.info(`unzipping ${zipLocation} file to ${outLocation}`)
      zip(zipLocation, { dir: outLocation }).then(() => {
        resolve()
      }).catch(err => {
        logger.error('failed to unzip file')
        reject(err)
      })
    })
  }

  async extractTar (tarLocation, outLocation = this.microsoftpath) {
    return new Promise((resolve, reject) => {
      logger.info(`Extracting targz ${tarLocation} file to ${outLocation}`)
      decompress(tarLocation, outLocation, {
        plugins: [
          decompressTar()
        ]
      }).then(() => {
        resolve()
      }).catch((e) => {
        logger.error('Failed to extract targz file')
        reject(e)
      })
    })
  }

  async downloadAndExtractMods (link, path) {
    return new Promise((resolve, reject) => {
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

  async extractJava (chapterId, event) {
    return new Promise((resolve, reject) => {
      const runtime = join(this.minecraftpath, 'runtime')
      if (this.modsList[chapterId].java.platform[process.platform] !== undefined &&
            this.modsList[chapterId].java.platform[process.platform][process.arch] !== undefined) {
        event.sender.send('progress', { type: 'java', task: 0, total: 1 })
        const infos = this.modsList[chapterId].java.platform[process.platform][process.arch]
        const jre = join(runtime, infos.name)
        const downloadFolder = join(runtime, 'download')
        const downloadFile = join(downloadFolder, `${infos.name}.zip`)
        if (fs.existsSync(jre)) { fs.rmSync(jre, { recursive: true }) }
        if (!fs.existsSync(downloadFolder)) { fs.mkdirSync(downloadFolder, { recursive: true }) }
        if (fs.existsSync(downloadFile)) {
          hashFile(downloadFile, { algorithm: 'sha256' }).then(sha1 => {
            if (sha1 === infos.sha256sum) {
              this.extractJavaArchive(downloadFile, runtime).then(() => {
                const filename = process.platform === 'win32' ? 'java.exe' : 'java'
                resolve(join(jre, 'bin', filename))
              }).catch(err => {
                reject(err)
              })
            } else {
              logger.warn(`java sha256sum ${sha1} don't correspond to ${infos.sha256sum}`)
              this.downloadAndExtractJava(infos, downloadFolder, runtime).then(() => resolve(join(jre, 'bin', process.platform === 'win32' ? 'java.exe' : 'java'))).catch(err => reject(err))
            }
          }).catch(err => {
            reject(err)
          })
        } else {
          this.downloadAndExtractJava(infos, downloadFolder, runtime).then(() => resolve(join(jre, 'bin', process.platform === 'win32' ? 'java.exe' : 'java'))).catch(err => reject(err))
        }
        event.sender.send('progress', { type: 'java', task: 1, total: 1 })
      } else {
        reject(new Error('There is not available version for this system'))
      }
    })
  }

  async downloadAndExtractJava (infos, downloadFolder, runtimeFolder) {
    return new Promise((resolve, reject) => {
      logger.info(`Downloading ${infos.name}`)
      this.downloadMods(infos.link, join(downloadFolder, `${infos.name}.zip`)).then(() => {
        logger.info('download completed')
        this.extractJavaArchive(join(downloadFolder, `${infos.name}.zip`), runtimeFolder).then(() => {
          logger.info('File unzipped')
          resolve()
        }).catch(err => {
          const joinS = join(downloadFolder, `${infos.name}.zip`)
          logger.info(`Failed to unzip ${joinS}`)
          reject(err)
        })
      }).catch(err => {
        logger.err(`Failed to download ${infos.link} to ${infos.name}.zip`)
        reject(err)
      })
    })
  }

  async extractJavaArchive (zipLocation, outLocation) {
    if (process.platform === 'win32') {
      await this.unzipMods(zipLocation, outLocation)
    } else {
      await this.extractTar(zipLocation, outLocation)
    }
  }

  invalidateData (event) {
    logger.info('invalidate game data...')
    const assets = join(this.minecraftpath, 'assets')
    const librairies = join(this.minecraftpath, 'libraries')
    const natives = join(this.minecraftpath, 'natives')
    const versions = join(this.minecraftpath, 'versions')
    if (fs.existsSync(assets)) { fs.rmSync(assets, { recursive: true }) }
    if (fs.existsSync(librairies)) { fs.rmSync(librairies, { recursive: true }) }
    if (fs.existsSync(natives)) { fs.rmSync(natives, { recursive: true }) }
    if (fs.existsSync(versions)) { fs.rmSync(versions, { recursive: true }) }
    logger.info('Game data invalidated')
    event.sender.send('invalidated')
  }
}
