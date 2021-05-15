const form = document.querySelector('#login-form')
const user = document.querySelector('#nickname')
const password = document.querySelector('#password')


form.addEventListener("submit", (e) => {
    e.preventDefault()
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
    
})

ipcRenderer.on("loginError", event => {
    form.disabled = false
})