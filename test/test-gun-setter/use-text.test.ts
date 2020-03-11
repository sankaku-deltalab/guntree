import { FiringState } from "guntree/firing-state";
import { UseTextUpdater } from "guntree/elements/gunSetter";
import { simpleMock, createLazyEvaluativeMockReturnOnce } from "../util";

describe("#UseTextUpdater", (): void => {
  test("can set text with unset name", (): void => {
    // Given firing state
    const state = new FiringState();

    // And UseTextUpdater
    const name = "a";
    const text = "aa";
    const setTextMod = new UseTextUpdater(name, text);

    // When use UseTextUpdater
    setTextMod.updateFiringState(simpleMock(), state);

    // Then text was set
    expect(state.texts.get(name)).toBe(text);
  });

  test("can set text with already set name", (): void => {
    // Given firing state
    const state = new FiringState();

    // And FireData
    const name = "a";
    const initialText = "aa";
    state.texts.set(name, initialText);

    // And UseTextUpdater
    const text = "bb";
    const setTextMod = new UseTextUpdater(name, text);

    // When use UseTextUpdater
    setTextMod.updateFiringState(simpleMock(), state);

    // Then text was set
    expect(state.texts.get(name)).toBe(text);
  });

  test("can set text with lazyEvaluative text", (): void => {
    // Given firing state
    const state = new FiringState();

    // And UseTextUpdater
    const name = "a";
    const textConst = "aa";
    const textLe = createLazyEvaluativeMockReturnOnce(textConst);
    const setTextMod = new UseTextUpdater(name, textLe);

    // When use UseTextUpdater
    setTextMod.updateFiringState(simpleMock(), state);

    // Then text was set
    expect(state.texts.get(name)).toBe(textConst);
  });
});
