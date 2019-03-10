import * as mat from 'transformation-matrix';

import { FixedAimMuzzle } from 'guntree/elements/virtual-muzzle';
import { IMuzzle } from 'guntree/muzzle';
import { decomposeTransform } from 'guntree/transform-util';
import { IFireData } from 'guntree/firing-state';
import { IBullet } from 'guntree/gun';
import { simpleMock } from '../util';

describe('#fixedAimMuzzle', () => {
    test('deal muzzle transform aimed at used', () => {
        // Given base muzzle
        const baseTrans = mat.rotateDEG(12);
        // aiming angle become 30 deg
        const enemyTrans = mat.translate(Math.sqrt(3), 1);
        const muzzleClass = jest.fn<IMuzzle>(() => ({
            getMuzzleTransform: jest.fn().mockReturnValue(baseTrans),
            getEnemyTransform: jest.fn().mockReturnValueOnce(enemyTrans),
        }));
        const baseMuzzle = new muzzleClass();

        // And fixedAim based on base muzzle
        const fixedAim = new FixedAimMuzzle().generate();
        fixedAim.basedOn(baseMuzzle);

        // When change enemy translate
        // aiming angle become 45 deg
        enemyTrans.e += 1 - Math.sqrt(3);

        // And calcMuzzleTransform of fixedAim
        const aimedTrans = fixedAim.getMuzzleTransform();

        // Then calculated transform aimed enemy at used
        const [_, rotDeg, __] = decomposeTransform(aimedTrans);
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

        // And fixedAim based on base muzzle
        const fixedAim = new FixedAimMuzzle().generate();
        fixedAim.basedOn(baseMuzzle);

        // And FireData
        const fireData = simpleMock<IFireData>();

        // And Bullet
        const bullet = simpleMock<IBullet>();

        // When call fire of fixedAim muzzle
        fixedAim.fire(fireData, bullet);

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

        // And fixedAim based on base muzzle
        const fixedAim = new FixedAimMuzzle().generate();
        fixedAim.basedOn(baseMuzzle);

        // When call getEnemyTransform of fixedAim muzzle
        const gottenTrans = fixedAim.getEnemyTransform();

        // Then base muzzle enemy transform was gotten
        expect(gottenTrans).toBe(trans);
    });

    test('generate different muzzles', () => {
        // Given AimingMuzzle class
        const fixedAimGenerator = new FixedAimMuzzle();

        // When generate two virtual muzzles
        const mzl1 = fixedAimGenerator.generate();
        const mzl2 = fixedAimGenerator.generate();

        // Then two muzzles is different
        expect(mzl1).not.toBe(mzl2);
    });
});
