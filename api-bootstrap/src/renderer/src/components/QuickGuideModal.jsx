/* eslint-disable react/prop-types */
export default function QuickGuideModal({ onClose }) {
  return (
    <div className="guide-backdrop" role="presentation" onMouseDown={onClose}>
      <section
        className="guide-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="guide-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <button type="button" className="guide-close" onClick={onClose} aria-label="Fechar guia">
          ×
        </button>
        <p className="eyebrow">GUIA RÁPIDO</p>
        <h2 id="guide-title">Como gerar um projeto</h2>
        <p className="muted">Siga este fluxo para criar sua API.</p>
        <div className="guide-flow">
          <div>
            <span>1</span>
            <strong>Criar projeto</strong>
            <p>Na página inicial, escolha “Criar projeto”.</p>
          </div>
          <i>→</i>
          <div>
            <span>2</span>
            <strong>Configurar</strong>
            <p>Preencha projeto, banco, modelos e features.</p>
          </div>
          <i>→</i>
          <div>
            <span>3</span>
            <strong>Gerar</strong>
            <p>Revise o resumo e clique em “Gerar projeto”.</p>
          </div>
        </div>
        <p className="guide-tip">Você pode acompanhar a execução no painel de logs.</p>
      </section>
    </div>
  )
}
