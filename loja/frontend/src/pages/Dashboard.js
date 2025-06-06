import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Card, Spinner, Alert, Row, Col, Table } from 'react-bootstrap';
import { Bar, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title
);

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api'; // puxando a variável do .env, caso n existir usar esse valor padrão.


const DashboardSimplificado = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [produtos, setProdutos] = useState([]);
  const [pedidos, setPedidos] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
  try {
    setLoading(true);
    const token = localStorage.getItem('token');

    if (!token) {
      setError('Usuário não autenticado. Faça login.');
      setLoading(false);
      return;
    }

    const headers = {
      Authorization: `Bearer ${token}`,
    };

    const [produtosResponse, pedidosResponse] = await Promise.all([
      axios.get(`${API_URL}/produtos`, { headers }),  // OK
      axios.get(`${API_URL}/pedidos/me`, { headers }) // Alterado aqui
    ]);

    setProdutos(produtosResponse.data);
    setPedidos(pedidosResponse.data);
    setError(null);
  } catch (err) {
    console.error('Erro ao buscar dados:', err);
    setError('Erro ao carregar os dados.');
  } finally {
    setLoading(false);
  }
};

    fetchData();
  }, []);

  // Dados para gráfico de produtos
  const produtosChartData = {
    labels: produtos.map(p => p.nome),
    datasets: [
      {
        label: 'Preço dos Produtos (R$)',
        data: produtos.map(p => p.preco),
        backgroundColor: 'rgba(54, 162, 235, 0.7)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
      }
    ]
  };

  // Dados para gráfico de status dos pedidos
  const statusPedidosData = {
    labels: ['Pendentes', 'Concluídos', 'Cancelados'],
    datasets: [
      {
        label: 'Status dos Pedidos',
        data: [
          pedidos.filter(p => p.status === 'Pendente').length,
          pedidos.filter(p => p.status === 'Concluído').length,
          pedidos.filter(p => p.status === 'Cancelado').length
        ],
        backgroundColor: [
          'rgba(255, 206, 86, 0.7)',
          'rgba(75, 192, 192, 0.7)',
          'rgba(255, 99, 132, 0.7)'
        ],
        borderColor: [
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(255, 99, 132, 1)'
        ],
        borderWidth: 1,
      }
    ]
  };

  // Calcular valor total de pedidos
  const totalPedidos = pedidos.reduce((sum, pedido) => sum + pedido.valorTotal, 0);

  return (
    <Container className="mt-4">
      <h2 className="mb-4 text-center">Dashboard</h2>

      {error && <Alert variant="danger">{error}</Alert>}

      {loading ? (
        <div className="text-center my-5">
          <Spinner animation="border" />
          <p>Carregando dados...</p>
        </div>
      ) : (
        <>
          <Row className="mb-4">
            <Col md={6}>
              <Card className="h-100">
                <Card.Header>Produtos Cadastrados</Card.Header>
                <Card.Body>
                  <Bar 
                    data={produtosChartData}
                    options={{
                      responsive: true,
                      plugins: {
                        title: {
                          display: true,
                          text: 'Preço dos Produtos'
                        }
                      }
                    }}
                  />
                </Card.Body>
              </Card>
            </Col>
            <Col md={6}>
              <Card className="h-100">
                <Card.Header>Status dos Pedidos</Card.Header>
                <Card.Body>
                  <Pie data={statusPedidosData} />
                </Card.Body>
              </Card>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Card className="mb-4">
                <Card.Header>Resumo</Card.Header>
                <Card.Body>
                  <p>Total de Produtos: {produtos.length}</p>
                  <p>Total de Pedidos: {pedidos.length}</p>
                  <p>Valor Total em Pedidos: R$ {totalPedidos.toFixed(2)}</p>
                </Card.Body>
              </Card>
            </Col>
            <Col md={6}>
              <Card>
                <Card.Header>Últimos Pedidos</Card.Header>
                <Card.Body>
                  <Table striped bordered hover size="sm">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Valor</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pedidos.slice(0, 5).map(pedido => (
                        <tr key={pedido.id}>
                          <td>{pedido.id}</td>
                          <td>R$ {pedido.valorTotal.toFixed(2)}</td>
                          <td>{pedido.status}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </>
      )}
    </Container>
  );
};

export default DashboardSimplificado;
