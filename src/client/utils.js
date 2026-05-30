import { toast } from 'vue3-toastify'

export function showInfo (title, body) {
  toast.info({
    title,
    content: body,
  })
}

export function showSuccess (title, body) {
  toast.success({
    title,
    content: body,
  })
}

export function showWarning (title, body) {
  toast.warning({
    title,
    content: body,
  })
}

export function showError (title, body) {
  toast.error({
    title,
    content: body,
  })
}

export function minimize () {
  window.electronAPI.ipc.send('minimizeWindow')
}

export function close () {
  window.electronAPI.ipc.send('closeWindow')
}
