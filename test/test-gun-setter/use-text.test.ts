import { FiringState, FireData } from "guntree/firing-state";
import { UseTextUpdater } from "guntree/elements/gunSetter";
import { simpleMock, createLazyEvaluativeMockReturnOnce } from "../util";

const createFireData = (texts: Map<string, string>): FireData => {
  const fd = simpleMock<FireData>();
  fd.texts = texts;
  return fd;
};

describe("#UseTextUpdater", (): void => {
  test("can set text with unset name", (): void => {
    // Given firing state
    const state = simpleMock<FiringState>();

    // And FireData
    state.fireData = createFireData(new Map());

    // And UseTextUpdater
    const name = "a";
    const text = "aa";
    const setTextMod = new UseTextUpdater(name, text);

    // When use UseTextUpdater
    setTextMod.updateFiringState(state);

    // Then text was set
    expect(state.fireData.texts).toEqual(new Map([[name, text]]));
  });

  test("can set text with already set name", (): void => {
    // Given firing state
    const state = simpleMock<FiringState>();

    // And FireData
    const name = "a";
    const initialText = "aa";
    state.fireData = createFireData(new Map([[name, initialText]]));

    // And UseTextUpdater
    const text = "bb";
    const setTextMod = new UseTextUpdater(name, text);

    // When use UseTextUpdater
    setTextMod.updateFiringState(state);

    // Then text was set
    expect(state.fireData.texts).toEqual(new Map([[name, text]]));
  });

  test("can set text with lazyEvaluative text", (): void => {
    // Given firing state
    const state = simpleMock<FiringState>();

    // And FireData
    state.fireData = createFireData(new Map());

    // And UseTextUpdater
    const name = "a";
    const textConst = "aa";
    const textLe = createLazyEvaluativeMockReturnOnce(textConst);
    const setTextMod = new UseTextUpdater(name, textLe);

    // When use UseTextUpdater
    setTextMod.updateFiringState(state);

    // Then text was set
    expect(state.fireData.texts).toEqual(new Map([[name, textConst]]));
  });
});
