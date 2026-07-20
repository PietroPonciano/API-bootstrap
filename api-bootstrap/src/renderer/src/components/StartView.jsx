/* eslint-disable react/prop-types */
import { KeyRound, BookOpen, Container, ShieldCheck, ArrowRight } from 'lucide-react'

const highlights = [
  { icon: KeyRound, title: 'JWT', text: 'Autenticação e hash de senha prontos' },
  { icon: BookOpen, title: 'Swagger', text: 'Documentação automática em /docs' },
  { icon: Container, title: 'Docker', text: 'Container e Compose configurados' },
  { icon: ShieldCheck, title: 'Qualidade', text: 'ESLint, Prettier, Helmet e Morgan' }
]

export default function StartView({ projects, onCreate, onProjects, onGuide, onOpenProject }) {
  const recentProjects = projects.slice(0, 3)

  return (
    <section className="start-view page-enter">
      <div className="welcome-card">
        <div className="welcome-card-heading">
          <p className="eyebrow">API BOOTSTRAP</p>
          <button
            type="button"
            className="guide-button"
            onClick={onGuide}
            aria-label="Abrir guia rápido"
          >
            i
          </button>
        </div>
        <h2>Da ideia à API estruturada.</h2>
        <p>
          Configure Express, Sequelize, banco de dados, modelos e recursos opcionais sem sair deste
          painel.
        </p>
        <div className="welcome-actions">
          <button type="button" className="primary-button" onClick={onCreate}>
            Criar projeto <span>→</span>
          </button>
          <button type="button" className="secondary-button" onClick={onProjects}>
            Ver projetos <span>{projects.length}</span>
          </button>
        </div>
      </div>

      <div className="start-stats">
        <article>
          <span>{projects.length}</span>
          <small>Projetos locais</small>
        </article>
        <article>
          <span>1</span>
          <small>Stack disponível</small>
        </article>
        <article>
          <span>4</span>
          <small>Features prontas</small>
        </article>
      </div>

      <div className="start-section">
        <div className="start-section-heading">
          <h3>Recursos disponíveis</h3>
          <p className="muted">Ative com um clique ao configurar uma nova API.</p>
        </div>
        <div className="highlight-grid">
          {highlights.map(({ icon: Icon, title, text }) => (
            <div className="highlight-card" key={title}>
              <span className="highlight-icon">
                <Icon size={16} />
              </span>
              <div>
                <strong>{title}</strong>
                <p>{text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="start-section">
        <div className="start-section-heading">
          <h3>Projetos recentes</h3>
          {projects.length > 0 && (
            <button type="button" className="link-button" onClick={onProjects}>
              Ver todos <ArrowRight size={13} />
            </button>
          )}
        </div>
        {recentProjects.length === 0 ? (
          <div className="recent-empty">
            <p>Nenhum projeto criado ainda. Comece configurando sua primeira API.</p>
            <button type="button" className="secondary-button" onClick={onCreate}>
              Criar projeto
            </button>
          </div>
        ) : (
          <div className="recent-grid">
            {recentProjects.map((project) => (
              <button
                type="button"
                className="recent-card"
                key={project.id}
                onClick={() => onOpenProject(project)}
              >
                <span className="project-letter">{project.name.charAt(0).toUpperCase()}</span>
                <div className='name-project'>
                  <strong>{project.name}</strong>
                  <small>
                    {project.author || 'Sem autor'} · {project.database.type}
                  </small>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
