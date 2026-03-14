<script setup>
import './assets/css/checkingUpdate.css'
import { ref, onMounted, inject } from 'vue'

const setPage = inject("setPage")

const showError = inject("showError")

const displayFullscreen =  ref('block')
const fullscreenText = ref('Recherche de mise à jour...')
const downloadLink = ref(null)

function sendCheckingUpdate () {
    window.electronAPI.ipc.send('checking-update')
}
function openLinkExternal () {
    window.electronAPI.shell.openExternal(downloadLink.value)
}

onMounted(() => {
    sendCheckingUpdate()
})

window.electronAPI.ipc.on('updater', (event) => {
//   root.fullscreenText = 'Mise à jour disponible, téléchargement...'
    console.log(event)
    let event_type = event.status
    if(event_type === 'success' || event_type === 'error') {
        setPage("login")
    }
    if(event_type === 'error') {
        showError(event.message)
    }
    if(event_type === 'info') {
        if(event.message === 'please-download-update') {
            downloadLink.value = event.content
        } else if(event.message === 'update-available') {
            fullscreenText.value = 'Mise à jour disponible, téléchargement...'
        }
    }
    
})

window.electronAPI.ipc.on('please-download-update', (event, args) => {
//   root.fullscreenText = 'Veuillez télécharger la mise à jour en cliquant sur le lien suivant :'
//   root.downloadLink = `${args.url}`
})
</script>

<template>
<div id="fullscreen" :style="{ display: displayFullscreen }">
    <div id="fullscreen-content">
        <p>{{ fullscreenText }} <br /><a @click="openLinkExternal" v-if="downloadLink !== null" href="#">{{ downloadLink }}</a></p>
        <div class="dots-3"></div>
    </div>
</div>
</template>