import Phaser from 'phaser';
import {GameControls} from 'src/shared/types';

export class PokemonMap extends Phaser.Scene {
  private controls: GameControls;
  private cursors?: Phaser.Types.Input.Keyboard.CursorKeys;
  private player?: Phaser.Physics.Arcade.Sprite;
  private vision?: Phaser.GameObjects.Image;

  constructor(controls: GameControls, config: Phaser.Types.Scenes.SettingsConfig = {}) {
    super(config);
    this.controls = controls;
  }

  setupControls() {
    const {up, left, down, right} = this.controls;
    this.cursors = this.input.keyboard.addKeys({up, left, down, right});
  }

  init() {
    console.log('initializing', this);
    this.setupControls();
  }

  preload() {
    this.load.image('tiles', '/assets/tilesets/tuxmon-sample-32px-extruded.png');
    this.load.tilemapTiledJSON('map', '/assets/tilemaps/tuxemon-town.json');

    // An atlas is a way to pack multiple images together into one texture.
    // Using it to load all the player animations (walking left, walking right) in one image
    // https://labs.phaser.io/view.html?src=src/animation/texture%20atlas%20animation.js
    // If you don't use an atlas, you can do the same thing with a spritesheet, see:
    // https://labs.phaser.io/view.html?src=src/animation/single%20sprite%20sheet.js
    this.load.atlas('atlas', '/assets/atlas/atlas.png', '/assets/atlas/atlas.json');
    this.load.image('vision', 'assets/r3.png');
  }

  create() {
    const map = this.make.tilemap({key: 'map'});

    // Parameters are the name you gave the tileset and then the key of the tileset image in
    // Phaser's cache (i.e. the name you used in preload)
    const tileset = map.addTilesetImage('tuxmon-sample-32px-extruded', 'tiles');

    // Parameters: layer name (or index) from Tiled, tileset, x, y
    const belowLayer = map.createStaticLayer('Below Player', tileset, 0, 0);
    const worldLayer = map.createStaticLayer('World', tileset, 0, 0);
    const aboveLayer = map.createStaticLayer('Above Player', tileset, 0, 0);

    worldLayer.setCollisionByProperty({collides: true});

    // By default, everything gets depth sorted on the screen in the order we created things.
    // Here, we want the "Above Player" layer to sit on top of the player, so we explicitly
    // give it a depth. Higher depths will sit on top of lower depth objects.
    aboveLayer.setDepth(10);

    // make a RenderTexture that is the size of the screen
    const width = this.scale.width;
    const height = this.scale.height;
    const rt = this.add.renderTexture(0, 0, map.widthInPixels, map.heightInPixels);

    // fill it with black
    rt.fill(0x000000, 1);

    // draw the floorLayer into it
    rt.draw(belowLayer);
    rt.draw(worldLayer);
    rt.draw(aboveLayer);

    // set a dark blue tint
    rt.setTint(0x0a2948);
    rt.setDepth(30);

    // Object layers in Tiled let you embed extra info into a map - like a spawn point or custom
    // collision shapes. In the tmx file, there's an object layer with a point named "Spawn Point"
    const spawnPoint = map.findObject('Objects', (obj) => obj.name === 'Spawn Point');

    // Create a sprite with physics enabled via the physics system. The image used for the sprite
    // has a bit of whitespace, so I'm using setSize & setOffset to control the size of the player's
    // body.
    this.player = this.physics.add
      .sprite(spawnPoint.x, spawnPoint.y, 'atlas', 'misa-front')
      .setSize(30, 40)
      .setOffset(0, 24);
    this.vision = this.make.image({
      x: this.player.x,
      y: this.player.y,
      key: 'vision',
      add: false,
    });
    this.vision.scale = 0.5;

    rt.mask = new Phaser.Display.Masks.BitmapMask(this, this.vision);
    rt.mask.invertAlpha = true;

    // Watch the player and worldLayer for collisions, for the duration of the scene:
    this.physics.add.collider(this.player, worldLayer);

    // Create the player's walking animations from the texture atlas. These are stored in the global
    // animation manager so any sprite can access them.
    const anims = this.anims;
    anims.create({
      key: 'misa-left-walk',
      frames: anims.generateFrameNames('atlas', {
        prefix: 'misa-left-walk.',
        start: 0,
        end: 3,
        zeroPad: 3,
      }),
      frameRate: 10,
      repeat: -1,
    });
    anims.create({
      key: 'misa-right-walk',
      frames: anims.generateFrameNames('atlas', {
        prefix: 'misa-right-walk.',
        start: 0,
        end: 3,
        zeroPad: 3,
      }),
      frameRate: 10,
      repeat: -1,
    });
    anims.create({
      key: 'misa-front-walk',
      frames: anims.generateFrameNames('atlas', {
        prefix: 'misa-front-walk.',
        start: 0,
        end: 3,
        zeroPad: 3,
      }),
      frameRate: 10,
      repeat: -1,
    });
    anims.create({
      key: 'misa-back-walk',
      frames: anims.generateFrameNames('atlas', {
        prefix: 'misa-back-walk.',
        start: 0,
        end: 3,
        zeroPad: 3,
      }),
      frameRate: 10,
      repeat: -1,
    });

    const camera = this.cameras.main;
    camera.startFollow(this.player);
    camera.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

    // Help text that has a "fixed" position on the screen
    this.add
      .text(16, 16, 'Arrow keys to move', {
        font: '18px monospace',
        fill: '#000000',
        padding: {x: 20, y: 10},
        backgroundColor: '#ffffff',
      })
      .setScrollFactor(0)
      .setDepth(30);

    // // Debug graphics
    // this.input.keyboard.once('keydown_D', (event) => {
    //   // Turn on physics debugging to show player's hitbox
    //   this.physics.world.createDebugGraphic();

    //   // Create worldLayer collision graphic above the player, but below the help text
    //   const graphics = this.add.graphics().setAlpha(0.75).setDepth(20);
    //   worldLayer.renderDebug(graphics, {
    //     tileColor: null, // Color of non-colliding tiles
    //     collidingTileColor: new Phaser.Display.Color(243, 134, 48, 255), // Color of colliding tiles
    //     faceColor: new Phaser.Display.Color(40, 39, 37, 255), // Color of colliding face edges
    //   });
    // });
  }

