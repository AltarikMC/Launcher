let launchBtn = document.querySelector('#launch-btn');
let fullProgressBar = document.querySelector('#fullprogressbar')
let progressBar = document.querySelector('#progressbar')
let loadingMessage = document.querySelector('#loading-message')
let disconnectBtn = document.querySelector('#disconnect-btn')

ipcRenderer.on("nick", (event, args) => {
    console.log(args)
    document.querySelector("#nick-span").innerHTML = args.name
})

launchBtn.addEventListener("click", e => {
    launchBtn.classList.add('hidden');
    fullProgressBar.classList.remove('hidden');
    loadingMessage.classList.remove('hidden');
    ipcRenderer.send('launch', {
        minMem: document.querySelector('#minMem').value,
        maxMem: document.querySelector('#maxMem').value
    })
    launchBtn.disabled = true
    if(document.querySelector('#minMem').value.trim() && document.querySelector('#maxMem').value.trim()){
        localStorage.setItem("minMem", document.querySelector('#minMem').value.trim())
        localStorage.setItem("maxMem", document.querySelector('#maxMem').value.trim())
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
    document.querySelector('#minMem').value = localStorage.getItem("minMem") != null ? localStorage.getItem("minMem") : "2G"
    document.querySelector('#maxMem').value = localStorage.getItem("maxMem") != null ? localStorage.getItem("maxMem") : "4G"
})