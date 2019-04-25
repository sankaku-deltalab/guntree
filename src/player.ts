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

export class Player implements IPlayer {
    private gunTree: IGun | null;
    private firingProgress: IterableIterator<void> | null;

    constructor(
        private readonly firingState: IFiringState,
        private readonly muzzle: { [key: string]: IMuzzle },
    ) {
        this.gunTree = null;
        this.firingProgress = null;
    }

    get isRunning(): boolean {
        return this.firingProgress !== null;
    }

    getMuzzle(muzzleName: string): IMuzzle {
        if (!(muzzleName in this.muzzle)) throw new Error(`muzzle ${muzzleName} is not set`);
        return this.muzzle[muzzleName];
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
        return this.firingState.copy();
    }

    tick(): boolean {
        if (this.firingProgress === null) return true;
        const r = this.firingProgress.next();

        if (!r.done) return false;

        this.firingProgress = null;
        return true;
    }
}
