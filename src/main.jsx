import React, { useEffect, useMemo, useState } from 'react'
import { createRoot } from 'react-dom/client'
import {
  Bell, BriefcaseBusiness, CalendarDays, Check, ChevronDown, CircleHelp,
  ClipboardList, Filter, LayoutDashboard, MoreHorizontal, Plus, Search,
  SlidersHorizontal, Sparkles, Trash2, X, Zap
} from 'lucide-react'
import './styles.css'

const columns = [
  { id: 'todo', title: 'К выполнению', tone: 'violet' },
  { id: 'doing', title: 'В работе', tone: 'amber' },
  { id: 'done', title: 'Готово', tone: 'green' },
]

const seedProjects = [
  { id: 'p1', name: 'ЖК «Северный парк»', address: 'ул. Лесная, 24', color: '#7367f0' },
  { id: 'p2', name: 'Офисный центр «Форум»', address: 'пр-т Мира, 18', color: '#ef8f5b' },
]

const seedTasks = [
  { id: 't1', projectId: 'p1', title: 'Подготовить площадку под фундамент', description: 'Проверить разметку и подготовить технику к началу работ.', priority: 'Высокий', due: '2026-11-12', status: 'todo' },
  { id: 't2', projectId: 'p1', title: 'Согласовать план электрики', description: 'Передать обновлённую схему инженеру на проверку.', priority: 'Средний', due: '2026-11-14', status: 'todo' },
  { id: 't3', projectId: 'p1', title: 'Заказать бетон М300', description: 'Уточнить объём и подтвердить дату поставки.', priority: 'Высокий', due: '2026-11-10', status: 'doing' },
  { id: 't4', projectId: 'p1', title: 'Разметка первого этажа', description: 'Разметка осей выполнена по рабочему проекту.', priority: 'Низкий', due: '2026-11-08', status: 'done' },
  { id: 't5', projectId: 'p1', title: 'Проверить гидроизоляцию', description: 'Фотозафиксировать результат перед обратной засыпкой.', priority: 'Средний', due: '2026-11-16', status: 'doing' },
  { id: 't6', projectId: 'p2', title: 'Получить чертежи фасада', description: 'Запросить финальную версию у архитектора.', priority: 'Средний', due: '2026-11-18', status: 'todo' },
]

function load(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key)) || fallback } catch { return fallback }
}

