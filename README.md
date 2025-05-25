# Ficha Resumo do Projeto: Sistema de Gestão para Sorveteria

## 1. Visão Geral

*   **Projeto:** Sistema de Gestão para Sorveteria (Web)
*   **Objetivo Principal:** Desenvolver um sistema web para otimizar as operações diárias de uma sorveteria, incluindo gerenciamento de estoque (base), cadastro de produtos, gestão de pedidos e carrinho de compras, autenticação de usuários e geração de relatórios básicos de vendas.
*   **Área de Aplicação:** Gerenciamento de negócios no setor de alimentos e bebidas.

## 2. Tecnologias Utilizadas

*   **Backend:**
    *   Linguagem/Framework: Node.js, Express.js
    *   Banco de Dados: MySQL (com Sequelize ORM)
    *   Autenticação: JSON Web Tokens (JWT), Google OAuth (backend pronto)
    *   Comunicação Real-time: Socket.IO (estrutura básica)
*   **Frontend:**
    *   Biblioteca: React.js
    *   Roteamento: React Router DOM
    *   Requisições HTTP: Axios
    *   Autenticação Google: @react-oauth/google (requer ajuste final no fluxo de idToken)
    *   Estilização: Bootstrap (implícito pelo uso de classes como `navbar`, `btn`, `card`, etc.)
    *   Comunicação Real-time: Socket.IO Client
*   **API Externa:**
    *   ViaCEP: Para consulta e preenchimento automático de endereço a partir do CEP.

## 3. Funcionalidades Implementadas

O sistema atualmente implementa as seguintes funcionalidades nas camadas de backend e frontend:

*   **Autenticação e Autorização:**
    *   Registro de novos usuários.
    *   Login com Email e Senha.
    *   Login Social com Google (Backend pronto, Frontend iniciado - requer finalização do fluxo de `idToken`).
    *   Proteção de rotas baseada em token JWT.
    *   Autorização baseada em papéis (cliente, operador, admin) para acesso a funcionalidades específicas.
*   **Gerenciamento de Usuários:**
    *   Listagem, visualização, atualização e exclusão de usuários (restrito a Admin).
    *   Visualização e atualização do próprio perfil pelo usuário logado.
*   **Gerenciamento de Produtos:**
    *   Criação, leitura, atualização e exclusão (CRUD) de produtos (restrito a Admin/Operador).
    *   Listagem pública de produtos com filtros básicos (busca por nome/descrição).
*   **Carrinho de Compras:**
    *   Adição de produtos ao carrinho.
    *   Visualização do conteúdo do carrinho.
    *   Atualização da quantidade de itens.
    *   Remoção de itens individuais.
    *   Limpeza completa do carrinho.
*   **Pedidos:**
    *   Criação de um novo pedido a partir dos itens do carrinho.
    *   Preenchimento do endereço de entrega com busca automática via CEP (Integração ViaCEP).
    *   Listagem de pedidos realizados pelo usuário logado.
    *   Listagem de todos os pedidos para gerenciamento (Admin/Operador).
    *   Atualização do status do pedido (Admin/Operador).
*   **Avaliações de Produtos:**
    *   Criação de avaliações (nota e comentário) para produtos.
    *   Listagem de avaliações por produto.
    *   Listagem de avaliações por usuário.
    *   Atualização e exclusão de avaliações (pelo próprio usuário ou admin).
*   **Relatórios (Básicos):**
    *   Relatório de vendas agregadas por período (dia, mês, ano).
    *   Relatório de produtos mais vendidos (atualmente simulado, requer implementação da tabela `ItemPedido` para precisão).
*   **Comunicação Real-time (Socket.IO):**
    *   Estrutura básica configurada no backend e frontend para futuras notificações (ex: atualização de status de pedido).

## 4. Status Atual e Próximos Passos

*   **Backend:** Funcionalidades principais implementadas e testadas (testes unitários/integração básicos).
*   **Frontend:** Funcionalidades principais implementadas e testadas (testes funcionais básicos, incluindo ViaCEP).
*   **Mobile:** Não implementado nesta fase.
*   **Testes de Usabilidade:** Não realizados nesta fase.
*   **Observações:** A integração do Login com Google no frontend requer atenção ao fluxo de obtenção e envio do `idToken` para o backend. O relatório de produtos mais vendidos no backend está simulado e precisa ser implementado corretamente com base nos itens efetivamente vendidos (ex: tabela `ItemPedido`).

## 5. Entregáveis

*   Código fonte completo das aplicações Backend e Frontend.
*   Arquivo `todo.md` com o registro detalhado do progresso e etapas concluídas/puladas.
*   Esta Ficha Resumo.

