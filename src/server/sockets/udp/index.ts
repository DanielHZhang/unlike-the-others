import http from 'http';
import geckos, {GeckosServer, iceServers} from '@geckos.io/server';
import {log} from 'src/server/utils/logs';
import {IS_PRODUCTION_ENV} from 'src/shared/constants';
import {GameService} from 'src/server/store';

let io: GeckosServer | undefined;

export function udpHandler(server: http.Server) {
  if (io) {
    throw new Error('Attempted to re-instantiate the UDP server singleton.');
  }
  io = geckos({iceServers: IS_PRODUCTION_ENV ? iceServers : undefined});
  io.addServer(server); // Use the port of the HTTP Server

  io.onConnection((channel) => {
    const channelId = channel.id!;
    log('info', `Udp client connected: ${channelId}`);
    // channel.userData

    // Add channel to the player class

    channel.on('joinRoom', (data, senderId) => {
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
