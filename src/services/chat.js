import api from './api';

// Загрузка истории сообщений с другом
export async function getChat(friendId) {
  // GET /api/chat/:friendId
  const response = await api.get(`/chat/${friendId}`, {
    baseURL: 'http://192.168.8.38:4000',
  });
  return { data: response.data };
} 