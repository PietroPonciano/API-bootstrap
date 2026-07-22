/* eslint-disable react/prop-types */
import { useMemo, useState } from 'react'

import FolderSelector from './FolderSelector'
import { Table, X } from "lucide-react"
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
  const [relations, setRelations] = useState([])
  const [table, setTable] = useState({ name: '', primaryKeyType: 'integer', paranoid: false })
  const [fields, setFields] = useState([])
  const [selectedTableName, setSelectedTableName] = useState('')
  const [relation, setRelation] = useState({ from: '', to: '', type: 'belongsTo' })
  const [field, setField] = useState({
    name: '',
    type: 'STRING',
    required: true,
    unique: false,
    indexed: false,
    defaultValue: ''
  })
  const [status, setStatus] = useState('')
  const [generating, setGenerating] = useState(false)
  const [testingConnection, setTestingConnection] = useState(false)
  const destination = useMemo(
    () => (project.folder && project.name ? `${project.folder}/${project.name}` : ''),
    [project.folder, project.name]
  )
  const update = (name, value) => setProject((current) => ({ ...current, [name]: value }))

  function changeStep(nextStep) {
    setStatus('')
    setStep(nextStep)
  }

  function connectionProject() {
    return {
      destination,
      database: {
        type: project.database,
        host: project.host,
        port: project.port,
        name: project.databaseName || project.name,
        username: project.username,
        password: project.password
      }
    }
  }

  async function testDatabaseConnection() {
    if (!window.api?.generator?.testConnection) {
      setStatus('Reinicie o aplicativo para carregar o novo teste de conexão.')
      return false
    }
    setTestingConnection(true)
    setStatus('Testando conexão…')
    try {
      const result = await Promise.race([
        window.api.generator.testConnection(connectionProject()),
        new Promise((resolve) =>
          setTimeout(
            () =>
              resolve({
                success: false,
                message: 'O teste demorou demais. Verifique se o banco está acessível.'
              }),
            6500
          )
        )
      ])
      setStatus(result.message)
      return result.success
    } catch (error) {
      setStatus(
        error?.message?.includes('No handler registered')
          ? 'Reinicie o aplicativo para carregar o novo teste de conexão.'
          : 'Não foi possível iniciar o teste de conexão. Tente novamente.'
      )
      return false
    } finally {
      setTestingConnection(false)
    }
  }

  async function continueStep() {
    if (!canAdvance()) {
      setStatus('Preencha nome, autor e pasta de destino.')
      return
    }
    if (step === 2 && !(await testDatabaseConnection())) return
    setStatus('')
    setStep((current) => current + 1)
  }

  function addField() {
    if (!selectedTableName) {
      setStatus('Crie ou selecione uma tabela antes de adicionar colunas.')
      return
    }
    if (!field.name.trim() || fields.some((item) => item.name === field.name.trim())) return
    const nextFields = [...fields, { ...field, name: field.name.trim() }]
    setFields(nextFields)
    setTables((current) =>
      current.map((item) =>
        item.name === selectedTableName
          ? {
              ...item,
              fields: nextFields,
              indexes: nextFields
                .filter((entry) => entry.indexed)
                .map((entry) => ({ fields: [entry.name] }))
            }
          : item
      )
    )
    setField({
      name: '',
      type: 'STRING',
      required: true,
      unique: false,
      indexed: false,
      defaultValue: ''
    })
  }

  function addTable() {
    if (!table.name.trim()) {
      setStatus('Informe o nome da tabela antes de criá-la.')
      return
    }
    if (tables.some((item) => item.name === table.name.trim())) {
      setStatus('Já existe uma tabela com esse nome.')
      return
    }
    const name = table.name.trim()
    setTables((current) => [
      ...current,
      {
        ...table,
        name,
        fields: [],
        indexes: []
      }
    ])
    setTable({ name: '', primaryKeyType: 'integer', paranoid: false })
    setFields([])
    setSelectedTableName(name)
    setStatus(`Tabela "${name}" criada. Agora adicione as colunas.`)
  }

  function selectTable(name) {
    const selected = tables.find((item) => item.name === name)
    setSelectedTableName(name)
    setFields(selected?.fields || [])
  }

  function startNewTable() {
    setSelectedTableName('')
    setFields([])
    setTable({ name: '', primaryKeyType: 'integer', paranoid: false })
    setStatus('Preencha os dados para criar uma nova tabela.')
  }

  function removeTable(name) {
    setTables((current) => current.filter((item) => item.name !== name))
    setRelations((current) => current.filter((item) => item.from !== name && item.to !== name))
    if (selectedTableName === name) startNewTable()
  }

  function removeField(name) {
    const nextFields = fields.filter((fieldItem) => fieldItem.name !== name)
    setFields(nextFields)
    setTables((current) =>
      current.map((item) =>
        item.name === selectedTableName
          ? {
              ...item,
              fields: nextFields,
              indexes: nextFields
                .filter((entry) => entry.indexed)
                .map((entry) => ({ fields: [entry.name] }))
            }
          : item
      )
    )
  }

  function addRelation() {
    if (!relation.from || !relation.to || relation.from === relation.to) {
      setStatus('Selecione uma tabela de destino diferente para criar a relação.')
      return
    }
    setRelations((current) => [...current, relation])
    setRelation((current) => ({ ...current, to: '' }))
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
      changeStep(0)
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
      relations,
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
            onClick={() => index <= step && changeStep(index)}
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
            <button
              type="button"
              className="secondary-button connection-test-button"
              onClick={testDatabaseConnection}
              disabled={testingConnection}
            >
              {testingConnection ? 'Testando conexão…' : 'Testar conexão'}
            </button>
          </div>
        )}
        {step === 3 && (
          <div className="step-content">
            <p className="eyebrow">ETAPA 4 DE 6</p>
            <h2>Modelos e tabelas</h2>
            <p className="muted">
              Crie uma tabela, selecione-a e então configure seus campos e relações.
            </p>
            <div className="schema-builder">
              <aside className="schema-sidebar" aria-label="Suas tabelas">
                <div className="schema-sidebar-heading">
                  <div>
                    <h3>Suas tabelas</h3>
                    <span>
                      {tables.length} {tables.length === 1 ? 'tabela' : 'tabelas'}
                    </span>
                  </div>
                  <button
                    type="button"
                    className="primary-button new-table-button"
                    onClick={startNewTable}
                  >
                    + Nova Tabela
                  </button>
                </div>
                {!selectedTableName && (
                  <div className="new-table-form">
                    <label>
                      Nome da tabela
                      <input
                        value={table.name}
                        onChange={(event) => setTable({ ...table, name: event.target.value })}
                        placeholder="ex.: usuarios"
                        autoFocus
                      />
                    </label>
                    <label>
                      Chave primária
                      <select
                        value={table.primaryKeyType}
                        onChange={(event) =>
                          setTable({ ...table, primaryKeyType: event.target.value })
                        }
                      >
                        <option value="integer">Integer auto incremento</option>
                        <option value="uuid">UUID</option>
                      </select>
                    </label>
                    <label className="compact-check">
                      <input
                      className='checkbox'
                        type="checkbox"
                        checked={table.paranoid}
                        onChange={(event) => setTable({ ...table, paranoid: event.target.checked })}
                      />{' '}
                      Soft delete
                    </label>
                    <button type="button" className="secondary-button" onClick={addTable}>
                      Criar tabela
                    </button>
                  </div>
                )}
                <div className="schema-table-list">
                  {tables.length === 0 ? (
                    <p className="muted">Comece criando sua primeira tabela.</p>
                  ) : (
                    tables.map((item) => (
                      <div
                        className={
                          item.name === selectedTableName
                            ? 'schema-table-item selected'
                            : 'schema-table-item'
                        }
                        key={item.name}
                      >
                        <button
                          type="button"
                          className="table-select"
                          onClick={() => selectTable(item.name)}
                        >
                          <span className="table-glyph"><Table /></span>
                          <span>
                            <strong>{item.name}</strong>
                            <small>
                              {item.fields.length} {item.fields.length === 1 ? 'coluna' : 'colunas'}
                            </small>
                          </span>
                        </button>
                        <button
                          type="button"
                          className="remove-icon"
                          aria-label={`Remover tabela ${item.name}`}
                          onClick={() => removeTable(item.name)}
                        >
                          <X />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </aside>
              <section className="schema-editor">
                {selectedTableName ? (
                  <>
                    <header className="schema-editor-heading">
                      <div>
                        <span className="eyebrow">EDITANDO TABELA</span>
                        <h3>{selectedTableName}</h3>
                      </div>
                      <span className="editor-badge">
                        {fields.length} {fields.length === 1 ? 'campo' : 'campos'}
                      </span>
                    </header>
                    <section className="schema-section">
                      <div className="schema-section-heading">
                        <div>
                          <h4>Colunas</h4>
                          <p>Defina os dados que esta tabela irá armazenar.</p>
                        </div>
                      </div>
                      <div className="columns-list">
                        {fields.length === 0 ? (
                          <p className="empty-columns">
                            Ainda não há colunas. Adicione o primeiro campo abaixo.
                          </p>
                        ) : (
                          fields.map((item) => (
                            <div className="column-row" key={item.name}>
                              <strong>{item.name}</strong>
                              <code>{item.type}</code>
                              <span>
                                {[
                                  item.required && 'Obrigatório',
                                  item.unique && 'Único',
                                  item.indexed && 'Indexado'
                                ]
                                  .filter(Boolean)
                                  .join(' · ') || 'Opcional'}
                              </span>
                              <button type="button" onClick={() => removeField(item.name)}>
                                Remover
                              </button>
                            </div>
                          ))
                        )}
                      </div>
                      <div className="column-form">
                        <label>
                          Nome do campo
                          <input
                            value={field.name}
                            onChange={(event) => setField({ ...field, name: event.target.value })}
                            placeholder="ex.: email"
                          />
                        </label>
                        <label>
                          Tipo
                          <select
                            value={field.type}
                            onChange={(event) => setField({ ...field, type: event.target.value })}
                          >
                            {['STRING', 'TEXT', 'INTEGER', 'BOOLEAN', 'DATE', 'UUID'].map(
                              (type) => (
                                <option key={type}>{type}</option>
                              )
                            )}
                          </select>
                        </label>
                        <label>
                          Valor padrão
                          <input
                            value={field.defaultValue}
                            onChange={(event) =>
                              setField({ ...field, defaultValue: event.target.value })
                            }
                            placeholder="Opcional"
                          />
                        </label>
                        <div className="column-checks">
                          <label>
                            <input
                            className='checkbox'
                              type="checkbox"
                              checked={field.required}
                              onChange={(event) =>
                                setField({ ...field, required: event.target.checked })
                              }
                            />{' '}
                            Obrigatório
                          </label>
                          <label>
                            <input
                            className='checkbox'
                              type="checkbox"
                              checked={field.unique}
                              onChange={(event) =>
                                setField({ ...field, unique: event.target.checked })
                              }
                            />{' '}
                            Único
                          </label>
                          <label>
                            <input
                            className='checkbox'
                              type="checkbox"
                              checked={field.indexed}
                              onChange={(event) =>
                                setField({ ...field, indexed: event.target.checked })
                              }
                            />{' '}
                            Indexado
                          </label>
                        </div>
                        <button
                          type="button"
                          className="secondary-button add-column-button"
                          onClick={addField}
                        >
                          + Adicionar Coluna
                        </button>
                      </div>
                    </section>
                    <section className="schema-section relations-section">
                      <div className="schema-section-heading">
                        <div>
                          <h4>Relações desta tabela</h4>
                          <p>Conecte esta tabela a outras tabelas do seu modelo.</p>
                        </div>
                      </div>
                      <div className="relation-form">
                        <label>
                          Origem
                          <select value={selectedTableName} disabled>
                            <option>{selectedTableName}</option>
                          </select>
                        </label>
                        <label>
                          Tipo de relação
                          <select
                            value={relation.type}
                            onChange={(event) =>
                              setRelation({
                                ...relation,
                                from: selectedTableName,
                                type: event.target.value
                              })
                            }
                          >
                            {['belongsTo', 'hasOne', 'hasMany', 'belongsToMany'].map((type) => (
                              <option key={type}>{type}</option>
                            ))}
                          </select>
                        </label>
                        <label>
                          Destino
                          <select
                            value={relation.to}
                            onChange={(event) =>
                              setRelation({
                                ...relation,
                                from: selectedTableName,
                                to: event.target.value
                              })
                            }
                          >
                            <option value="">Selecione uma tabela</option>
                            {tables
                              .filter((item) => item.name !== selectedTableName)
                              .map((item) => (
                                <option key={item.name} value={item.name}>
                                  {item.name}
                                </option>
                              ))}
                          </select>
                        </label>
                        <button
                          type="button"
                          className="secondary-button"
                          onClick={addRelation}
                          disabled={tables.length < 2}
                        >
                          Adicionar relação
                        </button>
                      </div>
                      {relations.filter((item) => item.from === selectedTableName).length > 0 && (
                        <div className="relation-list">
                          {relations
                            .filter((item) => item.from === selectedTableName)
                            .map((item, index) => (
                              <span key={`${item.to}-${index}`}>
                                <strong>{item.from}</strong> {item.type} <strong>{item.to}</strong>
                              </span>
                            ))}
                        </div>
                      )}
                    </section>
                  </>
                ) : (
                  <div className="schema-empty">
                    <span><Table /></span>
                    <h3>Crie ou selecione uma tabela</h3>
                    <p>
                      Escolha uma tabela à esquerda para começar a estruturar seus campos e
                      relações.
                    </p>
                  </div>
                )}
              </section>
            </div>
            <div className="legacy-schema">
              <div
                className={`field-grid model-fields ${selectedTableName ? 'columns-mode' : 'table-mode'}`}
              >
                <label>
                  Tabela
                  <input
                    value={table.name}
                    onChange={(event) => setTable({ ...table, name: event.target.value })}
                    placeholder="users"
                  />
                </label>
                <label>
                  Chave primária
                  <select
                    value={table.primaryKeyType}
                    onChange={(event) => setTable({ ...table, primaryKeyType: event.target.value })}
                  >
                    <option value="integer">Integer auto incremento</option>
                    <option value="uuid">UUID</option>
                  </select>
                </label>
                <label>
                  Tabela selecionada
                  <select
                    value={selectedTableName}
                    onChange={(event) => selectTable(event.target.value)}
                  >
                    <option value="">Crie ou selecione uma tabela</option>
                    {tables.map((item) => (
                      <option key={item.name} value={item.name}>
                        {item.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="table-option-field">
                  <span>Soft delete</span>
                  <input
                  className='checkbox'
                    type="checkbox"
                    checked={table.paranoid}
                    onChange={(event) => setTable({ ...table, paranoid: event.target.checked })}
                  />
                </label>
                <label hidden={!selectedTableName}>
                  Campo
                  <input
                    disabled={!selectedTableName}
                    value={field.name}
                    onChange={(event) => setField({ ...field, name: event.target.value })}
                    placeholder="email"
                  />
                </label>
                <label hidden={!selectedTableName}>
                  Tipo
                  <select
                    disabled={!selectedTableName}
                    value={field.type}
                    onChange={(event) => setField({ ...field, type: event.target.value })}
                  >
                    {['STRING', 'TEXT', 'INTEGER', 'BOOLEAN', 'DATE', 'UUID'].map((type) => (
                      <option key={type}>{type}</option>
                    ))}
                  </select>
                </label>
                <label>
                  Valor padrão
                  <input
                    disabled={!selectedTableName}
                    hidden={!selectedTableName}
                    value={field.defaultValue}
                    onChange={(event) => setField({ ...field, defaultValue: event.target.value })}
                    placeholder="Opcional"
                  />
                </label>
                <div className="checkboxes" hidden={!selectedTableName}>
                  <label>
                    <input
                    className='checkbox'
                      type="checkbox"
                      disabled={!selectedTableName}
                      checked={field.required}
                      onChange={(event) => setField({ ...field, required: event.target.checked })}
                    />{' '}
                    Obrigatório
                  </label>
                  <label>
                    <input
                    className='checkbox'
                      type="checkbox"
                      disabled={!selectedTableName}
                      checked={field.unique}
                      onChange={(event) => setField({ ...field, unique: event.target.checked })}
                    />{' '}
                    Único
                  </label>
                  <label>
                    <input
                    className='checkbox'
                      type="checkbox"
                      disabled={!selectedTableName}
                      checked={field.indexed}
                      onChange={(event) => setField({ ...field, indexed: event.target.checked })}
                    />{' '}
                    Indexado
                  </label>
                </div>
              </div>
              <button type="button" className="primary-button" onClick={addTable}>
                1. Criar tabela
              </button>
              {selectedTableName && (
                <button type="button" className="secondary-button" onClick={startNewTable}>
                  + Nova tabela
                </button>
              )}
              <button
                type="button"
                className="secondary-button"
                onClick={addField}
                disabled={!selectedTableName}
                hidden={!selectedTableName}
              >
                2. Adicionar coluna
              </button>
              <div className="table-list" hidden={!selectedTableName}>
                {fields.map((item) => (
                  <div key={item.name}>
                    <strong>{item.name}</strong>
                    <span>
                      {item.type}
                      {item.required ? ' · obrigatório' : ''}
                      {item.unique ? ' · único' : ''}
                    </span>
                    <button type="button" onClick={() => removeField(item.name)}>
                      Remover
                    </button>
                  </div>
                ))}
              </div>
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
                          setTables((current) =>
                            current.filter((entry) => entry.name !== item.name)
                          )
                        }
                      >
                        Remover
                      </button>
                    </div>
                  ))
                )}
              </div>
              {tables.length > 1 && (
                <div className="relation-builder">
                  <h3>Relações</h3>
                  <select
                    value={relation.from}
                    onChange={(event) => setRelation({ ...relation, from: event.target.value })}
                  >
                    <option value="">Tabela de origem</option>
                    {tables.map((item) => (
                      <option key={item.name} value={item.name}>
                        {item.name}
                      </option>
                    ))}
                  </select>
                  <select
                    value={relation.type}
                    onChange={(event) => setRelation({ ...relation, type: event.target.value })}
                  >
                    {['belongsTo', 'hasOne', 'hasMany', 'belongsToMany'].map((type) => (
                      <option key={type}>{type}</option>
                    ))}
                  </select>
                  <select
                    value={relation.to}
                    onChange={(event) => setRelation({ ...relation, to: event.target.value })}
                  >
                    <option value="">Tabela de destino</option>
                    {tables.map((item) => (
                      <option key={item.name} value={item.name}>
                        {item.name}
                      </option>
                    ))}
                  </select>
                  <button type="button" className="secondary-button" onClick={addRelation}>
                    Adicionar relação
                  </button>
                  <p className="muted">
                    {relations.map((item) => `${item.from} ${item.type} ${item.to}`).join(' · ')}
                  </p>
                </div>
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
          </div>
        )}
        {status && (
          <p className="form-status form-feedback" role="status" aria-live="polite">
            {status}
          </p>
        )}
        <footer className="form-actions">
          <button
            type="button"
            className="secondary-button"
            disabled={step === 0}
            onClick={() => changeStep(step - 1)}
          >
            Voltar
          </button>
          {step < steps.length - 1 ? (
            <button
              type="button"
              className="primary-button"
              disabled={testingConnection}
              onClick={continueStep}
            >
              {testingConnection ? 'Testando conexão…' : 'Continuar'}
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
