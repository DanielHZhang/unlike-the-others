import http from 'http';
import geckos, {GeckosServer, iceServers} from '@geckos.io/server';
import {errors, JWT} from 'jose';
import {GameRoom, Player} from 'src/server/store';
import {log} from 'src/server/utils/logs';
import {getJWK} from 'src/server/config/jwk';
import {JwtClaims} from 'src/shared/types';
import {GECKOS_LABEL, IS_PRODUCTION_ENV} from 'src/shared/constants';
import {inputModel} from 'src/shared/buffer-schema';

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
        const player = Player.getById(claims.userId);
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
    let room: GameRoom;
    const playerId = channel.userData.id as string;
    const player = Player.getById(playerId)!;
    player.channel = channel;
    log('info', `UDP client connected: ${player.id}`);

    channel.onDisconnect((reason) => {
      log('info', `UDP client ${reason}: ${player.id}`);
      player.channel = undefined; // Remove reference to this channel
    });

    channel.onRaw((buffer) => {
      if (!room) {
        room = GameRoom.getById(player.roomId)!;
      }
      // DOES NOT HANDLE ANY ERROR
      const input = inputModel.fromBuffer(buffer as ArrayBuffer);
      player.enqueueInput(input);
    });
  });
}
