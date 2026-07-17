import { ipcMain, dialog } from 'electron'

export default function registerDialogIPC() {
  ipcMain.handle('dialog:selectFolder', async () => {

    const result = await dialog.showOpenDialog({
      properties: ['openDirectory']
    })

    if (result.canceled) {
      return null
    }

    return result.filePaths[0]
  })
}