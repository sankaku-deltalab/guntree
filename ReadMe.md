# GunTree

![pipeline](https://gitlab.com/sankaku-deltalab/guntree/badges/master/pipeline.svg)
![coverage](https://gitlab.com/sankaku-deltalab/guntree/badges/master/coverage.svg)

GunTree is readable and extendable Danmaku describing package for shmups.

## How to describe Danmaku

```javascript
const fiveWayFire = nWay(
    { ways: 5, totalAngle: 45 }  // 5-way ...
    fire(bullet()),  // Fire
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
GunTree don't create bullets with collision and shape.

[API](https://sankaku-deltalab.gitlab.io/guntree)

```javascript
import * as mat from 'transformation-matrix';
import { Player, contents as ct, decomposeTransform } from 'guntree';

const muzzle = {
    fire(data, bullet) {
        const [location, angleDeg, scale] = decomposeTransform(data.transform);
        const speed = data.parameters.get('speed');
        const size = state.parameters.get('size');

        // Create bullet in your game.
        // ...
    }

    getMuzzleTransform() {
        // Return global transform of muzzle
        return mat.transform(
            mat.translate(1.0, 0.25),
            mat.rotateDEG(35),
        );
    }

    getEnemyTransform() {
        // Return global transform of enemy
        return mat.transform(
            mat.translate(1.0, 0.25),
            mat.rotateDEG(35),
        );
    }
};

const player = createDefaultPlayer({ 'centerMuzzle': muzzle });  // Create player per weapons
const guntree = ct.concat(
    ct.useMuzzle('centerMuzzle'),
    ct.fire(bullet()),
);  // GunTree can used multiple weapons
player.setGuntree(guntree);

player.start();  // Start firing
while (player.isRunning()) {
    player.tick();  // Play 1 frame
}
```

## Licence

MIT
