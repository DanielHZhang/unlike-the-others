import Box2D from '@plane2d/core';
import type {BufferInputData, Keybindings} from 'src/shared/types';
import {WORLD_SCALE} from 'src/shared/constants';
import {PhysicsEngine} from 'src/shared/game/physics-engine';
import {inputModel, snapshotModel} from 'src/shared/game/buffer-schema';
import {InputHandler} from 'src/client/game/input';

/* eslint-disable  */

function coordToBoundaryPhaserGraphic(
  scene: Phaser.Scene,
  body: Box2D.b2Body,
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
  public controls: Keybindings;
  private cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  private player: [Box2D.b2Body, Phaser.GameObjects.Graphics];
  private grid: Phaser.GameObjects.Grid;
  private engine: PhysicsEngine;

  constructor(controls: Keybindings) {
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
    const playerBody = this.engine.createPlayerBody();
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
    const vector = new Box2D.b2Vec2();
    const MOVEMENT_MAGNITUDE = 90 / WORLD_SCALE;

    // Determine horizontal velocity
    if (this.cursors.right!.isDown) {
      vector.Set(MOVEMENT_MAGNITUDE, 0);
    } else if (this.cursors.left!.isDown) {
      vector.Set(-MOVEMENT_MAGNITUDE, 0);
    }
    // Determine vertical velocity
    if (this.cursors.down!.isDown) {
      vector.y = MOVEMENT_MAGNITUDE;
    } else if (this.cursors.up!.isDown) {
      vector.y = -MOVEMENT_MAGNITUDE;
    }

    this.player[0].SetLinearVelocity(vector);
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
