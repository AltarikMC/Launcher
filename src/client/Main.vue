<script setup>
import { ref, onMounted, inject } from 'vue'
import './assets/css/index.css'
import Dividers from './components/Dividers.vue'
import QuantityInput from './components/QuantityInput.vue'
import Button from './components/Button.vue'
import Fullscreen from './components/Fullscreen.vue'

const emit = defineEmits(['setPage'])

const showSuccess = inject("showSuccess")
const showInfo = inject("showInfo")
const showError = inject("showError")

const props = defineProps(['totalmem'])

const minMemValue = ref(localStorage.getItem('minMem') != null ? localStorage.getItem('minMem') : 1024)
const maxMemValue = ref(localStorage.getItem('maxMem') != null ? localStorage.getItem('maxMem') : 2048)
const memStep = ref(128)
const memMax = ref(props.totalmem / (1.049 * Math.pow(10, 6)))
const invalidateButtonText = ref('Nettoyer l\'installation')
const invalidateButtonDisabled = ref(false)
const displayFullscreen = ref(false)
const displaySettings = ref('none')
const displayCredits = ref('none')
const nick = ref('Chargement')
const launchBtnText = ref('Selectionnez un chapitre')
const launchBtnDisable = ref(true)
const launchBtnHidden = ref(false)
const loadingMessageHidden = ref(true)
const loadingMessageText = ref('Téléchargement de Minecraft en cours...')
const fullprogressbarHidden = ref(true)
const progressbarWidth = ref(0)
const modsInformations = ref([])
const modsInformationsLoaded = ref(true)
const selectedChapter = ref(-1)
const gameLaunching = ref(false)

function updateModsInformations (content) {
      if (content === null) {
        modsInformations.value = []
      } else {
        modsInformations.value = content
      }
    }

onMounted(() => {
    window.electronAPI.ipc.send('pageReady')
})

function isSelected (index) {
    return selectedChapter.value === index
}

function reloadChapters () {
    changeSelectedChapter(-1)
    updateModsInformations(null)
    modsInformationsLoaded.value = true
    window.electronAPI.ipc.send('pageReady')
}

function changeSelectedChapter (index) {
    if(!gameLaunching.value) {
        selectedChapter.value = index
        if (index !== -1) {
            launchBtnText.value = 'JOUER'
            launchBtnDisable.value = false
        } else {
            launchBtnText.value = 'Selectionnez un chapitre'
            launchBtnDisable.value = true
        }   
    }
}

function launchBtnClick () {
    launchBtnHidden.value = true
    fullprogressbarHidden.value = false
    loadingMessageHidden.value = false
    if (Number(minMemValue.value) <= Number(maxMemValue.value)) {
        window.electronAPI.ipc.send('launch', {
            minMem: minMemValue.value + 'M',
            maxMem: maxMemValue.value + 'M',
            chapter: selectedChapter.value
        })
        launchBtnDisable.value = true
        localStorage.setItem('minMem', minMemValue.value)
        localStorage.setItem('maxMem', maxMemValue.value)
        gameLaunching.value = true
    } else {
        showError('Erreur de lancement', 'La mémoire minimale doit être inférieure ou égale à la mémoire maximale.')
    }
}

function disconnectBtn () {
    emit('setPage', 'login')
    showSuccess('Déconnecté', 'Vous avez été déconnecté de votre compte')
}

function options () {
    if (!gameLaunching.value) {
        displayFullscreen.value = true
        displaySettings.value = 'block'
        displayCredits.value = 'none'
    }
}

function discord () {
    window.electronAPI.shell.openExternal('https://discord.gg/p3EnE6Jumg')
}

function web () {
    window.electronAPI.shell.openExternal('https://altarik.fr')
}

function sourceCode() {
    window.electronAPI.shell.openExternal('https://github.com/AltarikMC/Launcher')
}

function closeFullscreen () {
    displayFullscreen.value = false
    displaySettings.value = 'none'
    displayCredits.value = 'none'
}

function invalidateData () {
    invalidateButtonDisabled.value = true
    invalidateButtonText.value = 'Opération en cours'
    showInfo('Opération en cours', 'Suppression des données du jeu en cours')
    window.electronAPI.ipc.send('invalidateData')
}

window.electronAPI.ipc.on('nick', (e) => (nick.value = e.name))

window.electronAPI.ipc.on('modsInformations', (e) => {
  if (e === null) {
    modsInformationsLoaded.value = false
  } else {
    modsInformationsLoaded.value = true
  }
  updateModsInformations(e)
})

window.electronAPI.ipc.on('invalidated', () => {
  invalidateButtonDisabled.value = false
  invalidateButtonText.value = 'Nettoyer l\'installation'
  showSuccess('Opération terminée', 'Les données du jeu ont été supprimé avec succès')
})

