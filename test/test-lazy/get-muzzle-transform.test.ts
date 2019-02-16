import * as mat from 'transformation-matrix';

import { IFiringState } from 'guntree/firing-state';
import { GetMuzzleTransform } from 'guntree/elements/lazyEvaluative';

const stateClass = jest.fn<IFiringState>((muzzleName: string, muzzleTrans: mat.Matrix) => ({
    fireData: {
        texts: new Map(),
    },
    player: {
        getMuzzleTransform: jest.fn().mockImplementationOnce((muzzle: string) => {
            if (muzzle === muzzleName) return muzzleTrans;
            throw new Error();
        }),
    },
}));

describe('#GetMuzzleTransform', () => {
    test('deal muzzle trans gotten from player owner', () => {
        // Given repeating progress
        const muzzleName = 'a';
        const muzzleTrans = mat.translate(7, 2);
        const state = new stateClass(muzzleName, muzzleTrans);

        // And GetMuzzleTransform
        const getMuzzleTrans = new GetMuzzleTransform();

        // When set muzzle
        state.fireData.texts.set('muzzle', muzzleName);

        // And eval GetMuzzleTransform
        const actual = getMuzzleTrans.calc(state);

        // Then translated matrix was dealt
        expect(actual).toEqual(muzzleTrans);
    });
});
