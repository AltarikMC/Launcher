var os = require('os');
let launchBtn = document.querySelector('#launch-btn');
let fullProgressBar = document.querySelector('#fullprogressbar')
let progressBar = document.querySelector('#progressbar')
let loadingMessage = document.querySelector('#loading-message')
let disconnectBtn = document.querySelector('#disconnect-btn')
let minMem = document.querySelector('#minMem')
let maxMem = document.querySelector('#maxMem')
let outputMinMem = document.querySelector('#outputMinMem')
let outputMaxMem = document.querySelector('#outputMaxMem')
let totalMem = os.totalmem() / (1.049 * Math.pow(10, 6))

ipcRenderer.on("nick", (event, args) => {
    console.log(args)
    document.querySelector("#nick-span").innerHTML = args.name
})

launchBtn.addEventListener("click", e => {
    launchBtn.classList.add('hidden');
    fullProgressBar.classList.remove('hidden');
    loadingMessage.classList.remove('hidden');
    if(Number(minMem.value) <= Number(maxMem.value)){
        ipcRenderer.send('launch', {
            minMem: minMem.value + "M",
            maxMem: maxMem.value + "M"
        })
        launchBtn.disabled = true
        if(minMem.value && maxMem.value){
            localStorage.setItem("minMem", minMem.value)
            localStorage.setItem("maxMem", maxMem.value)
        }
    } else{
        ipcRenderer.send('notification', {
            title: "Erreur de lancement",
            body: "La mémoire minimale doit être inférieure ou égale à la mémoire maximale"
        })
    }
    
})

ipcRenderer.on("progress", (e, args) => {
    progressBar.style.width = (args.task / args.total) * 100 + "%"
    loadingMessage.innerHTML = "Téléchargement de " + args.type + ": " + args.task + " sur " + args.total;
})

ipcRenderer.on("close", (e, args) => {
    launchBtn.classList.remove('hidden');
    fullProgressBar.classList.add('hidden');
    loadingMessage.classList.add('hidden');
    loadingMessage.innerHTML = "Téléchargement de Minecraft en cours..."
    progressBar.style.width = "0"
    launchBtn.disabled = false
})

disconnectBtn.addEventListener('click', e => {
    ipcRenderer.send('disconnect')
})

window.addEventListener("DOMContentLoaded", () => {
    minMem.value = localStorage.getItem("minMem") != null ? Number(localStorage.getItem("minMem")) : 1024
    minMem.max = totalMem
    outputMinMem.innerHTML = minMem.value
    maxMem.value = localStorage.getItem("maxMem") != null ? Number(localStorage.getItem("maxMem")) : 2048
    maxMem.max = totalMem
    outputMaxMem.innerHTML = maxMem.value
    
})

minMem.addEventListener("input", (e) => {
    outputMinMem.innerHTML = e.target.value
})

maxMem.addEventListener("input", (e) => {
    outputMaxMem.innerHTML = e.target.value
})