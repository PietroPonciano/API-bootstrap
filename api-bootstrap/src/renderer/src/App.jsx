import { useState } from "react";

function App() {
  const [version, setVersion] = useState("");

  async function handleClick() {
    const response = window.api.system.getVersion();
    setVersion(response);
  }

  return (
    <div style={{ padding: 40, display: "flex", alignItems: "center",flexDirection:"column" }}>
      <h1>API Bootstrap</h1>

      <button onClick={handleClick}>
        Testar comunicação
      </button>

      <p>{version}</p>
    </div>
  );
}

export default App;