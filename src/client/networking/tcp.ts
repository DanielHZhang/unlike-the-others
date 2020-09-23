import io from 'socket.io-client';
import {StorageKeys} from 'src/client/config/constants';
import {channel} from 'src/client/networking/udp';

export const socket = io({
  transports: ['websocket'],
});

socket.on('connect', () => {
  console.log('Connected to TCP server.');
  socket.emit('authenticate', localStorage.getItem(StorageKeys.Jwt));
});

socket.on('authenticateResponse', (jwt?: string) => {
  if (jwt) {
    localStorage.setItem(StorageKeys.Jwt, jwt);
  }
  // Connect to UDP channel only after authentication has been completed
  channel.onConnect(console.error);
});
