import { contextBridge, ipcRenderer, shell } from 'electron'

contextBridge.exposeInMainWorld('electronAPI', {
  shell: {
    openExternal: (url) => shell.openExternal(url)
  },
  ipc: {
    send: (channel, data) => ipcRenderer.send(channel, data),
    on: (channel, cb) => ipcRenderer.on(channel, (event, ...args) => cb(...args)),
    invoke: (channel, data) => ipcRenderer.invoke(channel, data)
  }
})
