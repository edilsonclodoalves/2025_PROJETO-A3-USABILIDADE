import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants'; // Use expo-constants if available, otherwise handle differently

// Determine API URL based on environment or .env
const baseURL = Constants?.expoConfig?.extra?.apiUrl || process.env.API_URL || 'http://localhost:3001/api'; // Fallback

const api = axios.create({
  baseURL: baseURL,
});

// Interceptor para adicionar o token JWT em todas as requisições
api.interceptors.request.use(async (config) => {
  try {
    const token = await AsyncStorage.getItem('token'); // Ou de onde você armazena o token no mobile
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (error) {
    console.error("Erro ao buscar token do AsyncStorage:", error);
  }
  return config;
});

export default api;

