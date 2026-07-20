/* eslint-disable react/prop-types */
import { useEffect, useState } from 'react'
import logo from "../assets/logo.png";
import LogViewer from '../components/LogViewer'
import ProjectForm from '../components/ProjectForm'
import StartView from '../components/StartView'
import ProjectsView from '../components/ProjectsView'
import QuickGuideModal from '../components/QuickGuideModal'

import { Package, House, Plus, ChevronLeft, ChevronRight, Sun, Moon } from "lucide-react"

const STORAGE_KEY = 'api-bootstrap.projects'
const THEME_KEY = 'api-bootstrap.theme'

function getStoredProjects() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
  } catch {
    localStorage.removeItem(STORAGE_KEY)
    return []
  }
}

function getStoredTheme() {
  const stored = localStorage.getItem(THEME_KEY)
  if (stored === 'light' || stored === 'dark') return stored
  return window.matchMedia?.('(prefers-color-scheme: light)').matches ? 'light' : 'dark'
}

export default function Home() {
  const [projects, setProjects] = useState(getStoredProjects)
  const [selectedProject, setSelectedProject] = useState(null)
  const [view, setView] = useState('home')
  const [sidebarHidden, setSidebarHidden] = useState(false)
  const [logsHidden, setLogsHidden] = useState(true)
  const [guideOpen, setGuideOpen] = useState(false)
  const [theme, setTheme] = useState(getStoredTheme)

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    localStorage.setItem(THEME_KEY, theme)
  }, [theme])

  function navigate(nextView) {
    setView(nextView)
    if (nextView === 'projects') setSidebarHidden(false)
  }

  function saveProject(project) {
    setProjects((current) => {
      const next = [project, ...current.filter((item) => item.path !== project.path)].slice(0, 30)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      return next
    })
    setSelectedProject(project)
  }

  function openProject(project) {
    setSelectedProject(project)
    navigate('projects')
  }

  const sidebarExpanded = view === 'projects'
  const content =
    view === 'create' ? (
      <ProjectForm onProjectCreated={saveProject} />
    ) : view === 'projects' ? (
      <ProjectsView
        projects={projects}
        selectedProject={selectedProject}
        onSelect={setSelectedProject}
        onCreate={() => navigate('create')}
      />
    ) : (
      <StartView
        projects={projects}
        onCreate={() => navigate('create')}
        onProjects={() => navigate('projects')}
        onGuide={() => setGuideOpen(true)}
        onOpenProject={openProject}
      />
    )

  return (
    <main
      className={`dashboard ${sidebarHidden ? 'sidebar-hidden' : ''} ${sidebarExpanded ? 'sidebar-expanded' : ''} ${logsHidden ? 'logs-hidden' : ''}`}
    >
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-mark"><img src={logo} alt="logo api boostrap" className='logo' /></span>
          <div>
            <strong>API Bootstrap</strong>
            <small>Project studio</small>
          </div>
          <button
            type="button"
            className="collapse-button"
            onClick={() => setSidebarHidden(true)}
            title="Esconder barra lateral"
          >
            <ChevronLeft size={20} />
          </button>
        </div>
        <button
          type="button"
          className="theme-toggle"
          onClick={() => setTheme((current) => (current === 'dark' ? 'light' : 'dark'))}
          title={theme === 'dark' ? 'Ativar tema claro' : 'Ativar tema escuro'}
        >
          {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
          {theme === 'dark' ? 'Tema claro' : 'Tema escuro'}
        </button>
        <nav className="side-navigation">
          <button
            type="button"
            className={view === 'home' ? 'active' : ''}
            onClick={() => navigate('home')}
          >
            <span><House size={20} /></span> Início
          </button>
          <button
            type="button"
            className={view === 'projects' ? 'active' : ''}
            onClick={() => navigate('projects')}
          >
            <span><Package size={20} /></span> Projetos <small>{projects.length}</small>
          </button>
          <button
            type="button"
            className={view === 'create' ? 'active' : ''}
            onClick={() => navigate('create')}
          >
            <span><Plus size={20} /></span> Criar projeto
          </button>
        </nav>
        {sidebarExpanded && (
          <div className="sidebar-projects">
            <div className="sidebar-heading">
              <span>TODOS OS PROJETOS</span>
              <small>{projects.length}</small>
            </div>
            <div className="project-list">
              {projects.length === 0 ? (
                <p className="empty-list">Ainda não há projetos locais.</p>
              ) : (
                projects.map((project) => (
                  <button
                    type="button"
                    className={`project-item ${selectedProject?.id === project.id ? 'active' : ''}`}
                    key={project.id}
                    onClick={() => setSelectedProject(project)}
                  >
                    <span>{project.name}</span>
                    <small>
                      {project.author || 'Sem autor'} · {project.database.type}
                    </small>
                  </button>
                ))
              )}
            </div>
          </div>
        )}
        {selectedProject && !sidebarExpanded && (
          <section className="project-card">
            <p className="eyebrow">Último projeto</p>

            <h3 className="project-card__title">
              {selectedProject.name}
            </h3>

            <p className="project-card__author">
              {selectedProject.author || 'Sem autor'}
            </p>

            <button type="button" onClick={() => navigate('projects')}>
              Ver detalhes
            </button>
          </section>
        )}
      </aside>
      {sidebarHidden && (
        <button
          type="button"
          className="show-sidebar"
          onClick={() => setSidebarHidden(false)}
          title="Mostrar barra lateral"
        >
          <ChevronRight size={20} />
        </button>
      )}
      <section className="workspace">
        <header className="workspace-header">
          <div>

            <h1>
              {view === 'home'
                ? 'Seu estúdio de APIs'
                : view === 'projects'
                  ? 'Projetos locais'
                  : 'Configure sua API'}
            </h1>
            <p>
              {view === 'home'
                ? 'Crie e acompanhe APIs em um único painel.'
                : view === 'projects'
                  ? 'Consulte os projetos gerados neste computador.'
                  : 'Defina a base, os dados e os módulos antes de gerar.'}
            </p>
          </div>
        </header>
        <div className="workspace-content" key={view}>
          {content}
        </div>
        <LogViewer hidden={logsHidden} onToggle={() => setLogsHidden((current) => !current)} />
      </section>
      {guideOpen && <QuickGuideModal onClose={() => setGuideOpen(false)} />}
    </main>
  )
}
