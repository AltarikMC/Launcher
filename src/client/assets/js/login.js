const vue = require('vue/dist/vue.cjs.js')
app = vue.createApp({
    data() {
        return {
            login: "Connexion",
            email: "Email",
            password: "Mot de passe",
            send_credentials: "Se connecter",
            microsoft_button: "Connexion avec un compte Microsoft",
        }
    },
    mounted() {
        iziToast.settings({
            close: false,
            closeOnClick: true,
            timeout: 5000,
            position: 'topRight',
            resetOnHover: true,
        })
    },
    methods: {
        formSubmit (e) {
            e.preventDefault()
            if(!microsoftButton.disabled) {
                form.disabled = true
                if(user.value) {
                    ipcRenderer.send("login", {
                        user: user.value,
                        pass: password.value
                    })
                }else{
                    this.showWarning("Erreur de connexion", "Veuillez entrer des identifiants")
                    form.disabled = false
                }
            }
        },
        microsoftButton(e) {
            e.preventDefault()
            if(!form.disabled) {
                microsoftButton.disabled = true
                form.disabled = true
                ipcRenderer.send("microsoft-login")
            }
        },
        showInfo(title, body) {
            iziToast.info({
                title: title,
                message: body,
                color: 'blue'
            })
        },
        showError(title, body) {
            iziToast.error({
                title: title,
                message: body,
                color: 'red',
            })
        },
        showWarning(title, body) {
            iziToast.warning({
                title: title,
                message: body,
                color: 'yellow'
            })
        },
        showSuccess(title, body) {
            iziToast.success({
                title: title,
                message: body,
                color: 'green'
            })
        }
    }
});

app.mount("#vue");

// theirs const are declared after vue cause vue modify them when declaring new vue instance
const form = document.querySelector('#login-form')
const user = document.querySelector('#nickname')
const password = document.querySelector('#password')
const microsoftButton = document.querySelector("#microsoft-button")



ipcRenderer.on("loginError", () => {
    form.disabled = false
    microsoftButton.disabled = false
})
