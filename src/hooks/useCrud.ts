import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../supabaseClient'
import { PostgrestError } from '@supabase/supabase-js'

export interface CrudConfig<T> {
  tableName        : string
  initialFormState : T
  fetchQuery?      : string
  itemsPerPage?    : number
}

export function useCrud<T extends { id: string}, K>({
  tableName,
  initialFormState,
  fetchQuery = '*',
  itemsPerPage = 8,
}: CrudConfig<K>) {
  const [items, setItems]               = useState<T[]>([])
  const [loading, setLoading]           = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError]               = useState<PostgrestError | null>(null)

  const [showCreateModal , setShowCreateModal] = useState(false)
  const [showEditModal   , setShowEditModal  ] = useState(false)

  const [editingItem , setEditingItem] = useState<T | null>(null)
  const [formState   , setFormState  ] = useState<K>(initialFormState)

  const [currentPage, setCurrentPage] = useState(1)
  const totalPages                    = Math.ceil(items.length / itemsPerPage)
  const currentItems                  = items.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  const fetchItems = useCallback(async () => {
    setLoading(true)
    setError(null)
    const { data, error: fetchError } = await supabase.from(tableName).select(fetchQuery).returns<T[]>()

    if (error) {
      console.error(`Erro ao buscar ${tableName}: `, error)
      setError(fetchError)
    } else {
      setItems(data || [])
    }

    setLoading(false)
  }, [tableName, fetchQuery])

  useEffect(() => {
    fetchItems()
  }, [fetchItems])

  const handleShowCreateModal = () => {
    setFormState(initialFormState)
    setShowCreateModal(true)
  }

  const handleCloseCreateModal = () => setShowCreateModal(false)

  const handleShowEditModal = (item: T) => {
    setEditingItem(item)
    setShowEditModal(true)
  }

  const handleCloseEditModal = () => {
    setShowEditModal(false)
    setEditingItem(null)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormState(prev => ({ ...prev, [name]: value }))
  }

  const createItem = async (payload: Partial<K>) => {
    setIsSubmitting(true)
    const { data, error } = await supabase.from(tableName).insert([payload]).select().single()
    setIsSubmitting(false)
    if (error) throw error
    fetchItems()
    return data as T
  }

  const updateItem = async (id: string, payload: Partial<K>) => {
    setIsSubmitting(true)
    const { data, error } = await supabase.from(tableName).update(payload).eq('id', id).select().single()
    setIsSubmitting(false)
    if (error) throw error
    fetchItems()
    return data as T
  }

  const deleteItem = async (id: string) => {
    const { error } = await supabase.from(tableName).delete().eq('id', id)
    if (error) throw error
    setItems(prev => prev.filter(item => item.id !== id))
    if (currentItems.length === 1 && currentPage > 1) {
      setCurrentPage(currentPage - 1)
    }
  }

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber)

  return {
    // State
    items, loading, isSubmitting, error, currentItems,
    // Form and Modal State
    formState, setFormState, editingItem, showCreateModal, showEditModal,
    // Pagination State
    currentPage, totalPages,
    // Handlers
    fetchItems, handleInputChange,
    handleShowCreateModal, handleCloseCreateModal,
    handleShowEditModal, handleCloseEditModal,
    createItem, updateItem, deleteItem,
    paginate, setIsSubmitting,
  }
}