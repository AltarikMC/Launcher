const os = require('os')
const totalMem = os.totalmem() / (1.049 * Math.pow(10, 6))
const vue = require('vue/dist/vue.cjs.js')

app = vue.createApp({
  data () {
    return {
      minMemValue: localStorage.getItem('minMem') != null ? localStorage.getItem('minMem') : 1024,
      maxMemValue: localStorage.getItem('maxMem') != null ? localStorage.getItem('maxMem') : 2048,
      memStep: 128,
      memMax: totalMem,
      invalidateButtonText: 'Supprimer et retélécharger les bibliothèques',
      invalidateButtonDisabled: false,
      displayFullscreen: 'none',
      displaySettings: 'none',
      displayCredits: 'none',
      nick: 'Chargement',
      launchBtnText: 'Selectionnez un chapitre',
      launchBtnDisable: true,
      launchBtnHidden: false,
      loadingMessageHidden: true,
      loadingMessageText: 'Téléchargement de Minecraft en cours...',
      fullprogressbarHidden: true,
      progressbarWidth: 0,
      sidebarContent: '<hr><p>Chargement en cours</p>',
      modsInformations: [],
      modsInformationsLoaded: true,
      selectedChapter: -1,
      gameLaunching: false
    }
  },
  mounted () {
    iziToast.settings({
      close: false,
      closeOnClick: true,
      timeout: 5000,
      position: 'topRight',
      resetOnHover: true
    })
    setTimeout(() => {
      ipcRenderer.send('pageReady')
    }, 500)
  },
  methods: {
    invalidateData () {
      this.invalidateButtonDisabled = true
      this.invalidateButtonText = 'Opération en cours'
      this.showInfo('Opération en cours', 'Suppression des données du jeu en cours')
      ipcRenderer.send('invalidateData')
    },
    launchBtnClick () {
      this.launchBtnHidden = true
      this.fullprogressbarHidden = false
      this.loadingMessageHidden = false
      if (Number(this.minMemValue) <= Number(this.maxMemValue)) {
        ipcRenderer.send('launch', {
          minMem: this.minMemValue + 'M',
          maxMem: this.maxMemValue + 'M',
          chapter: this.selectedChapter
        })
        this.launchBtnDisable = true
        localStorage.setItem('minMem', this.minMemValue)
        localStorage.setItem('maxMem', this.maxMemValue)
        this.gameLaunching = true
      } else {
        this.showError('Erreur de lancement', 'La mémoire minimale doit être inférieure ou égale à la mémoire maximale.')
      }
    },
    changeSelectedChapter (index) {
      this.selectedChapter = parseInt(index)
      root.launchBtnText = 'JOUER'
      root.launchBtnDisable = false
    },
    disconnectBtn () {
      ipcRenderer.send('disconnect')
    },
    options () {
      if (!this.gameLaunching) {
        this.displayFullscreen = 'block'
        this.displaySettings = 'block'
        this.displayCredits = 'none'
      }
    },
    discord () {
      shell.openExternal('https://discord.gg/p3EnE6Jumg')
    },
    web () {
      shell.openExternal('https://altarik.fr')
    },
    closeFullscreen () {
      this.displayFullscreen = 'none'
      this.displaySettings = 'none'
      this.displayCredits = 'none'
    },
    credits () {
      this.displayFullscreen = 'block'
      this.displaySettings = 'none'
      this.displayCredits = 'block'
    },
    updateModsInformations (content) {
      if(content === null) {
        this.modsInformations = []
      } else {
        this.modsInformations = content
      }
    },
    getModsInformations () {
      return this.modsInformations
    },
    reloadChapters() {
      this.updateModsInformations(null)
      this.modsInformationsLoaded = true
      ipcRenderer.send('pageReady')
    },
    showInfo (title, body) {
      iziToast.info({
        title,
        message: body,
        color: 'blue'
      })
    },
    showError (title, body) {
      iziToast.error({
        title,
        message: body,
        color: 'red'
      })
    },
    showWarning (title, body) {
      iziToast.warning({
        title,
        message: body,
        color: 'yellow'
      })
    },
    showSuccess (title, body) {
      iziToast.success({
        title,
        message: body,
        color: 'green'
      })
    },
    isSelected (index) {
      return this.selectedChapter === index
    }
  }
})

const root = app.mount('#vue')

ipcRenderer.on('invalidated', () => {
  root.invalidateButtonDisabled = false
  root.invalidateButtonText = 'Supprimer et retélécharger les bibliothèques'
  root.showSuccess('Opération terminée', 'Les données du jeu ont été supprimé avec succès')
})

ipcRenderer.on('progress', (e, args) => {
  root.progressbarWidth = (args.task / Math.max(args.total, args.task)) * 100
  root.loadingMessageText = 'Téléchargement de ' + args.type + ': ' + args.task + ' sur ' + Math.max(args.total, args.task)
})

ipcRenderer.on('close', (_e, _args) => {
  root.launchBtnHidden = false
  root.fullprogressbarHidden = true
  root.loadingMessageHidden = true
  root.loadingMessageText = 'Chargement de Minecraft en cours...'
  root.progressbarWidth = 0
  root.launchBtnDisable = false
  root.gameLaunching = false
})

ipcRenderer.on('launch', (_e, _args) => {
  root.fullprogressbarHidden = true
  root.loadingMessageHidden = true
})

ipcRenderer.on('modsInformations', (_e, args) => {
  if (args === null) {
    root.modsInformationsLoaded = false
  } else {
    root.modsInformationsLoaded = true
  }
  root.updateModsInformations(args)
})

ipcRenderer.on('nick', (_e, args) => root.nick = args.name)
