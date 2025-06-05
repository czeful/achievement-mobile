import { useEffect, useRef } from "react";
import { io } from 'socket.io-client';

export default function useChatSocket({ onMessage, token }) {
  const socketRef = useRef(null);

  useEffect(() => {
    if (!token) return;

    const socket = io('http://192.168.8.38:4000', {
      auth: { token },
      transports: ['websocket'],
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Socket.IO connected');
    });
    socket.on('connect_error', (err) => {
      console.error('Socket.IO connect error:', err);
    });
    socket.on('disconnect', (reason) => {
      console.log('Socket.IO disconnected:', reason);
    });

    socket.on('message', (msg) => {
      console.log('Socket.IO received message:', msg);
      if (onMessage) onMessage(msg);
    });

    return () => {
      socket.disconnect();
    };
  }, [token, onMessage]);

  // Возвращаем функцию для отправки сообщений
  return (msg) => {
    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit('message', msg);
    } else {
      console.warn('Socket.IO not connected, cannot send message');
    }
  };
} 