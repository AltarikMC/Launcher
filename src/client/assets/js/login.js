const form = document.querySelector('#login-form')
const user = document.querySelector('#nickname')
const password = document.querySelector('#password')
const microsoftButton = document.querySelector("#microsoft-button")

form.addEventListener("submit", (e) => {
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
})

microsoftButton.addEventListener("click", (e) => {
    e.preventDefault()
    if(!form.disabled) {
        microsoftButton.disabled = true
        form.disabled = true
        ipcRenderer.send("microsoft-login")
    }
})

ipcRenderer.on("loginError", event => {
    form.disabled = false
    microsoftButton.disabled = false
})