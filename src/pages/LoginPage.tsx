import { supabase } from "../supabaseClient"

export default function LoginPage() {
  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google'
    })

    if (error){
      console.error("Erro no login com Google: ", error.message)
    }
  }

  return (
    <div className='container-fluid vh-100 d-flex justify-content-center align-items-center bg-white'>
      <div className='card p-4 shadow-sm ' style={{ width: '100%', maxWidth: '400px' }}>
        <div className="card-body text-center">
          <h1 className="card-title h3 mb-3 fw-normal">Foresti</h1>

          <p className="mb-4">
              Acesse o painel para gerenciar seus projetos.
          </p>

          <div className='d-grid'>
            <button
              className='btn btn-dark btn-lg d-flex align-items-center justify-content-center'
              onClick={handleGoogleLogin}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="bi bi-google me-2" viewBox="0 0 16 16">
                <path d="M15.545 6.558a9.42 9.42 0 0 1 .139 1.626c0 2.434-.87 4.492-2.384 5.885h.002C11.978 15.292 10.158 16 8 16A8 8 0 1 1 8 0a7.689 7.689 0 0 1 5.352 2.082l-2.284 2.284A4.347 4.347 0 0 0 8 3.166c-2.087 0-3.86 1.408-4.492 3.304a4.792 4.792 0 0 0 0 3.063h.003c.635 1.893 2.405 3.301 4.492 3.301 1.078 0 2.004-.276 2.722-.764h-.003a3.702 3.702 0 0 0 1.599-2.431H8v-3.08h7.545z"/>
              </svg>
              Entrar com Google
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}