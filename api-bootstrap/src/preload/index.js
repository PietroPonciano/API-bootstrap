import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

const api = {
  system: {
    getVersion: () => ipcRenderer.invoke('system:getVersion')
  },

  generator: {
    generateProject: (project) =>
      ipcRenderer.invoke('generator:create', project)
  },
  dialog: {
    selectFolder: () =>
      ipcRenderer.invoke('dialog:selectFolder')
  },
  logger:{
    onLog(callback){

        ipcRenderer.on(
            "logger:new",
            (_,data)=>{
                callback(data)
            }
        )

    }
}
}

if (process.contextIsolated) {
  contextBridge.exposeInMainWorld('electron', electronAPI)
  contextBridge.exposeInMainWorld('api', api)
} else {
  window.electron = electronAPI
  window.api = api
}