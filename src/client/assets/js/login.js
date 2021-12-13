// const {default: iziToast } = require('izitoast')
let app = new vue({
    el: "#vue",
    data: {
        login: "Connexion",
        email: "Email",
        password: "Mot de passe",
        send_credentials: "Se connecter",
        microsoft_button: "Connexion avec un compte Microsoft",
        notificationTitle: "",
        notificationMessage: ""
    },
    mounted: function () {
        iziToast.settings({
            close: false,
            closeOnClick: true,
            timeout: 5000,
            position: 'topRight',
            resetOnHover: true,
        })
    },
    methods: {
        formSubmit: function (e) {
            e.preventDefault()
            if(!microsoftButton.disabled) {
                form.disabled = true
                if(user.value) {
                    ipcRenderer.send("login", {
                        user: user.value,
                        pass: password.value
                    })
                }else{
                    this.notificationTitle = "Erreur de connexion"
                    this.notificationMessage = "Veuillez entrer des identifiants"
                    this.showWarning()
                }
            }
        },
        microsoftButton: function (e) {
            e.preventDefault()
            if(!form.disabled) {
                microsoftButton.disabled = true
                form.disabled = true
                ipcRenderer.send("microsoft-login")
            }
        },
        showInfo: function () {
            iziToast.info({
                title: this.notificationTitle,
                message: this.notificationMessage,
                color: 'blue'
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
                color: 'yellow'
            })
        },
        showSuccess: function () {
            iziToast.success({
                title: this.notificationTitle,
                message: this.notificationMessage,
                color: 'green'
            })
        }
    }
});

// theirs const are declared after vue cause vue modify them when declaring new vue instance
const form = document.querySelector('#login-form')
const user = document.querySelector('#nickname')
const password = document.querySelector('#password')
const microsoftButton = document.querySelector("#microsoft-button")

ipcRenderer.on("loginError", () => {
    form.disabled = false
    microsoftButton.disabled = false
})
