import React from 'react'

interface Props {
  title         : string
  buttonText    : string
  onButtonClick : () => void
  children      : React.ReactNode
}

export default function CrudPageLayout({ title, buttonText, onButtonClick, children }: Props) {
  return (
    <div className='d-flex flex-column' style={{ height: 'calc(100vh - 90px)' }}>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h1 className="h2">{title}</h1>
        <button className="btn btn-dark d-flex align-items-center" onClick={onButtonClick}>
          <i className="bi bi-plus-lg me-2"></i>{buttonText}
        </button>
      </div>
      <div className="card shadow-sm flex-grow-1 d-flex flex-column" style={{ overflow: 'hidden' }}>
        {children}
      </div>
    </div>
  )
}