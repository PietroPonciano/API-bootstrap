/* eslint-disable react/prop-types */
import { useEffect, useState } from 'react'
import { Bell, ChevronDown, ChevronUp } from 'lucide-react'

export default function LogViewer({ hidden, onToggle }) {
  const [logs, setLogs] = useState([])

  useEffect(() => {
    window.api.logger.onLog((log) => setLogs((current) => [...current, log].slice(-100)))
  }, [])

  return (
    <section className="log-panel">
      <div className="log-heading">
        <div>
          <p className="eyebrow">ATIVIDADE</p>
          <h2>
            <Bell size={14} style={{ marginRight: 6, verticalAlign: '-2px' }} />
            Logs de geração
          </h2>
        </div>
        <div className="log-actions">
          <span className="log-count">{logs.length}</span>
          <button type="button" onClick={onToggle}>
            {hidden ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
            {hidden ? 'Mostrar' : 'Ocultar'}
          </button>
        </div>
      </div>
      {!hidden && (
        <div className="log-content">
          {logs.length === 0 ? (
            <p className="log-empty">A atividade do gerador será exibida aqui.</p>
          ) : (
            logs.map((log, index) => (
              <div
                className={`log-line ${log.level.toLowerCase()}`}
                key={`${log.timestamp}-${index}`}
              >
                <time>{new Date(log.timestamp).toLocaleTimeString()}</time>
                <b>{log.level}</b>
                <span>{log.message}</span>
              </div>
            ))
          )}
        </div>
      )}
    </section>
  )
}
