/* eslint-disable react/prop-types */
import { useMemo, useState } from 'react'

import FolderSelector from './FolderSelector'

const steps = ['Projeto', 'Stack', 'Banco', 'Modelos', 'Features', 'Resumo']
const featureOptions = [
  { id: 'jwt', title: 'JWT', text: 'Autenticação e hash de senha' },
  { id: 'swagger', title: 'Swagger', text: 'Documentação em /docs' },
  { id: 'docker', title: 'Docker', text: 'Container e Compose' },
  { id: 'quality', title: 'Qualidade', text: 'ESLint, Prettier, Helmet e Morgan' }
]

export default function ProjectForm({ onProjectCreated }) {
  const [step, setStep] = useState(0)
  const [project, setProject] = useState({
    name: '',
    author: '',
    version: '1.0.0',
    folder: '',
    database: 'postgresql',
    host: 'localhost',
    port: '5432',
    databaseName: '',
    username: 'postgres',
    password: '',
    features: []
  })
  const [tables, setTables] = useState([])
  const [table, setTable] = useState({
    name: '',
    field: 'name',
    type: 'STRING',
    required: true,
    unique: false
  })
  const [status, setStatus] = useState('')
  const [generating, setGenerating] = useState(false)
  const destination = useMemo(
    () => (project.folder && project.name ? `${project.folder}/${project.name}` : ''),
    [project.folder, project.name]
  )
  const update = (name, value) => setProject((current) => ({ ...current, [name]: value }))

  function addTable() {
    if (
      !table.name.trim() ||
      !table.field.trim() ||
      tables.some((item) => item.name === table.name.trim())
    )
      return
    setTables((current) => [
      ...current,
      {
        name: table.name.trim(),
        fields: [
          {
            name: table.field.trim(),
            type: table.type,
            required: table.required,
            unique: table.unique
          }
        ]
      }
    ])
    setTable({ name: '', field: 'name', type: 'STRING', required: true, unique: false })
  }

  function toggleFeature(id) {
    update(
      'features',
      project.features.includes(id)
        ? project.features.filter((item) => item !== id)
        : [...project.features, id]
    )
  }

  function canAdvance() {
    if (step === 0) return Boolean(project.name.trim() && project.author.trim() && project.folder)
    return true
  }

  async function generate() {
    if (!canAdvance()) {
      setStep(0)
      setStatus('Preencha nome, autor e pasta de destino para continuar.')
      return
    }
    setGenerating(true)
    setStatus('Gerando projeto…')
    const payload = {
      name: project.name,
      author: project.author,
      version: project.version,
      path: destination,
      stack: 'node-express',
      destination,
      database: {
        type: project.database,
        host: project.host,
        port: project.port,
        name: project.databaseName || project.name,
        username: project.username,
        password: project.password
      },
      tables,
      relations: [],
      features: project.features,
      variables: {
        PROJECT_NAME: project.name,
        DESCRIPTION: `${project.name} API`,
        AUTHOR: project.author,
        YEAR: String(new Date().getFullYear())
      }
    }
    const result = await window.api.generator.generateProject(payload)
    setGenerating(false)
    if (!result.success) {
      setStatus(result.message)
      return
    }
    const savedProject = {
      id: crypto.randomUUID(),
      name: project.name,
      author: project.author,
      version: project.version,
      path: destination,
      stack: 'Node + Express + Sequelize',
      database: { type: project.database, name: payload.database.name },
      features: project.features,
      tablesCount: tables.length,
      createdAt: new Date().toISOString()
    }
    onProjectCreated(savedProject)
    setStatus('Projeto criado e salvo no painel local.')
  }

  return (
    <div className="project-builder">
      <nav className="stepper" aria-label="Etapas do projeto">
        {steps.map((label, index) => (
          <button
            type="button"
            key={label}
            className={index === step ? 'current' : index < step ? 'completed' : ''}
            onClick={() => index <= step && setStep(index)}
          >
            <span>{index < step ? '✓' : index + 1}</span>
            {label}
          </button>
        ))}
      </nav>
      <section className="form-card">
        {step === 0 && (
          <div className="step-content">
            <div>
              <p className="eyebrow">ETAPA 1 DE 6</p>
              <h2>Informações do projeto</h2>
              <p className="muted">Esses dados aparecem no package.json e no histórico local.</p>
            </div>
            <div className="field-grid">
              <label>
                Nome do projeto
                <input
                  value={project.name}
                  onChange={(event) => update('name', event.target.value)}
                  placeholder="minha-api"
                  autoFocus
                />
              </label>
              <label>
                Autor
                <input
                  value={project.author}
                  onChange={(event) => update('author', event.target.value)}
                  placeholder="Seu nome"
                />
              </label>
              <label>
                Versão
                <input
                  value={project.version}
                  onChange={(event) => update('version', event.target.value)}
                />
              </label>
              <FolderSelector
                folder={project.folder}
                setFolder={(folder) => update('folder', folder)}
              />
            </div>
          </div>
        )}
        {step === 1 && (
          <div className="step-content">
            <p className="eyebrow">ETAPA 2 DE 6</p>
            <h2>Escolha a stack</h2>
            <div className="stack-option selected">
              <span className="stack-icon">N</span>
              <div>
                <strong>Node + Express + Sequelize</strong>
                <p>API JavaScript com migrations e integração de banco.</p>
              </div>
              <b>Selecionada</b>
            </div>
            <p className="muted">Prisma, Fastify e NestJS estarão disponíveis em futuras stacks.</p>
          </div>
        )}
        {step === 2 && (
          <div className="step-content">
            <p className="eyebrow">ETAPA 3 DE 6</p>
            <h2>Banco de dados</h2>
            <div className="database-options">
              {['postgresql', 'mysql', 'sqlite'].map((database) => (
                <button
                  key={database}
                  type="button"
                  className={project.database === database ? 'selected' : ''}
                  onClick={() => update('database', database)}
                >
                  {database === 'postgresql'
                    ? 'PostgreSQL'
                    : database === 'mysql'
                      ? 'MySQL'
                      : 'SQLite'}
                </button>
              ))}
            </div>
            {project.database === 'sqlite' ? (
              <p className="notice">O arquivo SQLite será configurado localmente no projeto.</p>
            ) : (
              <div className="field-grid">
                <label>
                  Host
                  <input
                    value={project.host}
                    onChange={(event) => update('host', event.target.value)}
                  />
                </label>
                <label>
                  Porta
                  <input
                    value={project.port}
                    onChange={(event) => update('port', event.target.value)}
                  />
                </label>
                <label>
                  Usuário
                  <input
                    value={project.username}
                    onChange={(event) => update('username', event.target.value)}
                  />
                </label>
                <label>
                  Senha
                  <input
                    type="password"
                    value={project.password}
                    onChange={(event) => update('password', event.target.value)}
                  />
                </label>
              </div>
            )}
            <label className="full-field">
              Nome do banco
              <input
                value={project.databaseName}
                onChange={(event) => update('databaseName', event.target.value)}
                placeholder={project.name || 'minha_api'}
              />
            </label>
          </div>
        )}
        {step === 3 && (
          <div className="step-content">
            <p className="eyebrow">ETAPA 4 DE 6</p>
            <h2>Modelos e tabelas</h2>
            <div className="field-grid model-fields">
              <label>
                Tabela
                <input
                  value={table.name}
                  onChange={(event) => setTable({ ...table, name: event.target.value })}
                  placeholder="users"
                />
              </label>
              <label>
                Campo
                <input
                  value={table.field}
                  onChange={(event) => setTable({ ...table, field: event.target.value })}
                  placeholder="email"
                />
              </label>
              <label>
                Tipo
                <select
                  value={table.type}
                  onChange={(event) => setTable({ ...table, type: event.target.value })}
                >
                  {['STRING', 'TEXT', 'INTEGER', 'BOOLEAN', 'DATE'].map((type) => (
                    <option key={type}>{type}</option>
                  ))}
                </select>
              </label>
              <div className="checkboxes">
                <label>
                  <input
                    type="checkbox"
                    checked={table.required}
                    onChange={(event) => setTable({ ...table, required: event.target.checked })}
                  />{' '}
                  Obrigatório
                </label>
                <label>
                  <input
                    type="checkbox"
                    checked={table.unique}
                    onChange={(event) => setTable({ ...table, unique: event.target.checked })}
                  />{' '}
                  Único
                </label>
              </div>
            </div>
            <button type="button" className="secondary-button" onClick={addTable}>
              + Adicionar modelo
            </button>
            <div className="table-list">
              {tables.length === 0 ? (
                <p className="muted">Nenhum modelo adicionado ainda.</p>
              ) : (
                tables.map((item) => (
                  <div key={item.name}>
                    <strong>{item.name}</strong>
                    <span>
                      {item.fields.map((field) => `${field.name}: ${field.type}`).join(', ')}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setTables((current) => current.filter((entry) => entry.name !== item.name))
                      }
                    >
                      Remover
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
        {step === 4 && (
          <div className="step-content">
            <p className="eyebrow">ETAPA 5 DE 6</p>
            <h2>Features opcionais</h2>
            <div className="feature-grid">
              {featureOptions.map((feature) => (
                <button
                  type="button"
                  className={project.features.includes(feature.id) ? 'feature selected' : 'feature'}
                  onClick={() => toggleFeature(feature.id)}
                  key={feature.id}
                >
                  <span>{project.features.includes(feature.id) ? '✓' : '+'}</span>
                  <strong>{feature.title}</strong>
                  <small>{feature.text}</small>
                </button>
              ))}
            </div>
          </div>
        )}
        {step === 5 && (
          <div className="step-content">
            <p className="eyebrow">ETAPA 6 DE 6</p>
            <h2>Revise antes de gerar</h2>
            <div className="summary-grid">
              <div>
                <small>Projeto</small>
                <strong>{project.name || '—'}</strong>
                <span>
                  por {project.author || '—'} · v{project.version}
                </span>
              </div>
              <div>
                <small>Stack</small>
                <strong>Node + Express + Sequelize</strong>
                <span>{project.database}</span>
              </div>
              <div>
                <small>Estrutura</small>
                <strong>{tables.length} modelos</strong>
                <span>
                  {project.features.length ? project.features.join(', ') : 'Sem features'}
                </span>
              </div>
              <div>
                <small>Destino</small>
                <strong className="path-value">{destination || '—'}</strong>
              </div>
            </div>
            {status && <p className="form-status">{status}</p>}
          </div>
        )}
        <footer className="form-actions">
          <button
            type="button"
            className="secondary-button"
            disabled={step === 0}
            onClick={() => setStep((current) => current - 1)}
          >
            Voltar
          </button>
          {step < steps.length - 1 ? (
            <button
              type="button"
              className="primary-button"
              onClick={() =>
                canAdvance()
                  ? setStep((current) => current + 1)
                  : setStatus('Preencha nome, autor e pasta de destino.')
              }
            >
              Continuar
            </button>
          ) : (
            <button
              type="button"
              className="primary-button"
              disabled={generating}
              onClick={generate}
            >
              {generating ? 'Gerando…' : 'Gerar projeto'}
            </button>
          )}
        </footer>
      </section>
    </div>
  )
}
