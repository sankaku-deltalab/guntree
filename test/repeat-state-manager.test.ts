import { DefaultRepeatStateManager, RepeatState } from "guntree/firing-state";

describe("#RepeatStateManager", (): void => {
  test("has initial repeating", (): void => {
    // Given RepeatStateManager
    const rsm = new DefaultRepeatStateManager();

    // When get current repeating
    const actual = rsm.get();

    // Then get { finished: 0, total: 1 }
    const expected = { finished: 0, total: 1 };
    expect(actual).toEqual(expected);
  });

  test("can get current repeat state", (): void => {
    // Given RepeatStateManager
    const rsm = new DefaultRepeatStateManager();

    // And repeating was started
    const repeatState: RepeatState = { finished: 0, total: 10 };
    rsm.start(repeatState);

    // When get repeating state
    const actual = rsm.get();

    // Then dealt state is started repeat state
    expect(actual).toBe(repeatState);
  });

  test("can get repeat state by name", (): void => {
    // Given RepeatStateManager
    const rsm = new DefaultRepeatStateManager();

    // And repeating was started with repeating name
    const nameAndState = new Map([
      ["a", { finished: 0, total: 10 }],
      ["b", { finished: 3, total: 11 }],
      ["1", { finished: 1, total: 9 }]
    ]);
    for (const [name, rs] of nameAndState.entries()) {
      rsm.start(rs, name);
    }

    for (const [name, rs] of nameAndState.entries()) {
      // When get repeating state with name
      const actual = rsm.get(name);

      // Then dealt state is started repeat state
      expect(actual).toBe(rs);
    }
  });

  test("can nest repeating name when start repeating", (): void => {
    // Given RepeatStateManager
    const rsm = new DefaultRepeatStateManager();

    // And repeating was started
    const name = "a";
    const rs1: RepeatState = rsm.start({ finished: 0, total: 10 }, name);
    const rs2: RepeatState = rsm.start({ finished: 2, total: 80 }, name);

    // When get state
    // Then get last repeating
    const actual2 = rsm.get(name);
    expect(actual2).toBe(rs2);

    // And When finish last repeating
    // And get state
    // Then get first repeating
    rsm.finish(rs2, name);
    const actual1 = rsm.get(name);
    expect(actual1).toBe(rs1);
  });

  test("throw error if get repeat state with name and repeating was not started with that name", (): void => {
    // Given RepeatStateManager
    const rsm = new DefaultRepeatStateManager();

    // And repeating was started with name
    const name = "a";
    const badName = "b";
    rsm.start({ finished: 0, total: 10 }, name);

    // And get repeating with name not repeating
    const func = (): RepeatState => rsm.get(badName);

    // Then throw error repeating
    expect(func).toThrowError();
  });

  test("throw error if finish repeating if repeating was completed", (): void => {
    // Given RepeatStateManager
    const rsm = new DefaultRepeatStateManager();

    // And repeating was started
    const repeatState: RepeatState = { finished: 0, total: 10 };
    rsm.start(repeatState);

    // And repeating was finished
    rsm.finish(repeatState);

    // When finish repeating again
    const func = (): void => rsm.finish({ finished: 0, total: 10 });

    // Then throw error
    expect(func).toThrowError();
  });

  test("throw error when finish repeating if finishing repeating is not current repeating", (): void => {
    // Given RepeatStateManager
    const rsm = new DefaultRepeatStateManager();

    // And repeating was started twice
    const rs1 = rsm.start({ finished: 0, total: 10 });
    rsm.start({ finished: 1, total: 10 });

    // When finish first repeating
    const func = (): void => rsm.finish(rs1);

    // Then throw error
    expect(func).toThrowError();
  });

  test("can copy self with repeat states", (): void => {
    // Given RepeatStateManager
    const rsm = new DefaultRepeatStateManager();

    // And repeating was started with repeating name
    const states = [
      { finished: 0, total: 10 },
      { finished: 3, total: 11 },
      { finished: 1, total: 9 }
    ];
    states.map((s): RepeatState => rsm.start(s));

    // And cloned
    const clone = rsm.copy();
    states.reverse().map((rs): void => {
      // When get repeating state with name
      const actual = clone.get();

      // Then dealt state is started repeat state
      expect(actual).toBe(rs);

      clone.finish(rs);
    });
  });

  test("can copy self with named repeat states", (): void => {
    // Given RepeatStateManager
    const rsm = new DefaultRepeatStateManager();

    // And repeating was started with repeating name
    const nameAndState = new Map([
      ["a", { finished: 0, total: 10 }],
      ["b", { finished: 3, total: 11 }],
      ["1", { finished: 1, total: 9 }]
    ]);
    for (const [name, rs] of nameAndState.entries()) {
      rsm.start(rs, name);
    }

    for (const [name, rs] of nameAndState.entries()) {
      // When get repeating state with name
      const actual = rsm.get(name);

      // Then dealt state is started repeat state
      expect(actual).toBe(rs);
    }
  });
});
