import { IFiringState } from 'guntree/gun';
import { SetText } from 'guntree/contents/gun-modifier';
import { ILazyEvaluative } from 'guntree/lazy-evaluative';

describe('#SetText', () => {
    test('set text with string', () => {
        // Given SetText gun
        const key = 'a';
        const text = 'b';
        const setText = new SetText(key, text);

        // And FiringState
        const firingStateClass = jest.fn<IFiringState>(() => ({
            texts: new Map(),
        }));
        const state = new firingStateClass();

        // When play SetText
        setText.play(state).next();

        // Then FiringState has text
        expect(state.texts.get(key)).toBe(text);
    });

    test('set text with lazy-evaluative deal string', () => {
        // Given lazy-evaluative
        const text = 'b';
        const leClass = jest.fn<ILazyEvaluative<string>>((value: string) => ({
            calc: jest.fn().mockReturnValue(value),
        }));
        const le = new leClass(text);

        // And SetText gun
        const key = 'a';
        const setText = new SetText(key, le);

        // And FiringState
        const firingStateClass = jest.fn<IFiringState>(() => ({
            texts: new Map(),
        }));
        const state = new firingStateClass();

        // When play SetText
        setText.play(state).next();

        // Then FiringState has text
        expect(state.texts.get(key)).toBe(text);
    });
});