window.electronAPI.ipc.on('progress', (e) => {
  progressbarWidth.value = (e.task / Math.max(e.total, e.task)) * 100
  loadingMessageText.value = 'Téléchargement de ' + e.type + ': ' + e.task + ' sur ' + Math.max(e.total, e.task)
})

window.electronAPI.ipc.on('launch', (_e) => {
  fullprogressbarHidden.value = true
  loadingMessageHidden.value = true
})

window.electronAPI.ipc.on('close', (_e) => {
  launchBtnHidden.value = false
  fullprogressbarHidden.value = true
  loadingMessageHidden.value = true
  loadingMessageText.value = 'Chargement de Minecraft en cours...'
  progressbarWidth.value = 0
  launchBtnDisable.value = false
  gameLaunching.value = false
})

window.electronAPI.ipc.on('launchError', (e) => {
    showError(e.title, e.body)
})
</script>
<template>
    <Fullscreen v-if="displayFullscreen" @close="closeFullscreen">
        <div id="settings" class="py-8" :style="{ display: displaySettings }">
            <h1 class="text-center m-5 text-2xl">Paramètres</h1>
            <Dividers title="Connectivité" />
            <p class="justify-center flex">
                <Button :callback="disconnectBtn" text="Se déconnecter" />
            </p>
            <Dividers title="Allocation mémoire" />
            <p>
                <label for="minMem">Mémoire minimale : <span>{{ minMemValue }} Mo</span></label>
                <QuantityInput v-model="minMemValue" id="minMem" min="1024" :max="memMax" :step="memStep" />
                <label for="maxMem">Mémoire maximale : <span>{{ maxMemValue }} Mo</span></label>
                <QuantityInput v-model="maxMemValue" id="minMem" min="1024" :max="memMax" :step="memStep" />
            </p>
            <Dividers title="Dépannage" />
            <p class="justify-center flex">
                <Button :callback="invalidateData" :text="invalidateButtonText" :disabled="invalidateButtonDisabled" />
            </p>
            <Dividers title="Autre" />
            <p class="justify-center flex">
                <Button :callback="sourceCode" text="Code source" />
            </p>
            
        </div>
    </Fullscreen>
    <div id="content" class="main">
        <div id="sidebar">
            <h1 class="text-4xl mb-3 font-black">Chapitres <i v-if="modsInformations.length !== 0 || modsInformationsLoaded === false" @click="reloadChapters()" class="reload-chapter material-icons">sync</i></h1>
            <div id="sidebar-content" @change="modsInformations" class="overflow-auto">
                <div v-if="modsInformationsLoaded === false">Une erreur est survenue lors de la récupération des informations, vérifiez votre connexion internet ou réessayez plus tard</div>
                <div v-for="(item, index) in modsInformations" v-else-if="modsInformations.length !== 0" @click="changeSelectedChapter(index)" :class="[{ 'text-black': isSelected(index) },{'text-neutral-900/60': !isSelected(index)}]">
                        <h2 class="text-3xl font-semibold">{{ item.title }}</h2>
                        <div class="text-2xl">{{ item.description}}</div>
                </div>
                <div v-else>Chargement en cours</div>
            </div>
        </div>
        <div id="media" class="absolute bottom-4 left-6 w-xs flex">
            <div @click="options" title="Paramètres">
                <img src="./assets/images/settings.png" class="w-24 h-23">
            </div>
            <div @click="discord" title="Rejoingnez notre Discord">
                <img src="./assets/images/discord.png" class="w-24 h-23">
            </div>
            <div @click="web"title="Visitez notre site web" >
                <img src="./assets/images/web.png" class="w-24 h-23">
            </div>
            
        </div>
        <div class="w-full h-full">
            <div id="account" class="w-xs h-24 bg-[url('../images/nickname_scroll.png')] bg-no-repeat bg-cover absolute right-6 top-12 px-8">
                <div id="nick" class="relative top-45/100 -translate-y-45/100 text-3xl font-['French-Press',sans-serif]">{{ nick }}</div><!-- <img src=""> Head du joueur -->
            </div>
            <button @click="launchBtnClick" id="launch-btn" :disabled="launchBtnDisable" class="bg-transparent absolute text-center border-0 p-2.5 h-28 w-78 bottom-5 right-6 font-['French-Press',sans-serif]">
                <div class="font-bold" :class="[{hidden: launchBtnHidden},{'text-2xl': launchBtnDisable},{'text-5xl': !launchBtnDisable}]">{{ launchBtnText }}</div>
                <div class="w-full h-7 text-white text-2xl relative mx-auto mb-1" :class="[{hidden: loadingMessageHidden}]">{{ loadingMessageText }}</div>
                <div id="fullprogressbar" class="rounded-sm" :class="[{hidden: fullprogressbarHidden}]"><div class="w-0 h-full bg-green-700 rounded-sm" :style="{ width: progressbarWidth + '%' }"></div></div>
            </button>
        </div>
    </div>
</template>
