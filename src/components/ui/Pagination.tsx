interface Props {
  currentPage  : number
  totalPages   : number
  onPageChange : (page: number) => void
}

export default function Pagination({ currentPage, totalPages, onPageChange }: Props) {
  if (totalPages <= 1) return null

  return (
    <div className="card-footer d-flex justify-content-center">
      <nav aria-label="Page navigation">
        <ul className="pagination mb-0">
          <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
            <a className="page-link" href="#" onClick={(e) => { e.preventDefault(); onPageChange(currentPage - 1); }}>
              Anterior
            </a>
          </li>
          {[...Array(totalPages).keys()].map(number => (
            <li key={number + 1} className={`page-item ${currentPage === number + 1 ? 'active' : ''}`}>
              <a onClick={(e) => { e.preventDefault(); onPageChange(number + 1); }} href="#" className="page-link">
                {number + 1}
              </a>
            </li>
          ))}
          <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
            <a className="page-link" href="#" onClick={(e) => { e.preventDefault(); onPageChange(currentPage + 1); }}>
              Próximo
            </a>
          </li>
        </ul>
      </nav>
    </div>
  )
}