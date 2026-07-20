/* eslint-disable react/prop-types */
import { FolderOpen } from 'lucide-react'

export default function FolderSelector({ folder, setFolder }) {
  async function handleSelectFolder() {
    const result = await window.api.dialog.selectFolder()
    if (result) setFolder(result)
  }

  return (
    <label className="folder-selector">
      Pasta de destino
      <div>
        <input value={folder} readOnly placeholder="Selecione uma pasta" />
        <button
          type="button"
          onClick={handleSelectFolder}
          aria-label="Escolher pasta de destino"
          title="Escolher pasta"
        >
          <FolderOpen size={16} />
        </button>
      </div>
    </label>
  )
}
