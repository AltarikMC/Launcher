const os = require('os');
const launchBtn = document.querySelector('#launch-btn');
const fullProgressBar = document.querySelector('#fullprogressbar')
const progressBar = document.querySelector('#progressbar')
const loadingMessage = document.querySelector('#loading-message')
const disconnectBtn = document.querySelector('#disconnect-btn')
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
        localStorage.setItem("minMem", minMem.value)
        localStorage.setItem("maxMem", maxMem.value)
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
    loadingMessage.innerHTML = "Chargement de Minecraft en cours..."
    progressBar.style.width = "0"
    launchBtn.disabled = false
})

ipcRenderer.on('launch', (e, args) => {
    fullProgressBar.classList.add('hidden');
    loadingMessage.classList.add('hidden');
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