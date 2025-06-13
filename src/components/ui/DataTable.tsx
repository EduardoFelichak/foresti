import React from 'react'

export interface ColumnDefinition<T> {
  key     : keyof T | 'actions'
  label   : string
  render? : (item: T) => React.ReactNode
}

interface Props<T> {
  columns    : ColumnDefinition<T>[]
  data       : T[]
  loading    : boolean
  emptyState : React.ReactNode
}

export default function DataTable<T extends { id: string }>({ columns, data, loading, emptyState }: Props<T>) {
  return (
    <div className="table-responsive flex-grow-1" style={{ overflowY: 'auto' }}>
      <table className="table table-hover table-striped mb-0">
        <thead className="table-dark" style={{ position: 'sticky', top: 0, zIndex: 1 }}>
          <tr>
            {columns.map(col => <th key={String(col.key)} className="p-3">{col.label}</th>)}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr><td colSpan={columns.length} className="text-center p-5"><div className="spinner-border" role="status"><span className="visually-hidden">Carregando...</span></div></td></tr>
          ) : data.length === 0 ? (
            <tr><td colSpan={columns.length}>{emptyState}</td></tr>
          ) : (
            data.map(item => (
              <tr key={item.id}>
                {columns.map(col => (
                  <td key={String(col.key)} className="align-middle p-3">
                    {col.render ? col.render(item) : (item as any)[col.key] || '-'}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}