  update() {
    if (!this.player) {
      throw new Error('Player not defined.');
    }
    const speed = 175;
    const prevVelocity = this.player.body.velocity.clone();
    if (this.vision) {
      this.vision.x = this.player.x;
      this.vision.y = this.player.y;
    }
    // Stop any previous movement from the last frame
    this.player.body.setVelocity(0);

    // Horizontal movement
    if (this.cursors.left.isDown) {
      this.player.body.setVelocityX(-speed);
    } else if (this.cursors.right.isDown) {
      this.player.body.setVelocityX(speed);
    }

    // Vertical movement
    if (this.cursors.up.isDown) {
      this.player.body.setVelocityY(-speed);
    } else if (this.cursors.down.isDown) {
      this.player.body.setVelocityY(speed);
    }

    // Normalize and scale the velocity so that player can't move faster along a diagonal
    this.player.body.velocity.normalize().scale(speed);

    // Update the animation last and give left/right animations precedence over up/down animations
    if (this.cursors.left.isDown) {
      this.player.anims.play('misa-left-walk', true);
    } else if (this.cursors.right.isDown) {
      this.player.anims.play('misa-right-walk', true);
    } else if (this.cursors.up.isDown) {
      this.player.anims.play('misa-back-walk', true);
    } else if (this.cursors.down.isDown) {
      this.player.anims.play('misa-front-walk', true);
    } else {
      this.player.anims.stop();

      // If we were moving, pick and idle frame to use
      if (prevVelocity.x < 0) {
        this.player.setTexture('atlas', 'misa-left');
      } else if (prevVelocity.x > 0) {
        this.player.setTexture('atlas', 'misa-right');
      } else if (prevVelocity.y < 0) {
        this.player.setTexture('atlas', 'misa-back');
      } else if (prevVelocity.y > 0) {
        this.player.setTexture('atlas', 'misa-front');
      }
    }
  }
}
