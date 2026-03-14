<script setup>
import { ref, inject, onMounted } from 'vue'
import './assets/css/login.css'

const form_disabled = ref(false)
const microsoft_button = ref('Connexion avec un compte Microsoft')

const showWarning = inject("showWarning")
const setPage = inject("setPage")

function microsoftButton (e) {
    e.preventDefault()
    if (!form_disabled.value) {
    form_disabled.value = true
    window.electronAPI.ipc.send('microsoft-login')
    }
}

onMounted(() => {
    window.electronAPI.ipc.on('loginError', () => {
        form_disabled.value = false
    })
    window.electronAPI.ipc.on('loginSuccess', () => {
        setPage("main")
    })
})

</script>
<template>
    <div id="content" class="login">
        <button id="microsoft-button" :disabled="form_disabled" @click="microsoftButton">{{ microsoft_button }}</button>
    </div>
</template>
