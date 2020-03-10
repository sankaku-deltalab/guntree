import * as mat from "transformation-matrix";

import {
  DefaultFiringState,
  DefaultRepeatStateManager,
  DefaultFireData,
  FireData
} from "guntree/firing-state";
import { simpleMock } from "../util";
import {
  fire,
  bullet,
  repeat,
  addParameter,
  useParameter,
  centerizedLinear
} from "guntree/contents";
import { Muzzle } from "guntree/muzzle";
import { decomposeTransform } from "guntree/transform-util";
import { Player } from "guntree/player";

describe.only("#repeat", (): void => {
  test("can add parameter twice", (): void => {
    // Given firing state
    const muzzle = simpleMock<Muzzle>();
    muzzle.getMuzzleTransform = jest.fn().mockReturnValue(mat.rotateDEG(0));
    const rsm = new DefaultRepeatStateManager();
    const fd = new DefaultFireData();
    const player = simpleMock<Player>();
    player.getMuzzle = jest.fn().mockReturnValue(muzzle);
    const fs = new DefaultFiringState(player, fd, rsm);
    fs.muzzle = muzzle;

    const params: number[] = [];
    muzzle.fire = jest.fn().mockImplementation((data: FireData) => {
      const p = data.parameters.get("param");
      if (p === undefined) throw new Error();
      params.push(p);
    });

    // When play nested repeat with paramter adding
    const gun = repeat(
      { times: 3, interval: 0 },
      useParameter("param", 0),
      addParameter("param", centerizedLinear(90)),
      repeat(
        { times: 2, interval: 0 },
        addParameter("param", centerizedLinear(4)),
        fire(bullet())
      )
    );
    const progress = gun.play(fs);
    while (true) {
      const r = progress.next();
      if (r.done) break;
    }

    // Then double parameter adding was applied
    const expectedParams = [-31, -29, -1, 1, 29, 31];
    expect(params).toHaveLength(expectedParams.length);
    expectedParams.map((expected, idx) => {
      const actual = params[idx];
      expect(actual).toBeCloseTo(expected);
    });
  });
});
