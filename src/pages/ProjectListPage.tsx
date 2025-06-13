import { useState, useEffect, useMemo, useCallback } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useCrud } from '../hooks/useCrud'
import { supabase } from '../supabaseClient'
import { Link } from 'react-router-dom'

import CrudPageLayout from '../components/ui/CrudPageLayout'
import DataTable, { type ColumnDefinition } from '../components/ui/DataTable'
import Pagination from '../components/ui/Pagination'
import CrudModal from '../components/ui/CrudModal'
import EmptyState from '../components/ui/EmptyState'

const Status = { Ativo: 1, Concluido: 2 } as const
type StatusType = typeof Status[keyof typeof Status]
const CommissionType = { Escritorio: 20, Pessoal: 50 } as const

interface Project {
  id: string
  name: string
  client_id: string
  total_value: number
  number_of_installments: number
  start_date: string
  status: StatusType
}

interface Client {
  id: string
  name: string
}

interface ProjectFormState {
  id?: string
  name: string
  client_id: string
  total_value: string
  comission_type: number
  number_of_installments: number
  start_date: string
  status: StatusType
  user_id?: string
}

const initialProjectState: Omit<ProjectFormState, 'id' | 'user_id'> = {
  name: '',
  client_id: '',
  total_value: 'R$ 0,00',
  comission_type: CommissionType.Escritorio,
  number_of_installments: 1,
  start_date: '',
  status: Status.Ativo,
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

const formatCurrencyInput = (text: string) => {
  if (!text) return ''
  const digitsOnly = text.replace(/\D/g, '')
  if (digitsOnly === '') return 'R$ 0,00'
  const numberValue = parseInt(digitsOnly, 10) / 100
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(numberValue)
}

const parseCurrency = (value: string) => {
  const numberString = value.replace('R$', '').replace(/\./g, '').replace(',', '.')
  return parseFloat(numberString) || 0
}

const formatDate = (dateString: string) => {
    if (!dateString) return '-'
    const date = new Date(dateString + 'T00:00:00')
    return date.toLocaleDateString('pt-BR')
}

export default function ProjectListPage() {
  const { user } = useAuth()
  const [clients, setClients] = useState<Client[]>([])

  const {
    currentItems: projects,
    loading, isSubmitting, setIsSubmitting,
    formState, setFormState,
    showCreateModal, showEditModal,
    currentPage, totalPages,
    editingItem,
    handleShowCreateModal, handleCloseCreateModal,
    handleShowEditModal: baseHandleShowEditModal,
    handleCloseEditModal, updateItem, deleteItem,
    paginate, fetchItems: fetchProjects,
  } = useCrud<Project, ProjectFormState>({
    tableName: 'projects',
    initialFormState: initialProjectState,
    fetchQuery: '*',
  })

  useEffect(() => {
    const fetchClients = async () => {
      const { data } = await supabase.from('clients').select('id, name').order('name')
      setClients(data || [])
    }
    fetchClients()
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    const finalValue = name === 'total_value' ? formatCurrencyInput(value) : value
    setFormState(prev => ({ ...prev, [name]: finalValue }))
  }

  const handleShowEditModal = useCallback((project: Project) => {
    setFormState({
        ...project,
        total_value: formatCurrency(project.total_value),
        comission_type: (project as any).comission_type,
        status: project.status,
    })
    baseHandleShowEditModal(project)
  }, [baseHandleShowEditModal, setFormState])

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !formState.client_id) return alert('Usuário ou cliente inválido')

    setIsSubmitting(true)
    try {
        const trimmedName = formState.name.trim()
        if (!trimmedName) throw new Error('O nome do projeto é obrigatório.')

        const { data: existing, error: checkError } = await supabase
            .from('projects').select('id').eq('name', trimmedName).limit(1)

        if (checkError) throw new Error(`Erro ao verificar nome: ${checkError.message}`)
        if (existing && existing.length > 0) throw new Error('Já existe um projeto com este nome.')

        const projectPayload = {
            ...formState, name: trimmedName,
            total_value: parseCurrency(formState.total_value),
            comission_type: Number(formState.comission_type),
            status: Number(formState.status),
            user_id: user.id,
        }

        const { data: newProject, error: projectError } = await supabase
        .from('projects').insert(projectPayload).select().single()

        if (projectError) throw projectError

        const installmentsToCreate = []
        const installmentValue = newProject.total_value / newProject.number_of_installments
        const startDate = new Date(newProject.start_date + 'T12:00:00Z')

        for (let i = 0; i < newProject.number_of_installments; i++) {
            const dueDate = new Date(startDate)
            dueDate.setMonth(startDate.getMonth() + i)
            installmentsToCreate.push({
                project_id: newProject.id,
                installment_number: i + 1,
                expected_value: installmentValue,
                due_date: dueDate.toISOString().split('T')[0],
                status: 1,
            })
        }
        const { error: installmentsError } = await supabase.from('installments').insert(installmentsToCreate)
        if (installmentsError) throw installmentsError

        fetchProjects()
        handleCloseCreateModal()
    } catch (error: any) {
        alert(error.message)
    } finally {
        setIsSubmitting(false)
    }
  }

  const handleUpdateSubmit = async (e: React.FormEvent) => {
      e.preventDefault()
      if (!editingItem) return alert('Nenhum projeto selecionado para edição')

      setIsSubmitting(true)
      try {
        const trimmedName = formState.name.trim()
        if (!trimmedName) throw new Error('O nome do projeto é obrigatório.')

        const { data: existing, error: checkError } = await supabase
            .from('projects').select('id').eq('name', trimmedName).neq('id', editingItem.id).limit(1)

        if (checkError) throw new Error(`Erro ao verificar nome: ${checkError.message}`)
        if (existing && existing.length > 0) throw new Error('Já existe um projeto com este nome.')

        const updatePayload = {
            name: trimmedName,
            client_id: formState.client_id,
            status: Number(formState.status) as StatusType,
        }
        await updateItem(editingItem.id, updatePayload)
        handleCloseEditModal()
      } catch (error: any) {
        alert(error.message)
      } finally {
        setIsSubmitting(false)
      }
  }

  const handleDelete = useCallback(async (id: string) => {
    if (window.confirm('Tem certeza? Projeto e parcelas associadas serão excluídos.')) {
      try {
        await deleteItem(id)
      } catch (error: any) {
        alert(`Erro ao excluir: ${error.message}`)
      }
    }
  }, [deleteItem])

  const getClientName = (clientId: string) => clients.find(c => c.id === clientId)?.name || '...'
  const getStatusName = (statusId: StatusType) => (Number(statusId) === Status.Ativo ? 'Ativo' : 'Concluído')

  const columns = useMemo((): ColumnDefinition<Project>[] => [
    { key: 'name', label: 'Nome do Projeto' },
    { key: 'client_id', label: 'Cliente', render: (p) => getClientName(p.client_id) },
    { key: 'start_date', label: 'Data de Início', render: (p) => formatDate(p.start_date) },
    { key: 'total_value', label: 'Valor Total', render: (p) => formatCurrency(p.total_value) },
    { key: 'status', label: 'Status', render: (p) => <span className={`badge ${Number(p.status) === Status.Ativo ? 'bg-success' : 'bg-secondary'}`}>{getStatusName(p.status)}</span> },
    {
      key: 'actions',
      label: 'Ações',
      render: (project) => (
        <div>
          <Link to={`/projetos/${project.id}`} className="btn btn-sm btn-outline-primary me-2">Ver</Link>
          <button className="btn btn-sm btn-outline-dark me-2" onClick={() => handleShowEditModal(project)}>Editar</button>
          <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(project.id)}>Excluir</button>
        </div>
      ),
    },
  ], [clients, handleShowEditModal, handleDelete])

  return (
    <>
      <CrudPageLayout title="Projetos" buttonText="Novo Projeto" onButtonClick={handleShowCreateModal}>
        <DataTable
          columns={columns}
          data={projects}
          loading={loading}
          emptyState={<EmptyState icon="bi-folder-x" title="Nenhum projeto encontrado" message="Crie um novo para começar" />}
        />
        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={paginate} />
      </CrudPageLayout>

      <CrudModal show={showCreateModal} onClose={handleCloseCreateModal} onSubmit={handleCreateSubmit} title="Novo Projeto" submitText="Salvar Projeto" isSubmitting={isSubmitting}>
        <div className="mb-3"><label htmlFor="name" className="form-label">Nome do Projeto</label><input type="text" className="form-control" id="name" name="name" value={formState.name} onChange={handleInputChange} required /></div>
        <div className="mb-3"><label htmlFor="client_id" className="form-label">Associar Cliente</label><select className="form-select" id="client_id" name="client_id" value={formState.client_id} onChange={handleInputChange} required><option value="" disabled>Selecione...</option>{clients.map(c => (<option key={c.id} value={c.id}>{c.name}</option>))}</select></div>
        <div className="row"><div className="col-md-6 mb-3"><label htmlFor="total_value" className="form-label">Valor Total</label><input type="text" className="form-control" id="total_value" name="total_value" value={formState.total_value} onChange={handleInputChange} required /></div><div className="col-md-6 mb-3"><label htmlFor="number_of_installments" className="form-label">Nº de Parcelas</label><input type="number" className="form-control" id="number_of_installments" name="number_of_installments" value={formState.number_of_installments} onChange={handleInputChange} min="1" required /></div></div>
        <div className="mb-3"><label htmlFor="start_date" className="form-label">Data de Início</label><input type="date" className="form-control" id="start_date" name="start_date" value={formState.start_date} onChange={handleInputChange} required /></div>
        <div className="row"><div className="col-md-6 mb-3"><label htmlFor="comission_type" className="form-label">Comissão</label><select className="form-select" id="comission_type" name="comission_type" value={formState.comission_type} onChange={handleInputChange} required><option value={CommissionType.Escritorio}>Escritório (20%)</option><option value={CommissionType.Pessoal}>Pessoal (50%)</option></select></div><div className="col-md-6 mb-3"><label htmlFor="status" className="form-label">Status</label><select className="form-select" id="status" name="status" value={formState.status} onChange={handleInputChange} required><option value={Status.Ativo}>Ativo</option><option value={Status.Concluido}>Concluído</option></select></div></div>
      </CrudModal>

      <CrudModal show={showEditModal} onClose={handleCloseEditModal} onSubmit={handleUpdateSubmit} title="Editar Projeto" submitText="Salvar Alterações" isSubmitting={isSubmitting}>
        <div className="mb-3"><label className="form-label">Nome do Projeto</label><input type="text" className="form-control" name="name" value={formState.name} onChange={handleInputChange} required /></div>
        <div className="mb-3"><label className="form-label">Cliente</label><select className="form-select" name="client_id" value={formState.client_id} onChange={handleInputChange} required>{clients.map(c => (<option key={c.id} value={c.id}>{c.name}</option>))}</select></div>
        <div className="mb-3"><label className="form-label">Status</label><select className="form-select" name="status" value={formState.status} onChange={handleInputChange} required><option value={Status.Ativo}>Ativo</option><option value={Status.Concluido}>Concluído</option></select></div>
        <hr/><p className="text-muted small">Valor, parcelas e data de início não podem ser alterados para manter a integridade financeira.</p>
        <div className="row">
            <div className="col-md-6 mb-3"><label className="form-label">Valor Total</label><input type="text" className="form-control" value={formState.total_value} disabled /></div>
            <div className="col-md-6 mb-3"><label className="form-label">Nº de Parcelas</label><input type="number" className="form-control" value={formState.number_of_installments} disabled /></div>
        </div>
        <div className="row">
            <div className="col-md-6 mb-3"><label className="form-label">Data de Início</label><input type="date" className="form-control" value={formState.start_date} disabled /></div>
        </div>
      </CrudModal>
    </>
  )
}