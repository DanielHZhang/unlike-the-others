import http from 'http';
import geckos, {GeckosServer, iceServers} from '@geckos.io/server';
import {IS_PRODUCTION_ENV} from 'src/config/constants';
// import {GameRoom, GameState} from 'src/config/types';
import {log} from 'src/server/utils/logs';
import * as box2d from '@supersede/box2d';

const gravity = new box2d.b2Vec2(0, 0);
const world = new box2d.b2World(gravity);

export class UdpServer {
  private io: GeckosServer;

  constructor(server: http.Server) {
    this.io = geckos({iceServers: IS_PRODUCTION_ENV ? iceServers : undefined, label: 'udp'});
    this.io.addServer(server);

    this.io.onConnection((channel) => {
      const channelId = channel.id!;
      log('info', `Client connected to UDP server: ${channelId}`);

      channel.onDisconnect((state) => {
        log('info', `Client disconnected from UDP server: ${channelId}`);
      });

      channel.on('joinRoom', (data, senderId) => {
        // rooms.set('rip', )
      });


      channel.on('movement_data', (data, senderId) => {
        const {
          channelId,
          position: {x, y},
        } = data as MovementData;

        console.log('received movement data!!', x, y);
        gameState.players[channelId].positions = {x, y};
        channel.broadcast.emit('movement_data', {
          channelId,
          position: {x, y},
        });
        // console.log(`SERVER: MOVEMENT DATA received ${data}`);
        // console.log(`got ${data} from "chat message"`);
        // emit the "chat message" data to all channels in the same room
        // io.room(channel.roomId).emit('chat message', data);
      });
      channel.on('join', ({channelId}) => {
        channel.emit(channelId, gameState);
      });
      channel.broadcast.emit('new_player_joined', {
        channelId,
      });
    });
  }
}
