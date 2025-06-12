# 🍦 Sistema de Gestão para Sorveteria

<div align="center">

![Sistema de Gestão para Sorveteria](https://img.shields.io/badge/Sistema-Sorveteria-blue?style=for-the-badge)
![React](https://img.shields.io/badge/React-18.x-61DAFB?style=for-the-badge&logo=react)
![Node.js](https://img.shields.io/badge/Node.js-18.x-339933?style=for-the-badge&logo=node.js)
![MySQL](https://img.shields.io/badge/MySQL-8.x-4479A1?style=for-the-badge&logo=mysql)
![Express](https://img.shields.io/badge/Express-4.x-000000?style=for-the-badge&logo=express)

**Uma solução web para gestão de sorveteria com uma interface moderna e funcionalidades avançadas**


</div>

---

## 📋Índice

- [Sobre o Projeto](#sobre-o-projeto)
- [Funcionalidades](#funcionalidades)
- [Tecnologias Utilizadas](#tecnologias-utilizadas)
- [Arquitetura](#arquitetura)
- [Pré-requisitos](#pré-requisitos)
- [Instalação](#instalação)
- [Configuração](#configuração)
- [Uso](#uso)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [API Endpoints](#api-endpoints)


---

## 🎯Sobre o Projeto

O **Sistema de Gestão para Sorveteria** é uma aplicação web full-stack moderna desenvolvida para otimizar as operações diárias de sorveteria, desde o gerenciamento de produtos até a entrega final ao cliente. O sistema oferece uma experiência completa tanto para administradores quanto para clientes, com interface intuitiva e funcionalidades robustas.

### 🌟Principais Características

- **Interface Responsiva**: Design moderno que funciona perfeitamente em desktop, tablet e mobile
- **Autenticação**: Auto registro e Login com e-mail e senha
- **Gestão Completa**: Produtos, pedidos, usuários e relatórios em uma única plataforma
- **Tempo Real**: Comunicação instantânea via WebSocket para atualizações de pedidos
- **Integração Externa**: Preenchimento automático de endereços via API ViaCEP
- **Segurança Avançada**: JWT tokens, controle de acesso baseado em papéis e validações de formulários

### 🎯Público-Alvo

- **Proprietários de Sorveteria**: Controle total sobre operações e relatórios
- **Operadores**: Interface simplificada para processamento de pedidos
- **Clientes**: Experiência de compra online intuitiva e completa

---

## ⚡Funcionalidades

### 🔐 Autenticação e Autorização
- Registro de novos usuários com validação completa
- Login seguro com email/senha
- Sistema de papéis (Cliente, Operador, Administrador)
- Proteção de rotas baseada em permissões
- Gerenciamento de sessão com JWT tokens

### 🛍️Gestão de Produtos
- Cadastro completo de produtos com imagens
- Busca avançada com filtros por nome, descrição e preço
- Ordenação por diferentes critérios
- Interface administrativa para CRUD completo

### 🛒Carrinho de Compras
- Adição/remoção de produtos com validação de estoque
- Modificação de quantidades em tempo real
- Cálculo automático de totais
- Persistência do carrinho por usuário
- Interface intuitiva e responsiva

### 📦Sistema de Pedidos
- Conversão automática do carrinho em pedido
- Preenchimento automático de endereço via CEP (ViaCEP)
- Acompanhamento de status em tempo real
- Histórico completo de pedidos
- Interface administrativa para gerenciamento

### 📊Relatórios e Analytics
- Análise dos últimos pedidos
- Gráfico dos preços de produtos e de pedidos
- Resumo dos dados de pedidos e produtos

### 🔄Comunicação em Tempo Real
- Notificações instantâneas via Socket.IO
- Atualizações de status de pedidos

---

## Tecnologias Utilizadas

### Frontend
- **React.js 18.x** - Biblioteca para construção de interfaces
- **React Router DOM 6.x** - Roteamento de páginas SPA
- **Bootstrap 5.x** - Framework CSS responsivo
- **Axios 1.x** - Cliente HTTP para requisições
- **React Bootstrap** - Componentes Bootstrap para React
- **Socket.IO Client** - Comunicação em tempo real

### Backend
- **Node.js 18.x** - Runtime JavaScript para servidor
- **Express.js 4.x** - Framework web minimalista
- **Sequelize 6.x** - ORM para banco de dados
- **MySQL 8.x** - Sistema de gerenciamento de banco
- **JSON Web Tokens** - Autenticação baseada em tokens
- **Socket.IO** - Comunicação bidirecional em tempo real
- **bcryptjs** - Hash seguro de senhas

### Ferramentas e Serviços
- **ViaCEP API** - Consulta de endereços por CEP
- **Concurrently** - Para iniciar o frontend e o backend

---

## 🏗️Arquitetura

```
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND                             │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────────────────┐ │
│  │   Pages     │ │ Components  │ │       Context           │ │
│  │             │ │             │ │   (Auth, Socket)        │ │
│  └─────────────┘ └─────────────┘ └─────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ HTTP/WebSocket
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                        BACKEND                              │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────────────────┐ │
│  │   Routes    │ │ Controllers │ │      Middlewares        │ │
│  │             │ │             │ │   (Auth, CORS, etc)     │ │
│  └─────────────┘ └─────────────┘ └─────────────────────────┘ │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────────────────┐ │
│  │   Models    │ │  Services   │ │       Socket.IO         │ │
│  │ (Sequelize) │ │             │ │                         │ │
│  └─────────────┘ └─────────────┘ └─────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ SQL
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      BANCO DE DADOS                        │
│                        MySQL 8.x                           │
└─────────────────────────────────────────────────────────────┘
```

### Fluxo de Dados
1. **Frontend** envia requisições HTTP para o backend
2. **Middlewares** processam autenticação e validação
3. **Controllers** executam lógica de negócio
4. **Models** interagem com banco de dados via Sequelize
5. **Socket.IO** gerencia comunicação em tempo real
6. **Respostas** retornam ao frontend com dados atualizados

---

## 📋Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- **Node.js** (versão 18.x ou superior)
- **npm** ou **yarn** (gerenciador de pacotes)
- **MySQL** (versão 8.x ou superior)
- **Git** (para clonagem do repositório)

### Verificação dos Pré-requisitos

```bash
# Verificar versão do Node.js
node --version

# Verificar versão do npm
npm --version

# Verificar MySQL
mysql --version

# Verificar Git
git --version
```

---

## 🚀Instalação

### 1. Clonar o Repositório

```bash
git clone https://github.com/edilsonclodoalves/2025_PROJETO-A3-USABILIDADE.git
cd sistema-gestao-sorveteria
```

### 2. Instalar Dependências

#### Backend
```bash
cd loja/backend
npm install
```

#### Frontend
```bash
cd ../frontend
npm install
```

### 3. Configurar Banco de Dados

```sql
-- Conectar ao MySQL como root
mysql -u root -p

-- Criar banco de dados
CREATE DATABASE loja;

-- Criar usuário (opcional)
CREATE USER 'sorveteria_user'@'localhost' IDENTIFIED BY 'sua_senha_segura';
GRANT ALL PRIVILEGES ON loja.* TO 'sorveteria_user'@'localhost';
FLUSH PRIVILEGES;

-- Sair do MySQL
EXIT;
```

---

## ⚙️Configuração

### 1. Variáveis de Ambiente - Backend

Crie o arquivo `.env` na pasta `loja/backend/`:

```env
# Configurações do Banco de Dados
DB_HOST=localhost
DB_PORT=3306
DB_NAME=loja
DB_USER=root
DB_PASSWORD=sua_senha_mysql

# Configurações JWT
JWT_SECRET=sua_chave_secreta_muito_segura_aqui
JWT_EXPIRES_IN=24h

#Configuração da Porta
PORT=3001

```

### 2. Variáveis de Ambiente - Frontend

Crie o arquivo `.env` na pasta `loja/frontend/`:

```env
# URL da API Backend
REACT_APP_API_URL=http://localhost:3001/api


```

## 🎮Uso

### 1. Configurar o Backend

```bash
cd loja/backend

# Instalar as dependências
npm install

```

O backend estará disponível em: `http://localhost:3001/api`

### 2. Configurar o Frontend

```bash
cd loja/frontend

# Instalar as dependências
npm install

```

O frontend estará disponível em: `http://localhost:3000`

### 3. Iniciar o Projeto

```bash
cd ../

# Iniciar o projeto
npm start

```

### 3. Acessar o Sistema

- **URL Principal**: http://localhost:3000
- **API**: http://localhost:3001/api


## 📁Estrutura do Projeto

```
2025_PROJETO-A3-USABILIDADE-main/
├── README.md
├── loja/
│   package.json
│
├───backend
│   │   .env
│   │   package.json
│   │
│   └───src
│       │   index.js
│       │
│       ├───controllers
│       │       authController.js
│       │       avaliacaoController.js
│       │       carrinhoController.js
│       │       pedidoAdminController.js
│       │       pedidoController.js
│       │       produtoController.js
│       │       produtoEmEstoque.controller.js
│       │       produtoVendido.controllers.js
│       │       relatorioController.js
│       │       usuarioController.js
│       │
│       ├───middlewares
│       │       auth.js
│       │       authorize.js
│       │
│       ├───models
│       │       Avaliacao.js
│       │       Carrinho.js
│       │       index.js
│       │       ItemCarrinho.js
│       │       ItemPedido.js
│       │       Pedido.js
│       │       Produto.js
│       │       ProdutoEmEstoque.js
│       │       ProdutoVendido.js
│       │       Usuario.js
│       │
│       └───routes
│               avaliacaoRoutes.js
│               carrinhoRoutes.js
│               pedidoAdminRoutes.js
│               pedidoRoutes.js
│               produtoEmEstoque.routes.js
│               produtoRoutes.js
│               produtoVendido.routes.js
│               relatorioRoutes.js
│               usuarioRoutes.js
│
└───frontend
    │   .env
    │   package.json
    │
    ├───public
    │       index.html
    │
    └───src
        │   App.js
        │   index.js
        │   reportWebVitals.js
        │
        ├───components
        │       Navbar.js
        │       ProductItem.js
        │       ProtectedRoute.js
        │
        ├───context
        │       AuthContext.js
        │       SocketContext.js
        │
        ├───pages
        │       AdminProdutos.js
        │       Carrinho.js
        │       Dashboard.js
        │       Home.js
        │       Login.js
        │       Pedidos.js
        │       Perfil.js
        │       Produtos.js
        │       Register.js
        │       Relatorios.js
        │       Usuarios.js
        │
        └───services
                api.js
```

### Principais Diretórios

#### Backend (`loja/backend/src/`)
- **controllers/**: Lógica de negócio e manipulação de requisições
- **models/**: Definições de modelos Sequelize
- **routes/**: Definições de rotas da API REST
- **middlewares/**: Autenticação, autorização e validações
- **services/**: Serviços auxiliares e integrações externas

#### Frontend (`loja/frontend/src/`)
- **components/**: Componentes React reutilizáveis
- **pages/**: Páginas completas da aplicação
- **context/**: Gerenciamento de estado global
- **services/**: Configuração de API e requisições HTTP

---

## 🔌API Endpoints

### Autenticação
```
POST   /api/auth/register     # Registrar novo usuário
POST   /api/auth/login        # Login com email/senha
POST   /api/auth/refresh      # Renovar token JWT
POST   /api/auth/logout       # Logout do usuário
```

### Produtos
```
GET    /api/produtos          # Listar produtos (público)
POST   /api/produtos          # Criar produto (admin/operador)
GET    /api/produtos/:id      # Obter produto específico
PUT    /api/produtos/:id      # Atualizar produto (admin/operador)
DELETE /api/produtos/:id      # Remover produto (admin)
```

### Carrinho
```
GET    /api/carrinho          # Obter carrinho do usuário
POST   /api/carrinho/adicionar # Adicionar item ao carrinho
PUT    /api/carrinho/atualizar # Atualizar quantidade de item
DELETE /api/carrinho/remover   # Remover item do carrinho
DELETE /api/carrinho/limpar    # Limpar carrinho completo
```

### Pedidos
```
GET    /api/pedidos           # Listar pedidos do usuário
POST   /api/pedidos           # Criar novo pedido
GET    /api/pedidos/:id       # Obter pedido específico
PUT    /api/pedidos/:id/status # Atualizar status (admin/operador)
GET    /api/admin/pedidos     # Listar todos os pedidos (admin)
```

### Usuários
```
GET    /api/usuarios          # Listar usuários (admin)
GET    /api/usuarios/perfil   # Obter perfil do usuário
PUT    /api/usuarios/perfil   # Atualizar perfil
PUT    /api/usuarios/:id      # Atualizar usuário (admin)
DELETE /api/usuarios/:id      # Remover usuário (admin)
```

---


<div align="center">

**Desenvolvido para a A3 da UC - Usabilidade, desenvolvimento web, mobile e jogos por**: 

---
- DAVI DOS REIS DA FONSECA RAMOS - 12725185207
- EDILSON CLODOALVES GALVÃO DE LIMA - 32214931
- KAUAN GUILHERME PINTO DOS SANTOS - 12724228176
- FLÁVIO GREGO SANTIAGO - 322129707
- WEVERTON ARAÚJO MARTINS - 32210007
---

[⬆ Voltar ao topo](#-sistema-de-gestão-para-sorveteria)

</div>
