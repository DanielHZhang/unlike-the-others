import http from 'http';
import geckos, {GeckosServer, iceServers} from '@geckos.io/server';
import {log} from 'src/server/utils/logs';
import {GECKOS_LABEL, IS_PRODUCTION_ENV} from 'src/shared/constants';
import {GameService} from 'src/server/store';

let io: GeckosServer;

export function udpHandler(server: http.Server) {
  if (io) {
    throw new Error('Attempted to re-instantiate the UDP server singleton.');
  }
  io = geckos({
    iceServers: IS_PRODUCTION_ENV ? iceServers : [/* Add ice servers for production here */],
    // label: GECKOS_LABEL,
    authorization: async (auth, request) => {
      console.log('geckos auth', auth, request);

      // Use "request.connection.remoteAddress" to get the users ip.
      // ("request.headers['x-forwarded-for']" if your server is behind a proxy)

      // // reach out to a database if needed (this code is completely fictitious)
      // const user = await database.getByName(username);

      // // whatever you return here, will later be accessible via channel.userData to authenticate the user
      // if (user.username === username && user.password === password) {
      //   return {username: user.username, level: user.level, points: user.points};
      // }

      // if you return true, you will authorize the connection, without adding any data to channel.userData
      return true;

      // if you return false, the server will respond with 401 (unauthorized)
      return false;
      // if you return a number between 100 and 599, the server will respond with the respective HTTP status code
      return 400; // will return 400 (Bad Request)
      return 404; // will return 404 (Not Found)
      return 500; // will return 500 (Internal Server Error)
      // and so on ...
    },
  });
  io.addServer(server); // Use the port of the HTTP Server

  console.log('starting up geckos server', io);

  io.onConnection((channel) => {
    // log('info', `Udp client connected: ${channelId}`);
    // channel.userData

    // Add channel to the player class

    channel.on('connect', () => {
      console.log('anything????');
    });

    console.log('is there a udp connection?', channel);

    channel.on('joinRoom', (data, senderId) => {
      const room = GameService.room.getById();
      // GameService.
    });

    const pendingChanges: any[] = [];
    const clients = [];
    const lastProcessedInput = [];

    channel.on('move', (data, senderId) => {
      // handle inputs from player here
      console.log('receive move input from client', data);
      pendingChanges.push({dir: data.dir, ts: data.ts});

      // Calculate time elapsed since last tick was processed
      let prevTs = 0;
      const delta = Date.now() - prevTS;
      prevTS = now;

      const message = {};
      message.clientAdjust = [];

      const player = gameState.players[client.id];
      const pendingMoves = pendingChanges.players[client.id].moves;

      let ack;
      // Process all pending moves, which came from the client before
      // the start of this tick, and update the game state
      while (pendingMoves.lenth > 0) {
        const move = pendingMoves.shift();
        player.x = player.x + move.dir * 0.6 * delta;
        ack = move.ts;
      }

      // Send a message back to client with the newly calculated position.
      // Attach the timestamp of the most recently processed client move.
      message.clientAdjust.push({
        id: client.id,
        ts: ack,
        x: player.x,
      });

      // Send message back to client
      io.emit('gameState', message);
    });
  });
}
