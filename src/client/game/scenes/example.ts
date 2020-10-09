import Phaser from 'phaser';
import {channel} from 'src/client/network/webrtc';

const myPosition = {x: 0, y: 0};
const gameState = {
  players: {},
  joinedGecko: false,
};

export class ExampleScene extends Phaser.Scene {
  private cursors: Phaser.Types.Input.Keyboard.CursorKeys = {};
  private player?: Phaser.Physics.Arcade.Sprite;

  constructor() {
    super('Example Scene');
  }

  init() {
    console.log('initializing', this);
  }

  preload() {
    console.log('preloading', this);
    this.load.image({key: 'background', url: '/assets/background.png'});
    this.load.image({key: 'player', url: '/assets/player.png'});
    this.load.image({key: 'dragon', url: '/assets/dragon.png'});
    this.load.image({key: 'treasure', url: '/assets/treasure.png'});
  }

  connectToServer() {
    channel.onConnect((error) => {
      if (error) {
        return console.error(error.message);
      }
      channel.emit('joinRoom');

      gameState.players[channel.id] = true;

      channel.emit('join', {channelId: channel.id});

      channel.on('player_disconnected', ({channelId}) => {
        gameState.players[channelId].destroy();
        delete gameState.players[channelId];
      });
      channel.on('new_player_joined', ({channelId}) => {
        // console.log('adding player', channelId);
        const y = (this.sys.game.config.height as number) / 2;
        // player
        gameState.players[channelId] = {
          sprite: this.physics.add.sprite(40, y, 'player'),
        };
        gameState.players[channelId].sprite.setScale(0.5);
        gameState.players[channelId].sprite.setDrag(1000);
      });

      channel.on('movement_data', ({channelId, position: {x, y}}) => {
        // console.log('receiving movmenet data!');
        gameState.players[channelId].sprite.setPosition(x, y);
      });
      channel.on(channel.id, (gameStateFromServer) => {
        // console.log('setting true!!', gameStateFromServer);
        Object.keys(gameStateFromServer.players).forEach((channelId) => {
          if (gameState.players[channelId]) {
            return;
          }
          const y = (this.sys.game.config.height as number) / 2;
          // player
          gameState.players[channelId] = {
            sprite: this.physics.add.sprite(40, y, 'player'),
          };
          gameState.players[channelId].sprite.setScale(0.5);
          gameState.players[channelId].sprite.setDrag(1000);
        });

        self.connectedToGecko = true;
      });
    });
  }

  create() {
    this.cameras.main.setBounds(0, 0, 500, 500);
    this.cameras.main.setZoom(3);
    this.cameras.main.centerOn(0, 0);
    // this.cameras.main.

    const bg = this.add.sprite(0, 0, 'background');
    bg.setOrigin(0, 0);

    const y = (this.sys.game.config.height as number) / 2;

    this.player = this.physics.add.sprite(40, y, 'player');

    this.player.setScale(0.5);
    this.player.setDrag(1000);
    console.log('sprite', this.player);

    this.cursors = this.input.keyboard.createCursorKeys();
  }

  update() {
    // console.log('updating', this);
    // const keyObj = this.input.keyboard.addKey('W');
    // keyObj.on('down', (event) => {
    //   console.log('event:', event);
    // });

    // console.log(this.player?.x, this.player?.y);

    if (this.cursors.right?.isDown) {
      this.player?.setVelocityX(160);
      this.cameras.main.pan(this.player?.x!, this.player?.y!, 200);
      // this.cameras.main.pan()
    } else if (this.cursors.left?.isDown) {
      this.player?.setVelocityX(-160);

      this.cameras.main.pan(this.player?.x!, this.player?.y!, 200);
    }

    if (this.cursors.down?.isDown) {
      this.player?.setVelocityY(160);

      this.cameras.main.pan(this.player?.x!, this.player?.y!, 200);
    } else if (this.cursors.up?.isDown) {
      this.player?.setVelocityY(-160);

      this.cameras.main.pan(this.player?.x!, this.player?.y!, 200);
    }

    this.calculateNewPosition();
  }

  calculateNewPosition() {
    const myNewPosition = {x: self.player.x, y: self.player.y};
    if (myNewPosition && (myPosition.x !== myNewPosition.x || myPosition.y !== myNewPosition.y)) {
      myPosition.x = myNewPosition.x;
      myPosition.y = myNewPosition.y;
      // console.log('wtff', self.connectedToGecko);
      if (self.connectedToGecko) {
        // console.log('sending movement data___');
        channel.emit('movement_data', {
          channelId: channel.id,
          position: {x: myPosition.x, y: myPosition.y},
        });
      }
    }
  }
}