function App() {
  const [projects, setProjects] = useState(() => load('stroy-projects', seedProjects))
  const [tasks, setTasks] = useState(() => load('stroy-tasks', seedTasks))
  const [activeProject, setActiveProject] = useState('p1')
  const [query, setQuery] = useState('')
  const [priorityFilter, setPriorityFilter] = useState('Все приоритеты')
  const [modal, setModal] = useState(null)
  const [dragged, setDragged] = useState(null)
  const [toast, setToast] = useState('')

  useEffect(() => localStorage.setItem('stroy-projects', JSON.stringify(projects)), [projects])
  useEffect(() => localStorage.setItem('stroy-tasks', JSON.stringify(tasks)), [tasks])
  useEffect(() => { if (toast) { const id = setTimeout(() => setToast(''), 2600); return () => clearTimeout(id) } }, [toast])

  const project = projects.find(p => p.id === activeProject) || projects[0]
  const projectTasks = useMemo(() => tasks.filter(task => task.projectId === project?.id &&
    task.title.toLowerCase().includes(query.toLowerCase()) &&
    (priorityFilter === 'Все приоритеты' || task.priority === priorityFilter)), [tasks, project, query, priorityFilter])
  const counts = columns.map(c => projectTasks.filter(t => t.status === c.id).length)
  const total = tasks.filter(t => t.projectId === project?.id).length
  const done = tasks.filter(t => t.projectId === project?.id && t.status === 'done').length

  function saveTask(data) {
    if (data.id) setTasks(prev => prev.map(t => t.id === data.id ? { ...t, ...data } : t))
    else setTasks(prev => [...prev, { ...data, id: `t${Date.now()}`, projectId: project.id, status: 'todo' }])
    setModal(null); setToast(data.id ? 'Карточка обновлена' : 'Задача добавлена')
  }
  function moveTask(id, status) { setTasks(prev => prev.map(t => t.id === id ? { ...t, status } : t)); setToast('Статус задачи изменён') }
  function removeTask(id) { setTasks(prev => prev.filter(t => t.id !== id)); setModal(null); setToast('Карточка удалена') }
  function addProject() {
    const name = prompt('Название нового проекта')
    if (!name?.trim()) return
    const p = { id: `p${Date.now()}`, name: name.trim(), address: 'Новый объект', color: '#4ea9a1' }
    setProjects(prev => [...prev, p]); setActiveProject(p.id); setToast('Проект создан')
  }

  return <div className="app-shell">
    <aside className="sidebar">
      <div className="brand"><img className="brand-logo" src="/logo.avif" alt="Логотип строительной компании" /><span>строй<span className="brand-accent">трекер</span></span></div>
      <div className="workspace-label">РАБОЧЕЕ ПРОСТРАНСТВО <ChevronDown size={14} /></div>
      <nav>
        <button className="nav-item active"><LayoutDashboard size={18} /> Обзор</button>
        <button className="nav-item"><ClipboardList size={18} /> Мои задачи <span className="nav-count">{tasks.filter(t => t.status !== 'done').length}</span></button>
        <button className="nav-item"><CalendarDays size={18} /> Календарь</button>
      </nav>
      <div className="side-section"><div className="side-title">ПРОЕКТЫ <button onClick={addProject} aria-label="Добавить проект"><Plus size={15} /></button></div>
        {projects.map(p => <button key={p.id} onClick={() => setActiveProject(p.id)} className={`project-link ${activeProject === p.id ? 'selected' : ''}`}><i style={{ background: p.color }} />{p.name}</button>)}
      </div>
      <div className="sidebar-bottom"><button className="nav-item"><CircleHelp size={18} /> Помощь</button><div className="user"><div className="avatar">АМ</div><div><b>Алексей М.</b><small>Руководитель проекта</small></div><MoreHorizontal size={17} /></div></div>
    </aside>

    <main className="main-content">
      <header className="topbar"><div className="breadcrumbs"><span>Проекты</span><b>/</b><strong>{project?.name}</strong></div><div className="top-actions"><button className="icon-button"><Bell size={19} /><em /></button><div className="mini-avatar">АМ</div></div></header>
      <section className="content-wrap">
        <div className="page-heading"><div><div className="eyebrow"><BriefcaseBusiness size={15} /> СТРОИТЕЛЬНЫЙ ОБЪЕКТ</div><h1>{project?.name}</h1><p>{project?.address} <span className="dot">•</span> Активный проект</p></div><button className="primary-btn" onClick={() => setModal({ task: null })}><Plus size={18} /> Новая задача</button></div>
        <div className="stats-row"><div className="stat-card"><div className="stat-icon purple"><ClipboardList size={18} /></div><div><small>Всего задач</small><strong>{total}</strong></div></div><div className="stat-card"><div className="stat-icon orange"><Zap size={18} /></div><div><small>В работе</small><strong>{counts[1]}</strong></div></div><div className="stat-card"><div className="stat-icon teal"><Check size={18} /></div><div><small>Выполнено</small><strong>{done}</strong></div></div><div className="progress-card"><div><small>Прогресс проекта</small><strong>{total ? Math.round(done / total * 100) : 0}%</strong></div><div className="progress-track"><span style={{ width: `${total ? done / total * 100 : 0}%` }} /></div></div></div>
        <div className="board-toolbar"><div className="board-title"><h2>Задачи проекта</h2><span>{projectTasks.length} карточек</span></div><div className="toolbar-actions"><div className="search"><Search size={17} /><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Поиск задач..." /></div><div className="filter-wrap"><Filter size={16} /><select value={priorityFilter} onChange={e => setPriorityFilter(e.target.value)}><option>Все приоритеты</option><option>Высокий</option><option>Средний</option><option>Низкий</option></select></div><button className="icon-button filter-button"><SlidersHorizontal size={17} /></button></div></div>
        <div className="board">{columns.map((column, index) => <section className="column" key={column.id} onDragOver={e => e.preventDefault()} onDrop={() => dragged && moveTask(dragged, column.id)}><div className="column-header"><div><span className={`column-dot ${column.tone}`} /><h3>{column.title}</h3><b>{counts[index]}</b></div><button><MoreHorizontal size={18} /></button></div><div className="cards">{projectTasks.filter(t => t.status === column.id).map(task => <TaskCard key={task.id} task={task} onEdit={() => setModal({ task })} onDragStart={() => setDragged(task.id)} />)}{column.id === 'todo' && <button className="add-card" onClick={() => setModal({ task: null })}><Plus size={16} /> Добавить задачу</button>}</div></section>)}</div>
        <div className="board-note"><Sparkles size={16} /> Совет: перетаскивайте карточки между колонками, чтобы обновить статус задачи.</div>
      </section>
    </main>
    {modal && <TaskModal task={modal.task} onSave={saveTask} onDelete={removeTask} onClose={() => setModal(null)} />}
    {toast && <div className="toast"><Check size={16} /> {toast}</div>}
  </div>
}

