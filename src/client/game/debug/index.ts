import {Game} from 'src/client/game';

export * from './rectangle';
export * from './line';

// export class DEBUG_Game extends Game {
//   private startTime = Date.now();

//   protected update = (): void => {
//     /**
//      * Test how long you travel/how many steps occur in a certain amount of time
//      */

//     if (Date.now() >= this.startTime + 10000) {
//       this.ticker.stop();
//       console.log('Num steps taken:', this.engine.currentStep);
//       const pos = this.entities.player.body.GetPosition();
//       console.log('Player position:', pos.x, pos.y);
//       return;
//     }

//     /**
//      * Test how long it takes/how many steps to reach a certain position
//      */

//     // // console.log(this.entities.mainPlayer.body.GetPosition().x);
//     // if (this.entities.mainPlayer.body.GetPosition().x > 50) {
//     //   const endTime = Date.now();
//     //   this.ticker.stop();
//     //   console.log('elapsed time:', endTime - this.startTime);
//     //   console.log('num steps taken:', this.engine.numSteps);
//     //   return;
//     // }

//     // this.TEST_processInput();
//     // this.DEBUG_processInput();
//     // this.processInput();
//     // this.engine.fixedFixedStep(this.ticker.elapsedMS / 1000);
//   };

//   private TEST_processInput() {
//     const input: InputData = {
//       horizontal: Movement.Right,
//       vertical: -1,
//       seqNumber: 0,
//     };
//     // console.log('input:', input);
//     this.entities.DEBUG_processInput(input);
//   }

//   private DEBUG_processInput() {
//     const input: InputData = {
//       horizontal: this.keyboard.isMovementKeyDown('horizontal'),
//       vertical: this.keyboard.isMovementKeyDown('vertical'),
//       seqNumber: 0,
//     };
//     // console.log('input:', input);
//     this.entities.DEBUG_processInput(input);

//     // public DEBUG_processInput(input: InputData): void {
//     //   // this.playerBody.SetPositionXY(playerPosition.x, playerPosition.y);
//     //   // Re-apply input to player
//     //   const vector = new Box2d.b2Vec2();
//     //   const MOVEMENT_MAGNITUDE = 90 / WORLD_SCALE;
//     //   if (input.horizontal === Movement.Right) {
//     //     vector.Set(MOVEMENT_MAGNITUDE, 0);
//     //   } else if (input.horizontal === Movement.Left) {
//     //     vector.Set(-MOVEMENT_MAGNITUDE, 0);
//     //   }
//     //   if (input.vertical === Movement.Down) {
//     //     vector.y = MOVEMENT_MAGNITUDE;
//     //   } else if (input.vertical === Movement.Up) {
//     //     vector.y = -MOVEMENT_MAGNITUDE;
//     //   }
//     //   this.playerBody.SetLinearVelocity(vector);
//     //   const velocity = this.playerBody.GetLinearVelocity();
//     //   console.log('Linear velocity:', velocity.x, velocity.y);
//     //   // console.log('playerbody:', this.playerBody.GetPosition().x, this.playerBody.GetPosition().y);
//     // }
//   }
// }
