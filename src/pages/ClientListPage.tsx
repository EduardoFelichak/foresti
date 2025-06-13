import { useMemo, useCallback } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useCrud } from '../hooks/useCrud'
import { supabase } from '../supabaseClient'
import CrudPageLayout from '../components/ui/CrudPageLayout'
import DataTable, { type ColumnDefinition } from '../components/ui/DataTable'
import Pagination from '../components/ui/Pagination'
import CrudModal from '../components/ui/CrudModal'
import EmptyState from '../components/ui/EmptyState'

interface Client {
  id: string
  name: string
  email: string | null
  phone: string | null
}

interface ClientFormState {
  id?: string
  name: string
  email: string | null
  phone: string | null
  user_id?: string
}

const initialClientState: Omit<ClientFormState, 'id' | 'user_id'> = {
  name: '',
  email: '',
  phone: '',
}

const formatPhoneNumber = (value: string) => {
  if (!value) return value
  const phoneNumber = value.replace(/[^\d]/g, '')
  const phoneNumberLength = phoneNumber.length
  if (phoneNumberLength < 3) return `(${phoneNumber}`
  if (phoneNumberLength < 8) return `(${phoneNumber.slice(0, 2)}) ${phoneNumber.slice(2)}`
  return `(${phoneNumber.slice(0, 2)}) ${phoneNumber.slice(2, 7)}-${phoneNumber.slice(7, 11)}`
}
const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

export default function ClientListPage() {
  const { user } = useAuth()
  const {
    currentItems, loading, isSubmitting, setIsSubmitting, formState, setFormState,
    showCreateModal, showEditModal, currentPage, totalPages,
    handleShowCreateModal, handleCloseCreateModal,
    handleShowEditModal: baseHandleShowEditModal,
    handleCloseEditModal,
    createItem, updateItem, deleteItem, paginate,
    editingItem,
  } = useCrud<Client, ClientFormState>({
    tableName: 'clients',
    initialFormState: initialClientState,
    fetchQuery: '*',
  })

  const handleEditClick = useCallback((client: Client) => {
    setFormState({
      ...client,
      phone: client.phone ? formatPhoneNumber(client.phone) : null
    })
    baseHandleShowEditModal(client)
  }, [baseHandleShowEditModal, setFormState])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    const finalValue = name === 'phone' ? formatPhoneNumber(value) : value
    setFormState(prev => ({ ...prev, [name]: finalValue }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return alert('Você precisa estar logado.')
    if (formState.email && !isValidEmail(formState.email)) return alert('E-mail inválido.')

    setIsSubmitting(true)

    try {
      const cleanPhone = formState.phone ? formState.phone.replace(/[^\d]/g, '') : null

      const checks = []
      if (formState.email) {
        checks.push(`email.eq.${formState.email}`)
      }
      if (cleanPhone) {
        checks.push(`phone.eq.${cleanPhone}`)
      }

      if (checks.length > 0) {
        const filterString = checks.join(',')
        let query = supabase.from('clients').select('id,email,phone').or(filterString)

        if (editingItem) {
          query = query.neq('id', editingItem.id)
        }

        const { data: existingClients, error: checkError } = await query

        if (checkError) {
          throw new Error(`Erro ao verificar dados: ${checkError.message}`)
        }

        if (existingClients && existingClients.length > 0) {
          if (formState.email && existingClients.some(c => c.email === formState.email)) {
            throw new Error('O e-mail informado já está em uso por outro cliente.')
          }
          if (cleanPhone && existingClients.some(c => c.phone === cleanPhone)) {
            throw new Error('O telefone informado já está em uso por outro cliente.')
          }
        }
      }

      const payload = {
        name: formState.name,
        email: formState.email,
        phone: cleanPhone,
      }

      if (editingItem) {
        await updateItem(editingItem.id, payload)
        handleCloseEditModal()
      } else {
        await createItem({ ...payload, user_id: user.id })
        handleCloseCreateModal()
      }
    } catch (error: any) {
      alert(error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza? Esta ação é irreversível.')) {
      try {
        await deleteItem(id)
      } catch (error: any) {
        alert(`Erro ao excluir: ${error.message}`)
      }
    }
  }

  const columns = useMemo((): ColumnDefinition<Client>[] => [
    { key: 'name', label: 'Nome' },
    { key: 'email', label: 'Email' },
    {
      key: 'phone',
      label: 'Telefone',
      render: (client) => client.phone ? formatPhoneNumber(client.phone) : '-'
    },
    {
      key: 'actions',
      label: 'Ações',
      render: (client) => (
        <div>
          <button className="btn btn-sm btn-outline-dark me-2" onClick={() => handleEditClick(client)}>Editar</button>
          <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(client.id)}>Excluir</button>
        </div>
      ),
    },
  ], [handleEditClick, handleDelete])

  return (
    <>
      <CrudPageLayout title="Clientes" buttonText="Novo Cliente" onButtonClick={handleShowCreateModal}>
        <DataTable
          columns={columns}
          data={currentItems}
          loading={loading}
          emptyState={<EmptyState icon="bi-people" title="Nenhum cliente encontrado" message="Que tal adicionar o primeiro?" />}
        />
        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={paginate} />
      </CrudPageLayout>

      <CrudModal
        show={showCreateModal || showEditModal}
        onClose={showCreateModal ? handleCloseCreateModal : handleCloseEditModal}
        onSubmit={handleSubmit}
        title={showCreateModal ? "Novo Cliente" : "Editar Cliente"}
        submitText={showCreateModal ? "Salvar Cliente" : "Salvar Alterações"}
        isSubmitting={isSubmitting}
      >
        <div className="mb-3">
          <label htmlFor="name" className="form-label">Nome Completo</label>
          <input type="text" className="form-control" id="name" name="name" value={formState.name} onChange={handleInputChange} required />
        </div>
        <div className="mb-3">
          <label htmlFor="email" className="form-label">Email</label>
          <input type="email" className="form-control" id="email" name="email" value={formState.email || ''} onChange={handleInputChange} />
        </div>
        <div className="mb-3">
          <label htmlFor="phone" className="form-label">Telefone</label>
          <input type="text" className="form-control" id="phone" name="phone" value={formState.phone || ''} onChange={handleInputChange} maxLength={15} />
        </div>
      </CrudModal>
    </>
  )
}