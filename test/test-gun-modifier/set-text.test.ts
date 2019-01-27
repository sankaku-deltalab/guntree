import { IFiringState } from 'guntree/firing-state';
import { SetTextImmediately } from 'guntree/elements/gunModifer';
import { ILazyEvaluative } from 'guntree/lazyEvaluative';

describe('#SetTextImmediately', () => {
    test('can set text with unset name', () => {
        // Given firing state
        const stateClass = jest.fn<IFiringState>(() => ({
            fireData: { texts: new Map() },
        }));
        const state = new stateClass();

        // And SetTextImmediately
        const name = 'a';
        const text = 'aa';
        const setText = new SetTextImmediately(name, text);

        // When play SetTextImmediately
        setText.play(state).next();

        // Then text was set
        expect(state.fireData.texts.get(name)).toBe(text);
    });

    test('can set text with already set name', () => {
        // Given firing state
        const name = 'a';
        const text = 'aa';
        const stateClass = jest.fn<IFiringState>(() => ({
            fireData: { texts: new Map([[name, `${text}b`]]) },
        }));
        const state = new stateClass();

        // And SetTextImmediately
        const setText = new SetTextImmediately(name, text);

        // When play SetTextImmediately
        setText.play(state).next();

        // Then text was set
        expect(state.fireData.texts.get(name)).toBe(text);
    });

    test('can set text with lazyEvaluative text', () => {
        // Given firing state
        const stateClass = jest.fn<IFiringState>(() => ({
            fireData: { texts: new Map() },
        }));
        const state = new stateClass();

        // And SetTextImmediately
        const leClass = jest.fn<ILazyEvaluative<string>>((t: string) => ({
            calc: jest.fn().mockReturnValueOnce(t),
        }));
        const name = 'a';
        const text = 'aa';
        const textLe = new leClass(text);
        const setText = new SetTextImmediately(name, textLe);

        // When play SetTextImmediately
        setText.play(state).next();

        // Then text was set
        expect(state.fireData.texts.get(name)).toBe(text);
    });
});
