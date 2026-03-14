<script setup>
import { ref, onMounted, inject } from 'vue'
import './assets/css/index.css'

const setPage = inject("setPage")

const showSuccess = inject("showSuccess")
const showInfo = inject("showInfo")

const props = defineProps(['totalmem'])

const minMemValue = ref(localStorage.getItem('minMem') != null ? localStorage.getItem('minMem') : 1024)
const maxMemValue = ref(localStorage.getItem('maxMem') != null ? localStorage.getItem('maxMem') : 2048)
const memStep = ref(128)
const memMax = ref(props.totalmem / (1.049 * Math.pow(10, 6)))
const invalidateButtonText = ref('Supprimer et retélécharger les bibliothèques')
const invalidateButtonDisabled = ref(false)
const displayFullscreen = ref('none')
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
const sidebarContent = ref('<hr><p>Chargement en cours</p>')
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
    setTimeout(() => {
      window.electronAPI.ipc.send('pageReady')
    }, 500)
})

function isSelected (index) {
    return selectedChapter.value === index
}

function reloadChapters () {
    updateModsInformations(null)
    modsInformationsLoaded.value = true
    window.electronAPI.ipc.send('pageReady')
}

function changeSelectedChapter (index) {
    if(!gameLaunching.value) {
        selectedChapter.value = parseInt(index)
        launchBtnText.value = 'JOUER'
        launchBtnDisable.value = false
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
    setPage('login')
    showSuccess('Déconnecté', 'Vous avez été déconnecté de votre compte')
    // window.electronAPI.ipc.send('disconnect')
}

function options () {
    if (!gameLaunching.value) {
        displayFullscreen.value = 'block'
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

function closeFullscreen () {
    displayFullscreen.value = 'none'
    displaySettings.value = 'none'
    displayCredits.value = 'none'
}

function credits () {
    displayFullscreen.value = 'block'
    displaySettings.value = 'none'
    displayCredits.value = 'block'
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
  invalidateButtonText.value = 'Supprimer et retélécharger les bibliothèques'
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
</script>
<template>
    <div id="fullscreen" :style="{ display: displayFullscreen }">
        <div @click="closeFullscreen" id="close"><i class="material-icons">close</i></div>
        <div id="settings" :style="{ display: displaySettings }">
                <h2>Paramètres</h2>
                <span href="" id="disconnect-btn" @click="disconnectBtn">Se déconnecter</span>
                <h4>Allocation mémoire</h4>
                <label for="minMem">mémoire minimale : <span id="outputMinMem">{{ minMemValue }}</span></label><br />
                <input type="number" min="1024" :max="memMax" :step="memStep" v-model="minMemValue" class="slider" id="minMem"><br />
                <label for="maxMem">mémoire maximale : <span id="outputMaxMem">{{ maxMemValue }}</span></label><br />
                <input type="number" min="1024" :max="memMax" :step="memStep" v-model="maxMemValue" class="slider" id="maxMem"><br />
                <h4>Au secours, mon jeu ne démarre pas</h4>
                <button @click="invalidateData" :disabled="invalidateButtonDisabled">{{ invalidateButtonText }}</button><br />
                <span @click="credits">Voir crédits</span>
        </div>
        <div id="credits" :style="{ display: displayCredits }">
            <div class="content">
                <p>BSD 3-Clause License</p>

<p>Copyright (c) 2021, Altarik<br />
All rights reserved.</p>

<p>Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:</p>

<ol>
    <li>Redistributions of source code must retain the above copyright notice, this
        list of conditions and the following disclaimer.</li>
    <li>Redistributions in binary form must reproduce the above copyright notice,
        this list of conditions and the following disclaimer in the documentation
        and/or other materials provided with the distribution.</li>
    <li>Neither the name of the copyright holder nor the names of its
        contributors may be used to endorse or promote products derived from
        this software without specific prior written permission.</li>
</ol>

<p>THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.</p>
            </div>
        </div>
    </div>
    <div id="content" class="main">
        <div id="sidebar">
            <h2>Chapitres <i v-if="modsInformations.length !== 0 || modsInformationsLoaded === false" v-on:click="reloadChapters()" class="reload-chapter material-icons">sync</i></h2>
            <div id="sidebar-content" @change="modsInformations">
                <div v-if="modsInformationsLoaded === false">Une erreur est survenue lors de la récupération des informations, vérifiez votre connexion internet puis cliquez sur réessayez</div>
                <div v-for="(item, index) in modsInformations" v-else-if="modsInformations.length !== 0" v-on:click="changeSelectedChapter(index)" :class="{ selected: isSelected(index) }">
                    <h3>{{ item.title }}</h3>
                    <p>{{ item.description}}</p>
                </div>
                <div v-else>Chargement en cours</div>
            </div>
        </div>
        <div id="media">
            <div @click="options" title="Paramètres">
                <img src="./assets/images/settings.png">
            </div>
            <div @click="discord" title="Rejoingnez notre Discord">
                <img src="./assets/images/discord.png">
            </div>
            <div @click="web"title="Visitez notre site web">
                <img src="./assets/images/web.png">
            </div>
            
        </div>
        <div id="main">
            <div id="account">
                <div id="nick">{{ nick }}</div><!-- <img src=""> Head du joueur -->
            </div>
            <button @click="launchBtnClick" id="launch-btn" :disabled="launchBtnDisable">
                <div id="launch-text" :class="[{hidden: launchBtnHidden}]">{{ launchBtnText }}</div>
                <div id="loading-message" :class="[{hidden: loadingMessageHidden}]">{{ loadingMessageText }}</div>
                <div id="fullprogressbar" :class="[{hidden: fullprogressbarHidden}]"><div id="progressbar" :style="{ width: progressbarWidth + '%' }"></div></div>
            </button>
        </div>
    </div>
</template>