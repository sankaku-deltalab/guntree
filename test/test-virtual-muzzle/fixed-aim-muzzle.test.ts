import * as mat from "transformation-matrix";

import { FixedAimMuzzle } from "guntree/elements/virtual-muzzle";
import { Muzzle } from "guntree/muzzle";
import { decomposeTransform } from "guntree/transform-util";
import { simpleMock } from "../util";

describe("#fixedAimMuzzle", (): void => {
  test("deal muzzle transform aimed at used", (): void => {
    // Given base muzzle
    const baseTrans = mat.rotateDEG(12);
    // aiming angle become 30 deg
    const enemyTrans = mat.translate(Math.sqrt(3), 1);
    const baseMuzzle = simpleMock<Muzzle>();
    baseMuzzle.getMuzzleTransform = jest.fn().mockReturnValue(baseTrans);
    baseMuzzle.getEnemyTransform = jest.fn().mockReturnValue(enemyTrans);

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

  test("use based muzzle enemy transform", (): void => {
    // Given base muzzle
    const trans = simpleMock<mat.Matrix>();
    const baseMuzzle = simpleMock<Muzzle>();
    baseMuzzle.getMuzzleTransform = jest.fn().mockReturnValue(mat.translate(0));
    baseMuzzle.getEnemyTransform = jest.fn().mockReturnValue(trans);

    // And fixedAim based on base muzzle
    const fixedAim = new FixedAimMuzzle().generate();
    fixedAim.basedOn(baseMuzzle);

    // When call getEnemyTransform of fixedAim muzzle
    const gottenTrans = fixedAim.getEnemyTransform();

    // Then base muzzle enemy transform was gotten
    expect(gottenTrans).toBe(trans);
  });

  test("generate different muzzles", (): void => {
    // Given AimingMuzzle class
    const fixedAimGenerator = new FixedAimMuzzle();

    // When generate two virtual muzzles
    const mzl1 = fixedAimGenerator.generate();
    const mzl2 = fixedAimGenerator.generate();

    // Then two muzzles is different
    expect(mzl1).not.toBe(mzl2);
  });
});
