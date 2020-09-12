import {PlayerService} from 'src/server/store/player';
import {RoomService} from 'src/server/store/room';

export const GameService = {
  player: PlayerService.getInstance(),
  room: RoomService.getInstance(),
};
