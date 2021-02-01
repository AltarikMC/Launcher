user = document.querySelector('#nickname')
password = document.querySelector('#password')

document.querySelector('#login-form').addEventListener("submit", (e) => {
    e.preventDefault()
    if(user.value){
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
