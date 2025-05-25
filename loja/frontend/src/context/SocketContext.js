import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import io from 'socket.io-client';
import { useAuth } from './AuthContext'; // Para obter token se necessário para conexão autenticada

const SocketContext = createContext();

export const useSocket = () => {
  return useContext(SocketContext);
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const { token } = useAuth(); // Obter token para autenticação do socket, se necessário
  const socketRef = useRef(null); // Usar ref para evitar reconexões desnecessárias

  useEffect(() => {
    // Conectar apenas se não estiver conectado e tiver um token (ou se a conexão não exigir token)
    // A URL do backend precisa ser acessível (pode vir do .env)
    const socketIoUrl = process.env.REACT_APP_SOCKET_URL || process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:3001';

    // Desconectar o socket anterior se existir e o token mudar ou usuário deslogar
    if (socketRef.current && (!token || socketRef.current.io.opts.query?.token !== token)) {
        console.log("Desconectando socket antigo...");
        socketRef.current.disconnect();
        socketRef.current = null;
        setSocket(null);
        setIsConnected(false);
    }

    // Conectar novo socket se houver token (ou se não for necessário)
    if (!socketRef.current && token) { // Adicione lógica se a conexão não precisar de token
        console.log("Conectando ao servidor Socket.IO em", socketIoUrl);
        const newSocket = io(socketIoUrl, {
            // query: { token } // Enviar token na query para autenticação no backend (se implementado)
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
            // transports: ['websocket'], // Forçar websocket se necessário
        });

        newSocket.on('connect', () => {
            console.log('Conectado ao servidor Socket.IO com ID:', newSocket.id);
            setIsConnected(true);
            // Emitir evento para entrar na sala do usuário, se necessário
            // newSocket.emit('join_user_room', userId); // Obter userId do contexto Auth
        });

        newSocket.on('disconnect', (reason) => {
            console.log('Desconectado do servidor Socket.IO:', reason);
            setIsConnected(false);
            // Limpar a referência se a desconexão for permanente ou inesperada
            if (reason === 'io server disconnect' || reason === 'io client disconnect') {
                socketRef.current = null;
                setSocket(null);
            }
        });

        newSocket.on('connect_error', (error) => {
            console.error('Erro de conexão Socket.IO:', error);
            setIsConnected(false);
            // Talvez tentar reconectar manualmente ou limpar
            // newSocket.disconnect();
            // socketRef.current = null;
            // setSocket(null);
        });

        // --- Adicionar listeners para eventos específicos do backend --- 
        // Exemplo: Ouvir atualização de status de pedido
        newSocket.on('status_pedido_atualizado', (data) => {
            console.log('Evento recebido - Status do Pedido Atualizado:', data);
            // TODO: Atualizar estado global de pedidos ou notificar usuário
            // Ex: dispatch({ type: 'UPDATE_ORDER_STATUS', payload: data });
            alert(`Status do pedido ${data.pedidoId} atualizado para: ${data.status}`);
        });

        // Outros listeners...

        setSocket(newSocket);
        socketRef.current = newSocket;
    }

    // Função de limpeza para desconectar quando o componente desmontar ou token mudar
    return () => {
      if (socketRef.current) {
        console.log("Desconectando socket na limpeza...");
        socketRef.current.disconnect();
        socketRef.current = null;
        setSocket(null);
        setIsConnected(false);
      }
    };
  }, [token]); // Dependência no token para reconectar se mudar

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};

