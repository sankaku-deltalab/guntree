import * as mat from 'transformation-matrix';

import { AimingMuzzle } from 'guntree/elements/virtual-muzzle';
import { IMuzzle } from 'guntree/muzzle';
import { decomposeTransform } from 'guntree/transform-util';
import { IFireData } from 'guntree/firing-state';
import { IBullet } from 'guntree/gun';
import { simpleMock } from '../util';

describe('#aimingMuzzle', () => {
    test('deal muzzle transform aiming enemy every frame', () => {
        // Given base muzzle
        const baseTrans = mat.rotateDEG(12);
        const enemyTrans = mat.translate(1, 0);
        const muzzleClass = jest.fn<IMuzzle>(() => ({
            getMuzzleTransform: jest.fn().mockReturnValueOnce(baseTrans),
            getEnemyTransform: jest.fn().mockReturnValueOnce(enemyTrans),
        }));
        const baseMuzzle = new muzzleClass();

        // And aimingMuzzle based on base muzzle
        const aiming = new AimingMuzzle().generate();
        aiming.basedOn(baseMuzzle);

        // When change enemy translate
        // aiming angle become 30 deg
        enemyTrans.e += Math.sqrt(3) - 1;
        enemyTrans.f += 1;

        // And calcMuzzleTransform of aimingMuzzle
        const aimingTrans = aiming.getMuzzleTransform();

        // Then calculated transform aim enemy
        const [_, rotDeg, __] = decomposeTransform(aimingTrans);
        expect(rotDeg).toBeCloseTo(30);
    });

    test('call based muzzle fire when self fire was called', () => {
        // Given base muzzle
        const muzzleClass = jest.fn<IMuzzle>(() => ({
            fire: jest.fn(),
            getMuzzleTransform: jest.fn().mockReturnValueOnce(mat.translate(0)),
            getEnemyTransform: jest.fn().mockReturnValueOnce(mat.translate(0)),
        }));
        const baseMuzzle = new muzzleClass();

        // And aiming based on base muzzle
        const aiming = new AimingMuzzle().generate();
        aiming.basedOn(baseMuzzle);

        // And FireData
        const fireData = simpleMock<IFireData>();

        // And Bullet
        const bullet = simpleMock<IBullet>();

        // When call fire of aiming muzzle
        aiming.fire(fireData, bullet);

        // Then base muzzle fire was called
        expect(baseMuzzle.fire).toBeCalledWith(fireData, bullet);
    });

    test('use based muzzle enemy transform', () => {
        // Given base muzzle
        const trans = simpleMock<mat.Matrix>();
        const muzzleClass = jest.fn<IMuzzle>(() => ({
            getMuzzleTransform: jest.fn().mockReturnValueOnce(mat.translate(0)),
            getEnemyTransform: jest.fn().mockReturnValue(trans),
        }));
        const baseMuzzle = new muzzleClass();

        // And aiming based on base muzzle
        const aiming = new AimingMuzzle().generate();
        aiming.basedOn(baseMuzzle);

        // When call getEnemyTransform of aiming muzzle
        const gottenTrans = aiming.getEnemyTransform();

        // Then base muzzle enemy transform was gotten
        expect(gottenTrans).toBe(trans);
    });

    test('generate different muzzles', () => {
        // Given AimingMuzzle class
        const aimingGenerator = new AimingMuzzle();

        // When generate two virtual muzzles
        const mzl1 = aimingGenerator.generate();
        const mzl2 = aimingGenerator.generate();

        // Then two muzzles is different
        expect(mzl1).not.toBe(mzl2);
    });
});
