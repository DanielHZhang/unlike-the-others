import Box2d from '@supersede/box2d';
import type {BufferInputData, GameControls} from 'src/shared/types';
import {WORLD_SCALE} from 'src/shared/constants';
import {PhysicsEngine} from 'src/shared/physics-engine';
import {inputModel, snapshotModel} from 'src/shared/buffer-schema';
import {InputHandler} from 'src/client/game/scenes/input';

function coordToBoundaryPhaserGraphic(
  scene: Phaser.Scene,
  body: Box2d.b2Body,
  x1: [number, number],
  x2: [number, number],
  horizontal: boolean
) {
  const color = new Phaser.Display.Color();
  color.random().brighten(50).saturate(100);
  const userData = scene.add.graphics();
  userData.fillStyle(color.color, 1);
  const thickness = 2;
  userData.fillRect(x1[0], x1[1], horizontal ? x2[0] : thickness, horizontal ? thickness : x2[1]);
  body.SetUserData(userData);
}

export class Lobby extends Phaser.Scene {
  public controls: GameControls;
  private cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  private player: [Box2d.b2Body, Phaser.GameObjects.Graphics];
  private grid: Phaser.GameObjects.Grid;
  private engine: PhysicsEngine;

  constructor(controls: GameControls) {
    super('PlayGame');
    this.controls = controls;
    this.engine = new PhysicsEngine();
    this.receiveNetwork();
  }

  init() {
    const {up, left, down, right} = this.controls;
    this.cursors = this.input.keyboard.addKeys({up, left, down, right});
  }

  create() {
    // create grid stuffs
    this.grid = this.add.grid(0, 0, 1000, 1000, 32, 32, 0xffffff, 0, 0xff0000, 0.5);
    this.grid.showOutline = true;
    this.grid.showCells = false;
    this.grid.setVisible(true);
    this.grid.setOrigin(0, 0);

    // top edge
    const top = this.engine.TEMP_createBoundary([5, 5], [600, 5]);
    coordToBoundaryPhaserGraphic(this, top, [5, 5], [600, 5], true);

    // bottom edge
    const bottom = this.engine.TEMP_createBoundary([5, 600], [600, 600]);
    coordToBoundaryPhaserGraphic(this, bottom, [5, 600], [600, 600], true);

    // right edge
    const right = this.engine.TEMP_createBoundary([600, 5], [600, 600]);
    coordToBoundaryPhaserGraphic(this, right, [600, 5], [600, 600], false);

    // left edge
    const left = this.engine.TEMP_createBoundary([5, 5], [5, 600]);
    coordToBoundaryPhaserGraphic(this, left, [5, 5], [5, 600], false);

    // player
    const playerBody = this.engine.createPlayer();
    const color = new Phaser.Display.Color();
    color.random().brighten(50).saturate(100);
    const userData = this.add.graphics();
    userData.fillStyle(color.color, 1);
    userData.fillRect(-100 / 2, -100 / 2, 100, 100);
    playerBody.SetUserData(userData);
    this.player = [playerBody, userData];

    this.time.addEvent({
      delay: 500,
      loop: true,
      callback: () => {
        const pos = this.player[0].GetPosition();
        const velocity = this.player[0].GetLinearVelocity();
        console.log(`Position: ${pos.x}, ${pos.y}\nVelocity: ${velocity.x}, ${velocity.y}`);
      },
    });
  }

  receiveNetwork() {
    channel.onRaw((data) => {
      const buffer = data as ArrayBuffer;
      const snapshot = snapshotModel.fromBuffer(buffer);
      // console.log('Data from update:', snapshot);
      InputHandler.dequeue(snapshot, this.player[0]);
    });
    // channel.on('update', (data) => {
    //   console.log('data from update:', data);
    //   // const buffer = data as ArrayBuffer;
    //   // const snapshot = snapshotModel.fromBuffer(buffer);
    //   // console.log(snapshot);
    // });
  }

  setPlayerVelocity() {
    const vector = new Box2d.b2Vec2();
    const movementUnit = 90 / WORLD_SCALE;

    // Determine horizontal velocity
    if (this.cursors.right!.isDown) {
      vector.Set(movementUnit, 0);
    } else if (this.cursors.left!.isDown) {
      vector.Set(-movementUnit, 0);
    }
    // Determine vertical velocity
    if (this.cursors.down!.isDown) {
      vector.y = movementUnit;
    } else if (this.cursors.up!.isDown) {
      vector.y = -movementUnit;
    }

    this.player[0].SetLinearVelocity(vector);
  }

  processPlayerInput() {
    InputHandler.reset();

    // Determine horizontal velocity
    if (this.cursors.right!.isDown) {
      InputHandler.right();
    } else if (this.cursors.left!.isDown) {
      InputHandler.left();
    }

    // Determine vertical velocity
    if (this.cursors.up!.isDown) {
      InputHandler.up();
    } else if (this.cursors.down!.isDown) {
      InputHandler.down();
    }
    InputHandler.enqueue();
    InputHandler.emit();
  }

  processInputs() {
    const nowTs = new Date().getTime();
    const lastTs = this.lastTs || nowTs;
    const deltaTimeSec = (nowTs - lastTs) / 1000.0;
  }

  update(currentTime: number, deltaTime: number) {
    this.processPlayerInput();
    this.setPlayerVelocity();
    this.engine.fixedStep(deltaTime);
  }
}
