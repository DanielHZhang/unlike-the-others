import {PlayerService} from 'src/server/store/player';
import {RoomService} from 'src/server/store/room';

export const GameService = {
  player: new PlayerService(),
  room: new RoomService(),
};
