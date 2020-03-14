import * as mat from "transformation-matrix";

import { FiringState } from "guntree/firing-state";
import {
  repeat,
  addParameter,
  useParameter,
  centerizedLinear
} from "guntree/contents";
import { Muzzle } from "guntree/muzzle";
import { FireData } from "guntree/fire-data";
import { simpleMock, createGunMockWithCallback } from "../util";

describe.only("#repeat", (): void => {
  test("can add parameter twice", (): void => {
    // Given firing state
    const muzzle = simpleMock<Muzzle>();
    muzzle.getMuzzleTransform = jest.fn().mockReturnValue(mat.rotateDEG(0));
    const fs = new FiringState();
    fs.setMuzzle(muzzle);

    const params: number[] = [];
    const fire = createGunMockWithCallback((_owner, _player, state) => {
      const fd = new FireData();
      state.modifyFireData(fd);
      const p = fd.parameters.get("param");
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
        fire
      )
    );
    const progress = gun.play(simpleMock(), simpleMock(), fs);
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
