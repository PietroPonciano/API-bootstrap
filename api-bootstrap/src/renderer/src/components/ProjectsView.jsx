/* eslint-disable react/prop-types */
import { useState } from 'react'
import { Package } from 'lucide-react'

export default function ProjectsView({ projects, selectedProject, onSelect, onCreate }) {
  const [search, setSearch] = useState('')
  const filteredProjects = search.trim()
    ? projects.filter((project) =>
        `${project.name} ${project.author || ''}`
          .toLowerCase()
          .includes(search.trim().toLowerCase())
      )
    : projects

  return (
    <section className="projects-view page-enter">
      <div className="projects-toolbar">
        <p>
          {projects.length
            ? `${filteredProjects.length} de ${projects.length} projeto${projects.length === 1 ? '' : 's'} salvo${projects.length === 1 ? '' : 's'} localmente`
            : 'Nenhum projeto criado ainda.'}
        </p>
        <div className="projects-toolbar-actions">
          {projects.length > 0 && (
            <input
              type="search"
              className="projects-search"
              placeholder="Buscar por nome ou autor"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              aria-label="Buscar projetos"
            />
          )}
          <button type="button" className="primary-button" onClick={onCreate}>
            + Criar projeto
          </button>
        </div>
      </div>
      {projects.length === 0 ? (
        <div className="empty-projects">
          <span><Package /></span>
          <h2>Comece pelo primeiro projeto</h2>
          <p>Após a geração, os dados principais ficarão guardados neste painel.</p>
          <button type="button" className="primary-button" onClick={onCreate}>
            Configurar API
          </button>
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="empty-projects">
          <span><Package /></span>
          <h2>Nenhum projeto encontrado</h2>
          <p>Tente buscar por outro nome ou autor.</p>
        </div>
      ) : (
        <div className="project-grid">
          {filteredProjects.map((project) => (
            <button
              type="button"
              className={`project-overview-card ${selectedProject?.id === project.id ? 'selected' : ''}`}
              key={project.id}
              onClick={() => onSelect(project)}
            >
              <div>
                <span className="project-letter">{project.name.charAt(0).toUpperCase()}</span>
                <span className="project-date">
                  {new Date(project.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div className="project-overview-card__body">
                <div>
                  <strong>{project.name}</strong>
                  <small>por {project.author || 'Sem autor'}</small>
                </div>
                <span className="project-overview-card__meta">v{project.version}</span>
              </div>
              <footer>
                <span>{project.database.type}</span>
                <span>{project.tablesCount} modelos</span>
              </footer>
            </button>
          ))}
        </div>
      )}
      {selectedProject && (
        <section className="project-detail">
          <div>
            <p className="eyebrow">DETALHES DO PROJETO</p>
            <h2>{selectedProject.name}</h2>
            <p>{selectedProject.stack}</p>
          </div>
          <dl>
            <div>
              <dt>Autor</dt>
              <dd>{selectedProject.author || '—'}</dd>
            </div>
            <div>
              <dt>Banco</dt>
              <dd>{selectedProject.database.type}</dd>
            </div>
            <div>
              <dt>Features</dt>
              <dd>{selectedProject.features.join(', ') || 'Nenhuma'}</dd>
            </div>
            <div>
              <dt>Caminho</dt>
              <dd>{selectedProject.path}</dd>
            </div>
          </dl>
        </section>
      )}
    </section>
  )
}
