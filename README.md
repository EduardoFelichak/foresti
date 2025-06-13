# Painel de Controle - Arquitetura Foresti

Este é um painel de controle desenvolvido para a gestão financeira e de projetos, substituindo a necessidade de planilhas manuais.

## Tecnologias Utilizadas

-   **Frontend:** React com Vite e TypeScript
-   **Estilização:** Bootstrap 5 e Bootstrap Icons
-   **Backend e Banco de Dados:** Supabase
-   **Hospedagem:** Vercel

## Como Executar o Projeto Localmente

1.  **Clone o repositório:**
    ```bash
    git clone https://github.com/EduardoFelichak/foresti.git
    cd foresti
    ```

2.  **Instale as dependências:**
    ```bash
    npm install
    ```

3.  **Configure as variáveis de ambiente:**
    -   Renomeie o arquivo `.env.example` para `.env`.
    -   Preencha as variáveis `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` com suas chaves do Supabase.

4.  **Execute o servidor de desenvolvimento:**
    ```bash
    npm run dev
    ```

O projeto estará disponível em `http://localhost:5173`.
