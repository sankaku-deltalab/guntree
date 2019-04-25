import { IGun } from './gun';
import { IFiringState } from './firing-state';
import { IMuzzle } from './muzzle';

/**
 * Player play guntree.
 */
export interface IPlayer {
    /** Is playing guntree. */
    isRunning: boolean;

    /**
     * Get muzzle by name.
     * Muzzles owned by player should be defined by user.
     *
     * @param muzzleName Muzzle name
     */
    getMuzzle(muzzleName: string): IMuzzle;

    /**
     * Set guntree.
     *
     * @param gunTree Setting guntree. Guntree can used by multiple player.
     */
    setGunTree(gunTree: IGun): void;

    /**
     * Start playing guntree.
     */
    start(): void;

    /**
     * Continue playing guntree.
     * Someone call this function every frames.
     */
    tick(): void;
}

export type TPlayerOption = {
    muzzle: { [key: string]: IMuzzle };
    additionalParameters?: { [key: string]: number };
    additionalTexts?: { [key: string]: string };
};

export class Player implements IPlayer {
    private gunTree: IGun | null;
    private firingProgress: IterableIterator<void> | null;

    constructor(
        private readonly option: TPlayerOption,
        private readonly firingState: IFiringState,
    ) {
        this.gunTree = null;
        this.firingProgress = null;
        this.option = option || {};
    }

    get isRunning(): boolean {
        return this.firingProgress !== null;
    }

    getMuzzle(muzzleName: string): IMuzzle {
        if (!(muzzleName in this.option.muzzle)) throw new Error(`muzzle ${muzzleName} is not set`);
        return this.option.muzzle[muzzleName];
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
        const state = this.firingState.copy();
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
}
