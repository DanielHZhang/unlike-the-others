import http from 'http';
import geckos, {GeckosServer, iceServers} from '@geckos.io/server';
import {log} from 'src/server/utils/logs';
import {GECKOS_LABEL, IS_PRODUCTION_ENV} from 'src/shared/constants';
import {GameService} from 'src/server/store';
import {errors, JWT} from 'jose';
import {getJWK} from 'src/server/config/jwk';
import {InputData, JwtClaims} from 'src/shared/types';

let io: GeckosServer;

export function udpHandler(server: http.Server) {
  if (io) {
    throw new Error('Attempted to re-instantiate the UDP server singleton.');
  }
  // TODO: Add custom ice servers for production
  io = geckos({
    iceServers: IS_PRODUCTION_ENV ? iceServers : undefined,
    label: GECKOS_LABEL,
    authorization: async (auth, request) => {
      try {
        if (!auth) {
          throw new errors.JWTMalformed();
        }
        const claims = JWT.verify(auth, getJWK()) as JwtClaims;
        const player = GameService.player.getById(claims.userId);
        if (!player) {
          throw 'no player found';
        }
        return {id: player.id};
      } catch (error) {
        // this is bad, no jwt provided
        return false;
      }
    },
  });
  io.addServer(server); // Use the port of the HTTP Server

  io.onConnection((channel) => {
    log('info', `UDP client connected: ${channel.id}`);
    const playerId = channel.userData.id as string;
    const player = GameService.player.getById(playerId)!;
    player.channel = channel;

    channel.onDisconnect((reason) => {
      player.channel = undefined; // Remove reference to this channel
    });

    channel.onRaw((message) => {
      const buffer = message as ArrayBuffer;
      console.log('Received raw message on server:', buffer);
    });

    const pendingChanges: any[] = [];
    const clients = [];
    const lastProcessedInput = [];

    channel.on('input', (data, senderId) => {
      const d = data as InputData;
      // data.

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
