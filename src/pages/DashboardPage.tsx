import { useAuth } from '../contexts/AuthContext'
import { Link } from 'react-router-dom'

export default function DashboardPage() {
  const { user } = useAuth();

  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0];

  return (
    <div>
      {/* Cabeçalho da Página */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h2">Dashboard</h1>
          <p className="text-muted">
            Bem-vindo(a), <strong>{displayName}</strong>!
          </p>
        </div>
        <div>
          {/* Botões de Ação Rápida */}
          <Link to="/clients" className="btn btn-outline-dark me-2">
            <i className="bi bi-people-fill me-2"></i>
            Ver Clientes
          </Link>
          <Link to="/projects" className="btn btn-dark">
            <i className="bi bi-plus-lg me-2"></i>
            Novo Projeto
          </Link>
        </div>
      </div>

      {/* Linha (row) para os cartões de indicadores (KPIs) */}
      <div className="row">
        {/* Cartão de Projetos Ativos */}
        <div className="col-md-4 mb-3">
          <div className="card shadow-sm">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <i className="bi bi-folder2-open fs-1 text-dark me-3"></i>
                <div>
                  <h5 className="card-title text-muted">Projetos Ativos</h5>
                  <p className="card-text fs-2 fw-bold">0</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Cartão de Clientes */}
        <div className="col-md-4 mb-3">
          <div className="card shadow-sm">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <i className="bi bi-person-check-fill fs-1 text-dark me-3"></i>
                <div>
                  <h5 className="card-title text-muted">Total de Clientes</h5>
                  <p className="card-text fs-2 fw-bold">0</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Cartão de Saldo a Receber */}
        <div className="col-md-4 mb-3">
          <div className="card shadow-sm">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <i className="bi bi-cash-stack fs-1 text-dark me-3"></i>
                <div>
                  <h5 className="card-title text-muted">Saldo a Receber</h5>
                  <p className="card-text fs-2 fw-bold">R$ 0,00</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Aqui podemos adicionar um gráfico ou uma lista de tarefas no futuro */}
      <div className="mt-4">
        {/* Placeholder para futuros componentes */}
      </div>

    </div>
  )
}