<script setup>
import './assets/css/checkingUpdate.css'
import { ref, onMounted, inject } from 'vue'
import Fullscreen from './components/Fullscreen.vue'

const emit = defineEmits(['setPage'])

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
    console.log(event)
    let event_type = event.status
    if(event_type === 'success' || event_type === 'error') {
        emit('setPage', 'login')
    }
    if(event_type === 'error') {
        showError(event.message, event.body)
    }
    if(event_type === 'info') {
        if(event.message === 'please-download-update') {
            downloadLink.value = event.content
        } else if(event.message === 'update-available') {
            fullscreenText.value = 'Mise à jour disponible, téléchargement...'
        }
    }
    
})

</script>

<template>
    <Fullscreen v-if="displayFullscreen" :can-close="false">
        <div id="fullscreen-content">
            <p>{{ fullscreenText }} <br /><a @click="openLinkExternal" v-if="downloadLink !== null" href="#">{{ downloadLink }}</a></p>
            <div class="dots-3" />
        </div>
    </Fullscreen>
</template>
