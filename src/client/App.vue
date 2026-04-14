<script setup>
import { ref, provide, onMounted } from 'vue'
import Updater from './Updater.vue'
import Login from './Login.vue'
import Main from './Main.vue'
import { toast } from 'vue3-toastify';
import './assets/css/fonts.css'
import 'vue3-toastify/dist/index.css';
import './assets/css/app.css'

const page = ref("updater")
const totalmem = ref(0)

function minimize() {
   window.electronAPI.ipc.send('minimizeWindow')
}

function close() {
  window.electronAPI.ipc.send('closeWindow')
}

function setPage(newPage) {
  page.value = newPage
}

function showInfo(title, body) {
  toast.info({
    title,
    content: body,
  })
}

function showSuccess(title, body) {
  toast.success({
    title,
    content: body,
  })
}

function showWarning(title, body) {
  toast.warning({
    title,
    content: body,
  })
}

function showError(title, body) {
  toast.error({
    title,
    content: body,
  })
}

onMounted(() => {

  window.electronAPI.ipc.on('pc-configuration', (e) => {
    totalmem.value = e.totalMem
  })
})

provide("showInfo", showInfo)
provide("showError", showError)
provide("showWarning", showWarning)
provide("showSuccess", showSuccess)

</script>

<template>
  <div id="menubar">
    <ul class="left">
        <img src="../../icon.ico">
    </ul>
    <ul class="right">
        <!-- Mettre ce code en ligne pour éviter que chrome ne met un espace automatiquement entre les éléments -->
        <li id="minimize-btn" @click="minimize"><i class="material-icons">minimize</i></li><!--<li id="max-unmax-btn"><i class="material-icons">crop_square</i></li>--><li id="close-btn" @click="close"><i class="material-icons">close</i></li>
    </ul>
</div>
<Updater @set-page="setPage" v-if="page === 'updater'"/>
<Login @set-page="setPage" v-if="page === 'login'" />
<Main @set-page="setPage" v-if="page === 'main'" totalmem="totalmem" />
</template>


