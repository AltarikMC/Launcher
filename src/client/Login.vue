<script setup>
import { ref, inject, onMounted } from 'vue'
import './assets/css/login.css'
import { showWarning } from './utils'
import { useRouter } from 'vue-router'

const router = useRouter()

const form_disabled = ref(false)
const microsoft_button = ref('Connexion avec un compte Microsoft')

function microsoftButton (e) {
    e.preventDefault()
    if (!form_disabled.value) {
        form_disabled.value = true
        window.electronAPI.ipc.send('microsoft-login')
    }
}

onMounted(() => {
    window.electronAPI.ipc.on('loginError', (e) => {
        form_disabled.value = false
        showWarning(e.title, e.body)
    })
    window.electronAPI.ipc.on('loginSuccess', () => {
        router.push('/main')
    })
    window.electronAPI.ipc.on('loginCancel', () => {
        form_disabled.value = false
    })
})

</script>
<template>
    <div id="content" class="login">
        <button id="microsoft-button" :disabled="form_disabled" @click="microsoftButton">{{ microsoft_button }}</button>
    </div>
</template>
