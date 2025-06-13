import type { ReactNode } from 'react'
import { NavLink } from 'react-router-dom'
import { supabase } from '../../supabaseClient'

const SidebarNav = () => (
  <ul className="nav nav-pills flex-column mb-auto">
    <li className="nav-item">
      <NavLink to="/" className="nav-link text-white" end>
        <i className="bi bi-grid-1x2 me-2"></i>
        Dashboard
      </NavLink>
    </li>

    <li className="nav-item">
      <a
        className="nav-link text-white"
        href="#cadastros-submenu"
        data-bs-toggle="collapse"
        role="button"
        aria-expanded="false"
        aria-controls="cadastros-submenu"
      >
        <i className="bi bi-pencil-square me-2"></i>
        Cadastros
      </a>
      <div className="collapse" id="cadastros-submenu">
        <ul className="btn-toggle-nav list-unstyled fw-normal pb-1 small ms-4">
          <li>
            <NavLink to="/clients" className="nav-link text-white">
              <i className="bi bi-people me-2"></i>
              Clientes
            </NavLink>
          </li>
          <li>
            <NavLink to="/projects" className="nav-link text-white">
              <i className="bi bi-folder me-2"></i>
              Projetos
            </NavLink>
          </li>
        </ul>
      </div>
    </li>
  </ul>
)

export default function AppLayout({ children }: { children: ReactNode }) {
  const handleLogout = async () => {
    await supabase.auth.signOut()
  }

  return (
    <div>
      <header className="navbar navbar-dark sticky-top bg-dark flex-md-nowrap p-0 shadow">
        <a className="navbar-brand col-md-3 col-lg-2 me-0 px-3 fs-6" href="#">
          <strong>Foresti</strong>
        </a>

        <button
          className="navbar-toggler position-absolute d-md-none collapsed"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#sidebarMenu"
          aria-controls="sidebarMenu"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="navbar-nav">
          <div className="nav-item text-nowrap">
            <button className="nav-link px-3 btn btn-link text-white" onClick={handleLogout}>
              Sair
            </button>
          </div>
        </div>
      </header>

      <div className="container-fluid">
        <div className="row">
          {/* Sidebar Principal (visível em telas grandes) */}
          <nav id="sidebarMenu" className="col-md-3 col-lg-2 d-md-block bg-dark sidebar collapse">
            <div className="position-sticky pt-3">
              <SidebarNav />
            </div>
          </nav>

          <main className="col-md-9 ms-sm-auto col-lg-10 px-md-4">
            <div className="pt-3 pb-2 mb-3">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}