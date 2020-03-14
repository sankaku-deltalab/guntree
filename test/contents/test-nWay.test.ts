import * as mat from "transformation-matrix";

import { FiringState } from "guntree/firing-state";
import { FireData } from "guntree/fire-data";
import { simpleMock, createGunMockWithCallback } from "../util";
import { nWay } from "guntree/contents";
import { Muzzle } from "guntree/muzzle";
import { decomposeTransform } from "guntree/transform-util";

describe.only("#nWay", (): void => {
  test("can add angle twice", (): void => {
    // Given firing state
    const muzzle = simpleMock<Muzzle>();
    muzzle.getMuzzleTransform = jest.fn().mockReturnValue(mat.rotateDEG(0));
    const fs = new FiringState();
    fs.setMuzzle(muzzle);

    const fires: FiringState[] = [];
    const fire = createGunMockWithCallback((_owner, _player, state) =>
      fires.push(state)
    );

    // When play nested nway
    const repeat = nWay(
      { ways: 2, totalAngle: 80 },
      nWay({ ways: 2, totalAngle: 4 }, fire)
    );
    const progress = repeat.play(simpleMock(), simpleMock(), fs);
    while (true) {
      const r = progress.next();
      if (r.done) break;
    }

    // Then double angles was applied
    const fireData = fires.map(state => {
      const fd = new FireData();
      state.modifyFireData(fd);
      return fd;
    });
    const angles = fireData.map(fd => {
      const [_pos, rot, _scale] = decomposeTransform(fd.transform);
      return rot;
    });
    expect(angles).toEqual([-21, -19, 19, 21]);
  });
});
