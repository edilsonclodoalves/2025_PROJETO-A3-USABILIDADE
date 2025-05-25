import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuth } from './context/AuthContext'; // Assumindo que AuthContext será criado

// Importar Telas
import LoginScreen from '../screens/LoginScreen';
import ProductsScreen from '../screens/ProductsScreen';
import CartScreen from '../screens/CartScreen';
import OrdersScreen from '../screens/OrdersScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Stack = createStackNavigator();

const AppNavigator = () => {
  const { user } = useAuth(); // Obter estado de autenticação do contexto

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {user ? (
          // Telas acessíveis após login
          <>
            <Stack.Screen name="Produtos" component={ProductsScreen} options={{ title: 'Sorvetes Disponíveis' }} />
            <Stack.Screen name="Carrinho" component={CartScreen} options={{ title: 'Meu Carrinho' }} />
            <Stack.Screen name="Pedidos" component={OrdersScreen} options={{ title: 'Meus Pedidos' }} />
            <Stack.Screen name="Perfil" component={ProfileScreen} options={{ title: 'Meu Perfil' }} />
            {/* Adicionar outras telas autenticadas aqui */}
          </>
        ) : (
          // Tela de Login se não estiver autenticado
          <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        )}
        {/* Telas públicas (se houver) podem ser adicionadas fora do condicional */}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;

