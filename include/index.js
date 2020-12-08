minMem= "2G"
maxMem = "4G"


ipcRenderer.on("nick", (event, args) => {
    console.log(args)
    document.querySelector("#nick-span").innerHTML = args.name
})

document.querySelector('#launch-btn').addEventListener("click", e => {
    ipcRenderer.send('launch', {
        minMem: minMem,
        maxMem: maxMem
    })
    document.querySelector('#launch-btn').disabled = true
})