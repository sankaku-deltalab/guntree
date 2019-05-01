import * as mat from "transformation-matrix";

import { AimingMuzzle } from "guntree/elements/virtual-muzzle";
import { IMuzzle } from "guntree/muzzle";
import { decomposeTransform } from "guntree/transform-util";
import { IFireData } from "guntree/firing-state";
import { IBullet } from "guntree/gun";
import { simpleMock } from "../util";

describe("#aimingMuzzle", (): void => {
  test("deal muzzle transform aiming enemy every frame", (): void => {
    // Given base muzzle
    const baseTrans = mat.rotateDEG(12);
    const enemyTrans = mat.translate(1, 0);
    const baseMuzzle = simpleMock<IMuzzle>();
    baseMuzzle.getMuzzleTransform = jest.fn().mockReturnValue(baseTrans);
    baseMuzzle.getEnemyTransform = jest.fn().mockReturnValue(enemyTrans);

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

  test("call based muzzle fire when self fire was called", (): void => {
    // Given base muzzle
    const baseMuzzle = simpleMock<IMuzzle>();
    baseMuzzle.fire = jest.fn();
    baseMuzzle.getMuzzleTransform = jest.fn().mockReturnValue(mat.translate(0));
    baseMuzzle.getEnemyTransform = jest.fn().mockReturnValue(mat.translate(0));

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

  test("use based muzzle enemy transform", (): void => {
    // Given base muzzle
    const trans = simpleMock<mat.Matrix>();
    const baseMuzzle = simpleMock<IMuzzle>();
    baseMuzzle.getMuzzleTransform = jest.fn().mockReturnValue(mat.translate(0));
    baseMuzzle.getEnemyTransform = jest.fn().mockReturnValue(trans);

    // And aiming based on base muzzle
    const aiming = new AimingMuzzle().generate();
    aiming.basedOn(baseMuzzle);

    // When call getEnemyTransform of aiming muzzle
    const gottenTrans = aiming.getEnemyTransform();

    // Then base muzzle enemy transform was gotten
    expect(gottenTrans).toBe(trans);
  });

  test("generate different muzzles", (): void => {
    // Given AimingMuzzle class
    const aimingGenerator = new AimingMuzzle();

    // When generate two virtual muzzles
    const mzl1 = aimingGenerator.generate();
    const mzl2 = aimingGenerator.generate();

    // Then two muzzles is different
    expect(mzl1).not.toBe(mzl2);
  });
});
