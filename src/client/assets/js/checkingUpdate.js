const vue = require('vue/dist/vue.cjs.js')
app = vue.createApp({
    data() {
        return {
            displayFullscreen: "block",
            fullscreenText: "Checking for updates..."
        }
    },
    mounted() {
    },
    methods: {
        sendCheckingUpdate() {
            ipcRenderer.send("checking-update");
        },
        closeFullscreen () {
            this.displayFullscreen = "none"
        }
    },
});

app.mount("#vue");

ipcRenderer.on("update-available", (event, arg) => {
    this.fullscreenText = "Mise à jour disponible, téléchargement..."
});