import { FiringState, FireData } from "guntree/firing-state";
import { SetTextImmediatelyModifier } from "guntree/elements/gunModifier";
import { simpleMock, createLazyEvaluativeMockReturnOnce } from "../util";

const createFireData = (texts: Map<string, string>): FireData => {
  const fd = simpleMock<FireData>();
  fd.texts = texts;
  return fd;
};

describe("#SetTextImmediatelyModifier", (): void => {
  test("can set text with unset name", (): void => {
    // Given firing state
    const state = simpleMock<FiringState>();

    // And FireData
    const fd = createFireData(new Map());

    // And SetTextImmediatelyModifier
    const name = "a";
    const text = "aa";
    const setTextMod = new SetTextImmediatelyModifier(name, text);

    // When modify SetTextImmediately
    setTextMod.createModifier(state)(state, fd);

    // Then text was set
    expect(fd.texts).toEqual(new Map([[name, text]]));
  });

  test("can set text with already set name", (): void => {
    // Given firing state
    const state = simpleMock<FiringState>();

    // And FireData
    const name = "a";
    const initialText = "aa";
    const fd = createFireData(new Map([[name, initialText]]));

    // And SetTextImmediatelyModifier
    const text = "bb";
    const setTextMod = new SetTextImmediatelyModifier(name, text);

    // When modify SetTextImmediately
    setTextMod.createModifier(state)(state, fd);

    // Then text was set
    expect(fd.texts).toEqual(new Map([[name, text]]));
  });

  test("can set text with lazyEvaluative text", (): void => {
    // Given firing state
    const state = simpleMock<FiringState>();

    // And FireData
    const fd = createFireData(new Map());

    // And SetTextImmediatelyModifier
    const name = "a";
    const textConst = "aa";
    const textLe = createLazyEvaluativeMockReturnOnce(textConst);
    const setTextMod = new SetTextImmediatelyModifier(name, textLe);

    // When modify SetTextImmediately
    setTextMod.createModifier(state)(state, fd);

    // Then text was set
    expect(fd.texts).toEqual(new Map([[name, textConst]]));
  });
});
