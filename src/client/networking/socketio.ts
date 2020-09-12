import io from 'socket.io-client';

export const socket = io({
  transports: ['websocket'],
});

socket.on('connect', () => {
  console.log('Connected to TCP server.');
});
