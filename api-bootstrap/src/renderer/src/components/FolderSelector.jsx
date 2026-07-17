export default function FolderSelector({
  folder,
  setFolder
}) {

  async function handleSelectFolder() {

    const result = await window.api.dialog.selectFolder();

    if(result){
      setFolder(result);
    }

  }


  return (
    <div
      style={{
        display:"flex",
        flexDirection:"column",
        gap:8
      }}
    >

      <label>
        Pasta de destino
      </label>


      <input
        value={folder}
        readOnly
        placeholder="Selecione uma pasta"
        style={{
          padding:8
        }}
      />


      <button onClick={handleSelectFolder}>
        Selecionar pasta
      </button>

    </div>
  );
}