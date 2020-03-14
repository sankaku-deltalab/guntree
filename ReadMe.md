# GunTree

GunTree is readable and extendable Danmaku describing package for shmups.

![pipeline](https://gitlab.com/sankaku-deltalab/guntree/badges/master/pipeline.svg)
![coverage](https://gitlab.com/sankaku-deltalab/guntree/badges/master/coverage.svg)

## How to describe Danmaku

```typescript
import * as gt from 'guntree';

const fiveWayFire = gt.nWay(
    { ways: 5, totalAngle: 45 },
    gt.fire(gt.bullet())
);
const guntree = gt.repeat(
    { times: 2, interval: 30 },  // Repeat 2 times ...
    gt.useMuzzle('centerMuzzle'),  // From centerMuzzle ...
    gt.repeat(
        { times: 3, interval: 5 },  // Three round burst ...
        fiveWayFire,  // 5-Way fire!!
    ),
);
```

## Install

### Yarn

```sh
yarn install guntree
```

### NPM

```sh
npm install guntree
```

## Example

```typescript
// your-weapon.ts
import * as gt from "guntree";

export class YourWeapon implements gt.Owner {
  private player = new gt.Player();
  private gunTree = gt.concat(
    gt.useMuzzle("centerMuzzle"),
    gt.repeat(
      { times: 10, interval: 30 },
      gt.fire(gt.bullet())
    ));

  constructor() {
    this.player.events.on("fired", (data: gt.FireData, bullet: gt.Bullet) => {
      const [location, angleDeg, scale] = gt.decomposeTransform(data.transform);
      const speed = data.parameters.get("speed");
      const size = state.parameters.get("size");

      // Create bullet in your game.
      // ...
    });
  }

  getMuzzleTransform(muzzleName: string) {
    // Return global transform of muzzle
    return gt.composeTransform({ x: 0.25, y: 0.0, rotationDeg: 35 });
  }

  getEnemyTransform(muzzleName: string) {
    // Return global transform of enemy
    return gt.composeTransform({ x: -0.45, y: 0.25, rotationDeg: 0 });
  }

  startFiring(loop = false): boolean {
    return player.start(loop, this, this.gunTree);
  }

  isFiring(): boolean {
    return player.isRunning();
  }

  stopFiring(): void {
    player.requestStop();
  }

  forceStopFiring(): void {
    player.forceStop();
  }

  fixedFramerateUpdate(): boolean {
    return player.tick();
  }

  dynamicFramerateUpdate(deltaSeconds: number): boolean {
    return player.update(deltaSeconds);
  }
}
```

```typescript
// your-game.ts
import { YourWeapon } from "your-weapon";

const weapon = new YourWeapon();
weapon.start();


let prevTimestampMS = 0;

function updateGame(timestampMS: number): void {
  const elapsedMS = timestampMS - prevTimestampMS;
  prevTimestampMS = timestampMS;
  weapon.dynamicFramerateUpdate(elapsedMS / 1000); // Update weapon
  window.requestAnimationFrame(updateGame);
}

window.requestAnimationFrame(updateGame);
```

GunTree control only firing progress.
GunTree don't create bullets with any collision and shape.

[API](https://sankaku-deltalab.gitlab.io/guntree)


## Licence

MIT
