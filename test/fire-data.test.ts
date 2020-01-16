import * as mat from "transformation-matrix";

import { DefaultFireData } from "guntree/firing-state";

describe("#FireData", (): void => {
  test.each`
    parameterName | amount
    ${"speed"}    | ${1}
    ${"size"}     | ${1}
  `(
    "has initial parameters: $parameterName as $amount",
    ({ parameterName, amount }): void => {
      // When create FireData
      const fd = new DefaultFireData();

      // Then FireData has speed parameter
      expect(fd.parameters.get(parameterName)).toBeCloseTo(amount);
    }
  );

  test("can copy self with muzzleName", (): void => {
    // Given FireData
    const fd = new DefaultFireData();

    // And muzzleName was set in FireData
    fd.muzzleName = "a";

    // When copy FireData
    const clone = fd.copy();

    // Then copy's muzzleName is equal to original
    expect(clone.muzzleName).toEqual(fd.muzzleName);
  });

  test("can copy self with transform", (): void => {
    // Given FireData
    const fd = new DefaultFireData();

    // And transform was set in FireData
    fd.transform = mat.translate(30);

    // When copy FireData
    const clone = fd.copy();

    // Then copy's transform is equal to original
    expect(clone.transform).toEqual(fd.transform);
    // And copy's transform is not same object with original
    expect(clone.transform).not.toBe(fd.transform);
  });

  test("can copy self with transform", (): void => {
    // Given FireData
    const fd = new DefaultFireData();

    // And parameters was set in FireData
    fd.parameters = new Map([
      ["a", 0],
      ["b", -1],
      ["1", 1.5]
    ]);

    // When copy FireData
    const clone = fd.copy();

    // Then copy's parameters is equal to original
    expect(clone.parameters).toEqual(fd.parameters);
    // And copy's parameters is not same object with original
    expect(clone.parameters).not.toBe(fd.parameters);
  });

  test("can copy self with transform", (): void => {
    // Given FireData
    const fd = new DefaultFireData();

    // And texts was set in FireData
    fd.texts = new Map([
      ["a", "123"],
      ["b", "wqr"],
      ["1", ""]
    ]);

    // When copy FireData
    const clone = fd.copy();

    // Then copy's texts is equal to original
    expect(clone.texts).toEqual(fd.texts);
    // And copy's texts is not same object with original
    expect(clone.texts).not.toBe(fd.texts);
  });
});
