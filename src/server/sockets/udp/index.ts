import http from 'http';
import geckos, {GeckosServer, iceServers} from '@geckos.io/server';
import {IS_PRODUCTION_ENV} from 'src/config/constants';
import {log} from 'src/server/utils/logs';

export class UdpServer {
  private io: GeckosServer;

  constructor(server: http.Server) {
    this.io = geckos({iceServers: IS_PRODUCTION_ENV ? iceServers : undefined});
    this.io.addServer(server); // Use the port of the HTTP Server

    this.io.onConnection((channel) => {
      const channelId = channel.id!;
      log('info', `Udp client connected: ${channelId}`);
      // channel.userData

      channel.on('joinRoom', (data, senderId) => {
        //
      });

      channel.on('receiveInput', (data, senderId) => {
        // handle inputs from player here
      });
    });
  }
}
