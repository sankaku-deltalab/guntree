import * as mat from 'transformation-matrix';

import { IGun, IBullet } from './gun';
import { IFiringState, FiringState } from './firing-state';

export interface IPlayer {
    isRunning: boolean;

    setGunTree(gunTree: IGun): void;
    start(): void;
    tick(): void;

    notifyFired(state: IFiringState, bullet: IBullet): void;
    getMuzzleTransform(muzzle: string): mat.Matrix;
}

export interface IPlayerOwner {
    notifyFired(player: IPlayer, state: IFiringState, bullet: IBullet): void;
    getMuzzleTransform(muzzle: string): mat.Matrix;
}

export type TPlayerOption = {
    additionalParameters?: {[key: string]: number};
    additionalTexts?: {[key: string]: string};
};

export class Player implements IPlayer {
    private gunTree: IGun | null;
    private firingProgress: IterableIterator<void> | null;
    private readonly option: TPlayerOption;

    constructor(private readonly owner: IPlayerOwner,
                option?: TPlayerOption) {
        this.gunTree = null;
        this.firingProgress = null;
        this.option = option || {};
    }

    get isRunning(): boolean {
        return this.firingProgress !== null;
    }

    setGunTree(gunTree: IGun): void {
        this.gunTree = gunTree;
    }

    start(): boolean {
        if (this.gunTree === null) throw new Error('GunTree was not set');
        this.firingProgress = this.gunTree.play(this.createFiringState());
        return this.tick();
    }

    private createFiringState(): IFiringState {
        const state = new FiringState(this);
        this.initParameters(state);
        this.initTexts(state);
        return state;
    }

    private initParameters(state: IFiringState): void {
        let initialParameters: [string, number][] = [
            ['speed', 1],
            ['size', 1],
        ];
        if (this.option.additionalParameters !== undefined) {
            const additional = Object.entries(this.option.additionalParameters);
            initialParameters = initialParameters.concat(additional);
        }
        for (const [key, value] of initialParameters) {
            state.fireData.parameters.set(key, value);
        }
    }

    private initTexts(state: IFiringState): void {
        let initialTexts: [string, string][] = [];
        if (this.option.additionalTexts !== undefined) {
            const additional = Object.entries(this.option.additionalTexts);
            initialTexts = initialTexts.concat(additional);
        }
        for (const [key, value] of initialTexts) {
            state.fireData.texts.set(key, value);
        }
    }

    tick(): boolean {
        if (this.firingProgress === null) return true;
        const r = this.firingProgress.next();

        if (!r.done) return false;

        this.firingProgress = null;
        return true;
    }

    notifyFired(state: IFiringState, bullet: IBullet): void {
        this.owner.notifyFired(this, state, bullet);
    }

    getMuzzleTransform(muzzle: string): mat.Matrix {
        return this.owner.getMuzzleTransform(muzzle);
    }
}
