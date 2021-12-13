const os = require('os')
const totalMem = os.totalmem() / (1.049 * Math.pow(10, 6))

let app = new vue({
    el: "#vue",
    data: {
        minMemValue: localStorage.getItem("minMem") != null ? localStorage.getItem("minMem") : 1024 ,
        maxMemValue: localStorage.getItem("maxMem") != null ? localStorage.getItem("maxMem") : 2048,
        memStep: 128,
        memMax: totalMem,
        invalidateButtonText: "Supprimer et retélécharger les bibliothèques",
        invalidateButtonDisabled: false,
        displayFullscreen: "none",
        nick: "Chargement",
        launchBtnText: "Selectionnez un chapitre",
        launchBtnDisable: true,
        launchBtnHidden: false,
        loadingMessageHidden: true,
        loadingMessageText: "Téléchargement de Minecraft en cours...",
        fullprogressbarHidden: true,
        progressbarWidth: 0,
        sidebarContent: "<hr><p>Chargement en cours</p>",
        notificationTitle: "",
        notificationMessage: ""
    },
    mounted: function () {
        this.demandModsInformations()
        iziToast.settings({
            close: false,
            closeOnClick: true,
            timeout: 5000,
            position: 'topRight',
            resetOnHover: true,
        })
    },
    methods: {
        invalidateData: function () {
            this.invalidateButtonDisabled = true
            this.invalidateButtonText = "Opération en cours"
            this.notificationTitle = "Opération en cours"
            this.notificationMessage = "Suppression des données du jeu en cours"
            this.showInfo()
            ipcRenderer.send('invalidateData')
        },
        launchBtnClick: function () {
            this.launchBtnHidden = true
            this.fullprogressbarHidden = false
            app.loadingMessageHidden = false
            if(Number(this.minMemValue) <= Number(this.maxMemValue)){
                ipcRenderer.send('launch', {
                    minMem: this.minMemValue + "M",
                    maxMem: this.maxMemValue + "M",
                    chapter: selectedChapter
                })
                app.launchBtnDisable = true
                localStorage.setItem("minMem", this.minMemValue)
                localStorage.setItem("maxMem", this.maxMemValue)
                gameLaunching = true
            } else{
                app.notificationTitle = "Erreur de lancement"
                app.notificationMessage = "La mémoire minimale doit être inférieure ou égale à la mémoire maximale."
                this.showError()
            }
        },
        disconnectBtn: function () {
            ipcRenderer.send('disconnect')
        },
        options: function () {
            if(!gameLaunching)
                this.displayFullscreen = "block"
        },
        discord: () => shell.openExternal("https://discord.gg/b923tMhmRE"),
        web: () => shell.openExternal("https://altarik.fr"),
        closeFullscreen: function () {
            this.displayFullscreen = "none"
        },
        demandModsInformations: function () {
            ipcRenderer.send('demandModsInformations')
        },
        showInfo: function () {
            iziToast.info({
                title: this.notificationTitle,
                message: this.notificationMessage,
            })
        },
        showError: function() {
            iziToast.show({
                title: this.notificationTitle,
                message: this.notificationMessage,
                color: 'red'

            })
        },
        showWarning: function() {
            iziToast.warning({
                title: this.notificationTitle,
                message: this.notificationMessage,
            })
        },
        showSuccess: function () {
            iziToast.success({
                title: this.notificationTitle,
                message: this.notificationMessage,
            })
        }
    }
})
let gameLaunching = false

let selectedChapter = -1;

ipcRenderer.on("nick", (_, args) => app.nick = args.name)

ipcRenderer.on("invalidated", () => {
    app.invalidateButtonDisabled = false
    app.invalidateButtonText = "Supprimer et retélécharger les bibliothèques"
    app.notificationTitle = "Opération terminée"
    app.notificationMessage = "Les données du jeu ont été supprimé avec succès"
    app.showSuccess()
})

ipcRenderer.on("progress", (e, args) => {
    app.progressbarWidth =  (args.task / Math.max(args.total, args.task)) * 100
    app.loadingMessageText =  "Téléchargement de " + args.type + ": " + args.task + " sur " + Math.max(args.total, args.task)
})

ipcRenderer.on("close", (_e, _args) => {
    app.launchBtnHidden = false
    app.fullprogressbarHidden = true
    app.loadingMessageHidden = true
    app.loadingMessageText = "Chargement de Minecraft en cours..."
    app.progressbarWidth = 0
    app.launchBtnDisable = false
    gameLaunching = false
})

ipcRenderer.on('launch', (_e, _args) => {
    app.fullprogressbarHidden = true
    app.loadingMessageHidden = true
})

ipcRenderer.on("modsInformations", (e, args) => {
    console.log(args)
    if(args === null) {
        app.sidebarContent = "<hr><p>Une erreur est survenue lors de la récupération des informations, vérifiez votre connexion internet puis cliquez sur réessayez</p>"
        + "<button onclick=\"app.demandModsInformations()\">Réessayer</button>"
    } else {
        let element = ""
        for(const i in args) {
            element += `<hr><div data-chapter="${i}" onclick="changeSelectedChapter(this)"><h3>${args[i].title}</h3><p>${args[i].description}</p></div>`
        }
        app.sidebarContent = element
    }
})

function changeSelectedChapter(element) {
    selectedChapter = Number(element.dataset.chapter)
    document.querySelectorAll("#sidebar-content > div").forEach((v) => {
        v.classList.remove("selected")
    })
    element.classList.add("selected")
    app.launchBtnText = "JOUER"
    app.launchBtnDisable = false
}
