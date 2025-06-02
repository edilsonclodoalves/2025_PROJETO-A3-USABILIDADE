import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Card, Spinner, Alert, Row, Col, Tabs, Tab } from 'react-bootstrap';
import { Pie, Bar, Line } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Title, BarElement } from 'chart.js';

// Registrar os componentes necessários do Chart.js
ChartJS.register(
  ArcElement, 
  Tooltip, 
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  BarElement
);

const API_URL = 'http://localhost:3001/api';

const ProdutosDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [produtosVendidos, setProdutosVendidos] = useState([]);
  const [produtosEstoque, setProdutosEstoque] = useState([]);
  const [estatisticas, setEstatisticas] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [vendidosResponse, estoqueResponse, statsResponse] = await Promise.all([
          axios.get(`${API_URL}/vendas`),
          axios.get(`${API_URL}/estoque`),
          axios.get(`${API_URL}/vendas/estatisticas`)
        ]);
        
        setProdutosVendidos(vendidosResponse.data);
        setProdutosEstoque(estoqueResponse.data);
        setEstatisticas(statsResponse.data);
      } catch (err) {
        console.error('Erro ao buscar dados:', err);
        setError('Erro ao carregar os dados dos produtos.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Preparar dados para os gráficos de produtos mais vendidos
  const prepareTopProductsData = () => {
    if (!estatisticas?.produtosMaisVendidos) return { labels: [], datasets: [] };
    
    const labels = estatisticas.produtosMaisVendidos.map(item => item.nomeProduto);
    const data = estatisticas.produtosMaisVendidos.map(item => item.totalQuantidade);
    const backgroundColors = [
      'rgba(255, 99, 132, 0.7)',
      'rgba(54, 162, 235, 0.7)',
      'rgba(255, 206, 86, 0.7)',
      'rgba(75, 192, 192, 0.7)',
      'rgba(153, 102, 255, 0.7)'
    ];

    return {
      labels,
      datasets: [
        {
          label: 'Quantidade Vendida',
          data,
          backgroundColor: backgroundColors,
          borderColor: backgroundColors.map(color => color.replace('0.7', '1')),
          borderWidth: 1,
        },
      ],
    };
  };

  // Preparar dados para estoque vs vendidos
  const prepareStockVsSoldData = () => {
    if (!produtosEstoque.length || !produtosVendidos.length) return { labels: [], datasets: [] };
    
    // Pegar os 5 produtos com mais estoque
    const topEstoque = [...produtosEstoque]
      .sort((a, b) => b.quantidade - a.quantidade)
      .slice(0, 5);
    
    const labels = topEstoque.map(item => item.Produto.nome);
    const estoqueData = topEstoque.map(item => item.quantidade);
    
    // Encontrar as vendas correspondentes
    const vendasData = topEstoque.map(item => {
      const vendas = produtosVendidos.find(v => v.ProdutoId === item.ProdutoId);
      return vendas ? vendas.quantidade : 0;
    });

    return {
      labels,
      datasets: [
        {
          label: 'Em Estoque',
          data: estoqueData,
          backgroundColor: 'rgba(54, 162, 235, 0.7)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1,
        },
        {
          label: 'Vendidos',
          data: vendasData,
          backgroundColor: 'rgba(255, 99, 132, 0.7)',
          borderColor: 'rgba(255, 99, 132, 1)',
          borderWidth: 1,
        }
      ],
    };
  };

  // Preparar dados para valor total de vendas
  const prepareSalesValueData = () => {
    if (!estatisticas?.produtosMaisVendidos) return { labels: [], datasets: [] };
    
    const labels = estatisticas.produtosMaisVendidos.map(item => item.nomeProduto);
    const data = estatisticas.produtosMaisVendidos.map(item => item.totalValor);

    return {
      labels,
      datasets: [
        {
          label: 'Valor Total (R$)',
          data,
          backgroundColor: 'rgba(75, 192, 192, 0.7)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1,
        },
      ],
    };
  };

  const topProductsData = prepareTopProductsData();
  const stockVsSoldData = prepareStockVsSoldData();
  const salesValueData = prepareSalesValueData();

  const barChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Produtos Mais Vendidos',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1
        }
      }
    }
  };

  const stockChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Estoque vs Vendidos',
      },
    },
    scales: {
      y: {
        beginAtZero: true
      }
    }
  };

  const salesValueOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Valor Total por Produto (R$)',
      },
    },
    scales: {
      y: {
        beginAtZero: true
      }
    }
  };

  return (
    <Container className="mt-4">
      <h2 className="mb-4 text-center">Dashboard de Produtos</h2>

      {error && (
        <Alert variant="danger" className="text-center">{error}</Alert>
      )}

      {loading ? (
        <div className="text-center my-5">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Carregando...</span>
          </Spinner>
        </div>
      ) : (
        <Tabs defaultActiveKey="graficos" id="produtos-tabs" className="mb-3">
          <Tab eventKey="graficos" title="Gráficos">
            <Row className="mt-3">
              <Col md={6} className="mb-4">
                <Card className="h-100 shadow-sm">
                  <Card.Header className="bg-primary text-white">
                    <h5 className="mb-0">Produtos Mais Vendidos</h5>
                  </Card.Header>
                  <Card.Body>
                    <Bar data={topProductsData} options={barChartOptions} />
                  </Card.Body>
                </Card>
              </Col>
              <Col md={6} className="mb-4">
                <Card className="h-100 shadow-sm">
                  <Card.Header className="bg-info text-white">
                    <h5 className="mb-0">Estoque vs Vendidos</h5>
                  </Card.Header>
                  <Card.Body>
                    <Bar data={stockVsSoldData} options={stockChartOptions} />
                  </Card.Body>
                </Card>
              </Col>
              <Col md={6} className="mb-4">
                <Card className="h-100 shadow-sm">
                  <Card.Header className="bg-success text-white">
                    <h5 className="mb-0">Valor Total por Produto</h5>
                  </Card.Header>
                  <Card.Body>
                    <Bar data={salesValueData} options={salesValueOptions} />
                  </Card.Body>
                </Card>
              </Col>
              <Col md={6} className="mb-4">
                <Card className="h-100 shadow-sm">
                  <Card.Header className="bg-warning text-dark">
                    <h5 className="mb-0">Distribuição de Vendas</h5>
                  </Card.Header>
                  <Card.Body className="d-flex justify-content-center">
                    <div style={{ width: '100%', maxWidth: '400px' }}>
                      <Pie data={topProductsData} />
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </Tab>
          <Tab eventKey="tabela" title="Dados em Tabela">
            <Card className="mt-3 shadow-sm">
              <Card.Header className="bg-secondary text-white">
                <h5 className="mb-0">Estatísticas de Vendas</h5>
              </Card.Header>
              <Card.Body>
                {estatisticas ? (
                  <div className="table-responsive">
                    <table className="table table-striped table-hover">
                      <thead>
                        <tr>
                          <th>Produto</th>
                          <th>Quantidade Vendida</th>
                          <th>Valor Total (R$)</th>
                          <th>Porcentagem</th>
                        </tr>
                      </thead>
                      <tbody>
                        {estatisticas.produtosMaisVendidos.map((item, index) => {
                          const percentage = ((item.totalValor / estatisticas.totalVendas) * 100).toFixed(1);
                          return (
                            <tr key={index}>
                              <td>{item.nomeProduto}</td>
                              <td>{item.totalQuantidade}</td>
                              <td>{item.totalValor.toFixed(2)}</td>
                              <td>{percentage}%</td>
                            </tr>
                          );
                        })}
                        <tr className="table-primary">
                          <td><strong>Total</strong></td>
                          <td></td>
                          <td><strong>{estatisticas.totalVendas.toFixed(2)}</strong></td>
                          <td><strong>100%</strong></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-center">Nenhum dado encontrado.</p>
                )}
              </Card.Body>
            </Card>
          </Tab>
        </Tabs>
      )}
    </Container>
  );
};

export default ProdutosDashboard;