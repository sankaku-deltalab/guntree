import { IFiringState, IFireData } from 'guntree/firing-state';
import { SetTextImmediatelyModifier } from 'guntree/elements/gunModifier';
import { simpleMock, createLazyEvaluativeMockReturnOnce } from '../util';

const createFireData = (texts: Map<string, string>) => {
    const fd = simpleMock<IFireData>();
    fd.texts = texts;
    return fd;
};

describe('#SetTextImmediatelyModifier', () => {
    test('can set text with unset name', () => {
        // Given firing state
        const state = simpleMock<IFiringState>();

        // And FireData
        const fd = createFireData(new Map());

        // And SetTextImmediatelyModifier
        const name = 'a';
        const text = 'aa';
        const setTextMod = new SetTextImmediatelyModifier(name, text);

        // When modify SetTextImmediately
        setTextMod.modifyFireData(state, fd);

        // Then text was set
        expect(fd.texts).toEqual(new Map([[name, text]]));
    });

    test('can set text with already set name', () => {
        // Given firing state
        const state = simpleMock<IFiringState>();

        // And FireData
        const name = 'a';
        const initialText = 'aa';
        const fd = createFireData(new Map([[name, initialText]]));

        // And SetTextImmediatelyModifier
        const text = 'bb';
        const setTextMod = new SetTextImmediatelyModifier(name, text);

        // When modify SetTextImmediately
        setTextMod.modifyFireData(state, fd);

        // Then text was set
        expect(fd.texts).toEqual(new Map([[name, text]]));
    });

    test('can set text with lazyEvaluative text', () => {
        // Given firing state
        const state = simpleMock<IFiringState>();

        // And FireData
        const fd = createFireData(new Map());

        // And SetTextImmediatelyModifier
        const name = 'a';
        const textConst = 'aa';
        const textLe = createLazyEvaluativeMockReturnOnce(textConst);
        const setTextMod = new SetTextImmediatelyModifier(name, textLe);

        // When modify SetTextImmediately
        setTextMod.modifyFireData(state, fd);

        // Then text was set
        expect(fd.texts).toEqual(new Map([[name, textConst]]));
    });
});
