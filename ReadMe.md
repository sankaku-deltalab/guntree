# GunTree

GunTree is readable and extendable Danmaku describing package for shmups.

![pipeline](https://gitlab.com/sankaku-deltalab/guntree/badges/master/pipeline.svg)
![coverage](https://gitlab.com/sankaku-deltalab/guntree/badges/master/coverage.svg)

## How to describe Danmaku

```typescript
const fiveWayFire = nWay(
    { ways: 5, totalAngle: 45 },
    fire(bullet())
);
const guntree = repeat(
    { times: 2, interval: 30 },  // Repeat 2 times ...
    useMuzzle('centerMuzzle'),  // From centerMuzzle ...
    repeat(
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

## Usage

GunTree control only firing progress.
GunTree don't create bullets with any collision and shape.

[API](https://sankaku-deltalab.gitlab.io/guntree)

```typescript
import * as gt from 'guntree';

class Owner implements gt.Owner {
    fire(
        data: gt.FireData,
        bullet: gt.Bullet)
    {
        const [location, angleDeg, scale] = decomposeTransform(data.transform);
        const speed = data.parameters.get('speed');
        const size = state.parameters.get('size');

        // Create bullet in your game.
        // ...
    }

    getMuzzleTransform(muzzleName: string) {
        // Return global transform of muzzle
        return gt.composeTransform(
            { x: 0.25, y: 0.0, rotationDeg: 35 }
        );
    }

    getEnemyTransform(muzzleName: string) {
        // Return global transform of enemy
        return gt.composeTransform(
            { x: -0.45, y: 0.0.25, rotationDeg: 0 }
        );
    }
};

const player = gt.createDefaultPlayer(new Owner());  // Create player per weapons or enemies
const guntree = gt.concat(
    gt.useMuzzle('centerMuzzle'),
    gt.fire(bullet()),
);  // GunTree can used multiple weapons
player.setGuntree(guntree);

player.start();
while (player.isRunning()) {
    player.tick();  // Play 1 frame
    // or
    const deltaMS = Math.floor(1000 / 60);
    player.update(deltaMS);  // Play time
}
```

## Licence

MIT
