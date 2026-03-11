const vue = require('vue/dist/vue.cjs.js')
const path = require('path')
const { setApp, ipcRenderer, shell } = require(path.join(__dirname, 'assets/js/preload.js'))
const app = vue.createApp({
  data () {
    return {
      displayFullscreen: 'block',
      fullscreenText: 'Recherche de mise à jour...',
      downloadLink: null
    }
  },
  mounted () {
    this.sendCheckingUpdate()
  },
  methods: {
    sendCheckingUpdate () {
      ipcRenderer.send('checking-update')
    },
    openLinkExternal () {
      shell.openExternal(this.downloadLink)
    }
  }
})
setApp(app)

const root = app.mount('#vue')

ipcRenderer.on('update-available', (event, arg) => {
  root.fullscreenText = 'Mise à jour disponible, téléchargement...'
})

ipcRenderer.on('please-download-update', (event, args) => {
  root.fullscreenText = 'Veuillez télécharger la mise à jour en cliquant sur le lien suivant :'
  root.downloadLink = `${args.url}`
})
