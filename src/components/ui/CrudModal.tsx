import React from 'react'

interface Props {
  show         : boolean
  onClose      : () => void
  onSubmit     : (e: React.FormEvent) => void
  title        : string
  submitText   : string
  isSubmitting : boolean
  children     : React.ReactNode
}

export default function CrudModal({ show, onClose, onSubmit, title, submitText, isSubmitting, children }: Props) {
  if (!show) return null

  return (
    <div className="modal fade show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <form onSubmit={onSubmit}>
            <div className="modal-header">
              <h5 className="modal-title">{title}</h5>
              <button type="button" className="btn-close" onClick={onClose}></button>
            </div>
            <div className="modal-body">
              {children}
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-outline-secondary" onClick={onClose}>Cancelar</button>
              <button type="submit" className="btn btn-dark" disabled={isSubmitting}>
                {isSubmitting ? <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> : submitText}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}