function TaskCard({ task, onEdit, onDragStart }) {
  const overdue = task.status !== 'done' && task.due && new Date(task.due) < new Date()
  return <article className="task-card" draggable onDragStart={onDragStart} onClick={onEdit}><div className="task-top"><span className={`priority ${task.priority.toLowerCase()}`}>{task.priority}</span><button onClick={e => { e.stopPropagation(); onEdit() }}><MoreHorizontal size={17} /></button></div><h4>{task.title}</h4>{task.description && <p>{task.description}</p>}<div className="task-meta"><span className={overdue ? 'overdue' : ''}><CalendarDays size={14} /> {formatDate(task.due)}</span><span className="task-avatar">АМ</span></div></article>
}

function formatDate(value) { if (!value) return 'Без срока'; const date = new Date(value); return date.toLocaleDateString('ru-RU', { day: '2-digit', month: 'short' }).replace('.', '') }

function TaskModal({ task, onSave, onDelete, onClose }) {
  const [form, setForm] = useState(task || { title: '', description: '', priority: 'Средний', due: '' })
  const update = (key, value) => setForm(prev => ({ ...prev, [key]: value }))
  function submit(e) { e.preventDefault(); if (!form.title.trim()) return; onSave({ ...form, title: form.title.trim() }) }
  return <div className="modal-backdrop" onMouseDown={e => e.target === e.currentTarget && onClose()}><div className="modal"><div className="modal-head"><div><span className="eyebrow">ЗАДАЧА</span><h2>{task ? 'Редактировать задачу' : 'Новая задача'}</h2></div><button className="close-btn" onClick={onClose}><X size={19} /></button></div><form onSubmit={submit}><label>Название задачи<input autoFocus value={form.title} onChange={e => update('title', e.target.value)} placeholder="Например, принять материалы" /></label><label>Описание<textarea value={form.description} onChange={e => update('description', e.target.value)} placeholder="Коротко опишите результат задачи" rows="3" /></label><div className="form-grid"><label>Приоритет<select value={form.priority} onChange={e => update('priority', e.target.value)}><option>Высокий</option><option>Средний</option><option>Низкий</option></select></label><label>Срок<input type="date" value={form.due || ''} onChange={e => update('due', e.target.value)} /></label></div><div className="modal-actions">{task && <button type="button" className="delete-btn" onClick={() => onDelete(task.id)}><Trash2 size={16} /> Удалить</button>}<div className="modal-right"><button type="button" className="secondary-btn" onClick={onClose}>Отмена</button><button className="primary-btn">{task ? 'Сохранить' : 'Добавить задачу'}</button></div></div></form></div></div>
}

createRoot(document.getElementById('root')).render(<App />)
