const { shell } = require('electron')
const os = require('os')
const launchBtn = document.querySelector('#launch-btn')
const launchText = document.querySelector("#launch-text")
const fullProgressBar = document.querySelector('#fullprogressbar')
const progressBar = document.querySelector('#progressbar')
const loadingMessage = document.querySelector('#loading-message')
const disconnectBtn = document.querySelector('#disconnect-btn')
const fullscreen = document.querySelector('#fullscreen')
const minMem = document.querySelector('#minMem')
const maxMem = document.querySelector('#maxMem')
const outputMinMem = document.querySelector('#outputMinMem')
const outputMaxMem = document.querySelector('#outputMaxMem')
const totalMem = os.totalmem() / (1.049 * Math.pow(10, 6))

document.body.onload = (e) => {
    minMem.max = totalMem
    maxMem.max = totalMem
    minMem.value = localStorage.getItem("minMem") != null ? localStorage.getItem("minMem") : 1024 
    outputMinMem.innerHTML = minMem.value
    maxMem.value = localStorage.getItem("maxMem") != null ? localStorage.getItem("maxMem") : 2048
    outputMaxMem.innerHTML = maxMem.value
}

ipcRenderer.on("nick", (event, args) => {
    console.log(args)
    document.querySelector("#nick").innerHTML = args.name
})

launchBtn.addEventListener("click", e => {
    launchText.classList.add('hidden')
    fullProgressBar.classList.remove('hidden')
    loadingMessage.classList.remove('hidden')
    if(Number(minMem.value) <= Number(maxMem.value)){
        ipcRenderer.send('launch', {
            minMem: minMem.value + "M",
            maxMem: maxMem.value + "M"
        })
        launchBtn.disabled = true
        localStorage.setItem("minMem", minMem.value)
        localStorage.setItem("maxMem", maxMem.value)
    } else{
        ipcRenderer.send('notification', {
            title: "Erreur de lancement",
            body: "La mémoire minimale doit être inférieure ou égale à la mémoire maximale"
        })
    }
    
})

document.querySelector("#web").addEventListener("click", e => {
    shell.openExternal("https://altarik.fr")
})

document.querySelector("#options").addEventListener("click", e => {
    fullscreen.style.display = "block"
})

document.querySelector("#discord").addEventListener("click", e => {
    shell.openExternal("https://discord.gg/b923tMhmRE")
})

document.querySelector("#close").addEventListener("click", e => {
    fullscreen.style.display = "none"
});

ipcRenderer.on("progress", (e, args) => {
    progressBar.style.width = (args.task / Math.max(args.total, args.task)) * 100 + "%"
    loadingMessage.innerHTML = "Téléchargement de " + args.type + ": " + args.task + " sur " + Math.max(args.total, args.task)
})

ipcRenderer.on("close", (e, args) => {
    launchText.classList.remove('hidden')
    fullProgressBar.classList.add('hidden')
    loadingMessage.classList.add('hidden')
    loadingMessage.innerHTML = "Chargement de Minecraft en cours..."
    progressBar.style.width = "0"
    launchBtn.disabled = false
})

ipcRenderer.on('launch', (e, args) => {
    fullProgressBar.classList.add('hidden')
    loadingMessage.classList.add('hidden')
})

disconnectBtn.addEventListener('click', e => {
    ipcRenderer.send('disconnect')
})

minMem.addEventListener("input", (e) => {
    outputMinMem.innerHTML = e.target.value
})

maxMem.addEventListener("input", (e) => {
    outputMaxMem.innerHTML = e.target.value
})