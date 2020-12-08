minMem= "2G"
maxMem = "4G"

let launchBtn = document.querySelector('#launch-btn');
let fullProgressBar = document.querySelector('#fullprogressbar')
let progressBar = document.querySelector('#progressbar')
let loadingMessage = document.querySelector('#loading-message')

ipcRenderer.on("nick", (event, args) => {
    console.log(args)
    document.querySelector("#nick-span").innerHTML = args.name
})

launchBtn.addEventListener("click", e => {
    launchBtn.classList.add('hidden');
    fullProgressBar.classList.remove('hidden');
    loadingMessage.classList.remove('hidden');
    ipcRenderer.send('launch', {
        minMem: minMem,
        maxMem: maxMem
    })
    launchBtn.disabled = true
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