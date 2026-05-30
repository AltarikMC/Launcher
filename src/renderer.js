import { createApp } from 'vue'
import App from './client/App.vue'
import { createMemoryHistory, createRouter } from 'vue-router'
import Vue3Toastify from 'vue3-toastify'

import Updater from './client/Updater.vue'
import Login from './client/Login.vue'
import Main from './client/Main.vue'

import 'vue3-toastify/dist/index.css'

const routes = [
  { path: '/', redirect: { path: '/updater' } },
  { path: '/updater', component: Updater },
  { path: '/login', component: Login },
  { path: '/main', component: Main }
]

const router = createRouter({
  history: createMemoryHistory(),
  routes,
})

createApp(App)
  .use(router)
  .use(
    Vue3Toastify,
    {
      autoClose: 3000
    }
  )
  .mount('#app')
