const vue = require('vue/dist/vue.cjs.js')
app = vue.createApp({
    data() {
        return {
            displayFullscreen: "block",
            fullscreenText: "Recherche de mise à jour..."
        }
    },
    mounted() {
        this.sendCheckingUpdate()
    },
    methods: {
        sendCheckingUpdate() {
            ipcRenderer.send("checking-update");
        }
    },
});

app.mount("#vue");

ipcRenderer.on("update-available", (event, arg) => {
    app.fullscreenText = "Mise à jour disponible, téléchargement..."
});