<script setup>
import { ref, provide, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { minimize, close } from './utils'
import './assets/css/fonts.css'
import 'vue3-toastify/dist/index.css';
import './assets/css/app.css'

const router = useRouter()
const route = useRoute()

const totalMem = ref(0)

onMounted(() => {
  window.electronAPI.ipc.on('pc-configuration', (e) => {
    totalMem.value = e.totalMem
  })
  window.electronAPI.ipc.send('winReady')
})
provide('totalMem', totalMem)


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
  <RouterView />
</template>


