

let app = new vue({
    el: "#vue",
    data: {
        login: "Connexion",
        email: "Email",
        password: "Mot de passe",
        send_credentials: "Se connecter",
        microsoft_button: "Connexion avec un compte Microsoft"
    },
    methods: {
        formSubmit: (e) => {
            e.preventDefault()
            if(!microsoftButton.disabled) {
                form.disabled = true
                if(user.value) {
                    ipcRenderer.send("login", {
                        user: user.value,
                        pass: password.value
                    })
                }else{
                    ipcRenderer.send("notification", {
                        title: "error",
                        body: "Veuillez entrer des identifiants"
                    })
                }
            }
        },
        microsoftButton: (e) => {
            e.preventDefault()
            if(!form.disabled) {
                microsoftButton.disabled = true
                form.disabled = true
                ipcRenderer.send("microsoft-login")
            }
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