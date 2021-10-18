# Unlike the Others

In-browser multiplayer social deduction game inspired by Among Us.

## Tech Stack

Client:

- React.js for authentication pages and in-game HUD
- Recoil for storing global state
- Box2D physics engine 
- Custom client-side prediction game engine

Server:

- Node.js authoritative game servers simulating the world at 16ms ticks
- WebRTC DataChannel UDP socket connections to clients
- Protobuf-like compressed JSON for serialized network communication 

## System Flows

### Authentication

1. Client receives and loads webpage
2. Client checks `localStorage` for saved JWT and sends to server
3. Server verifies and decodes JWT
   1. If JWT is valid, use the `userId` claim to create new player or check if player previously connected
   2. If JWT is invalid, sign new JWT with random `userId` claim and send to client to be saved in `localStorage`
4. Create new `Player` object with `active: false` and add to hashmap (entering in game will change to `active: true`)
5. Run daemon on server that removes all inactive players every hour to free memory

Implementation allows for auto-reconnect of players, without requiring explicit username/password login.

### UDP Connection

1. On join or create room, set socket and channel variables in player class
2. On movement, emitted event received by UDP handler
3. Find room and forward input to room handler
4. Room handler takes care of input and uses channel to emit snapshot state of physics world back to client
