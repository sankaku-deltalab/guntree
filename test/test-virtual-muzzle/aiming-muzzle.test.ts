import * as mat from "transformation-matrix";

import { AimingMuzzle } from "guntree/elements/virtual-muzzle";
import { Muzzle } from "guntree/muzzle";
import { decomposeTransform } from "guntree/transform-util";
import { simpleMock } from "../util";

describe("#aimingMuzzle", (): void => {
  test.each`
    enemyMoveDelta               | expectedRotDeg
    ${{ x: Math.sqrt(3), y: 1 }} | ${30}
    ${{ x: 1, y: 0 }}            | ${0}
    ${{ x: 1, y: 1 }}            | ${45}
    ${{ x: 0, y: 1 }}            | ${90}
    ${{ x: -1, y: 1 }}           | ${135}
    ${{ x: -1, y: 0 }}           | ${180}
    ${{ x: -1, y: -1 }}          | ${-135}
  `("aiming enemy every time", ({ enemyMoveDelta, expectedRotDeg }): void => {
    // Given base muzzle
    const baseTrans = mat.rotateDEG(12);
    const enemyTrans = mat.translate(0, 0);
    const baseMuzzle = simpleMock<Muzzle>();
    baseMuzzle.getMuzzleTransform = jest.fn().mockReturnValue(baseTrans);
    baseMuzzle.getEnemyTransform = jest.fn().mockReturnValue(enemyTrans);

    // And aimingMuzzle based on base muzzle
    const aiming = new AimingMuzzle().generate();
    aiming.basedOn(baseMuzzle);

    // When change enemy translate
    // aiming angle become 30 deg
    enemyTrans.e += enemyMoveDelta.x;
    enemyTrans.f += enemyMoveDelta.y;

    // And calcMuzzleTransform of aimingMuzzle
    const aimingTrans = aiming.getMuzzleTransform();

    // Then calculated transform aim enemy
    const [_, rotDeg, __] = decomposeTransform(aimingTrans);
    expect(rotDeg).toBeCloseTo(expectedRotDeg);
  });

  test("use based muzzle enemy transform", (): void => {
    // Given base muzzle
    const trans = simpleMock<mat.Matrix>();
    const baseMuzzle = simpleMock<Muzzle>();
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
