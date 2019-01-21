# GunTree

GunTree is readable and extendable Danmaku describing package for shmups.

## How to describe Danmaku

```javascript
const guntree = repeat({ times: 2, interval: 30 },  // Repeat 2 times ...
    repeat({ times: 3, interval: 5 },  // Three round burst ...
        nWay({ ways: 5, totalAngle: 45 }  // 5-way ...
            setMuzzle('centerMuzzle'),  // From centerMuzzle ...
            fire({}),  // Fire!!
        ),
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
yarn install guntree
```

## Usage

GunTree control only firing progress.
GunTree don't create bullets with collision and shape.

```javascript
import { Player, contents } from 'guntree';

const yourCharacterWeapon = {
    notifyFired(player, state, bullet) {
        const aimAngle = state.parameters.get('baseAngle').getValue();
        const angle = state.parameters.get('angle').getValue();
        const speed = state.parameters.get('speed').getValue();
        const size = state.parameters.get('size').getValue();
        const muzzle = state.texts.get('size');

        // Create bullet to your game.
        // ...
    }
    getLocation(player, name) {
        // Return global location from name
        if (name === 'centerMuzzle') {
            return { x: 2, y: 2 };
        }
        return { x: 0, y: 0 };
    }
};

const player = new Player(yourCharacterWeapon);  // Create player per weapons
const guntree = contents.fire({});  // GunTree can used multiple weapons
player.setGuntree(guntree);
player.start();
while (player.isRunning()) {
    player.tick();  // Play 1 frame
}
```

## Licence

MIT
