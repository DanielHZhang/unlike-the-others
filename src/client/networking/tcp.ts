import io from 'socket.io-client';
import {StorageKeys} from 'src/client/config/constants';

export const socket = io({
  transports: ['websocket'],
});

socket.on('connect', () => {
  console.log('Connected to TCP server.');
  socket.emit('authenticate', localStorage.getItem(StorageKeys.Jwt));
});

socket.on('authenticateResponse', (jwt: string) => {
  localStorage.setItem(StorageKeys.Jwt, jwt);
});
