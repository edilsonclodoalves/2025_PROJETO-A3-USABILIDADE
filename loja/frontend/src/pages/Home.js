import React from 'react';

const Home = () => {
  return (
    <div className="container mt-5">
      <div className="p-5 mb-4 bg-light rounded-3">
        <div className="container-fluid py-5">
          <h1 className="display-5 fw-bold">Bem-vindo à Sorveteria Delícia!</h1>
          <p className="col-md-8 fs-4">O melhor sorvete da cidade, agora com um sistema de gerenciamento completo. Explore nossos produtos ou faça seu pedido!</p>
          <a className="btn btn-primary btn-lg" href="/produtos" role="button">Ver Produtos</a>
        </div>
      </div>

      <div className="row align-items-md-stretch">
        <div className="col-md-6 mb-4">
          <div className="h-100 p-5 text-white bg-dark rounded-3">
            <h2>Nossos Sabores</h2>
            <p>Descubra uma variedade incrível de sabores artesanais, feitos com ingredientes frescos e selecionados.</p>
            {/* Adicionar link ou botão se necessário */}
          </div>
        </div>
        <div className="col-md-6 mb-4">
          <div className="h-100 p-5 bg-light border rounded-3">
            <h2>Faça seu Pedido</h2>
            <p>Monte seu pedido online de forma rápida e fácil. Veja nossos produtos e adicione ao carrinho.</p>
             <a className="btn btn-outline-secondary" href="/carrinho" role="button">Ir para o Carrinho</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;

