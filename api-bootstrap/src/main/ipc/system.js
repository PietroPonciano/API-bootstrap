import { ipcMain } from 'electron'
import SystemService from '../../core/system/SystemService'

export default function registerSystemIPC() {
  ipcMain.handle('system:getVersion', () => {
    return SystemService.getVersion()
  })
}