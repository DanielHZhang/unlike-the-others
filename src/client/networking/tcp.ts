// import io from 'socket.io-client';
// import {StorageKeys} from 'src/client/config/constants';
// import {channel} from 'src/client/networking/udp';

import {ROOT_URL} from 'src/shared/constants';

// export const socket = io({
//   transports: ['websocket'],
// });

// socket.on('connect', () => {
//   console.log('Connected to TCP server.');
//   socket.emit('authenticate', localStorage.getItem(StorageKeys.Jwt));
// });

// socket.on('authenticateResponse', (jwt?: string) => {
//   if (jwt) {
//     localStorage.setItem(StorageKeys.Jwt, jwt);
//   }
//   // Connect to UDP channel only after authentication has been completed
//   channel.onConnect(console.error);
// });

export const socket = new WebSocket(`ws://${ROOT_URL}/ws`);

socket.onopen = (event) => {
  console.log('on open event:', event);
  socket.send('wow this is on open');
};

socket.onclose = (event) => {
  console.log('on message event:', event);
};

socket.onerror = (event) => {
  console.error('error occured in socket:', event);
};

socket.onmessage = (event) => {
  console.log('received message from server:', event);
};
