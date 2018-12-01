import { IFiringState, FiringState, IGun, IBullet } from 'guntree/gun';

export interface IPlayer {
    setGunTree(gunTree: IGun): void;
    start(): void;

    notifyFired(state: IFiringState, bullet: IBullet): void;
}
export class Player implements IPlayer {
    private gunTree: IGun | null;
    private firingProgress: IterableIterator<void> | null;

    constructor() {
        this.gunTree = null;
        this.firingProgress = null;
    }

    setGunTree(gunTree: IGun): void {
        this.gunTree = gunTree;
    }

    start(): void {
        if (this.gunTree === null) throw new Error('GunTree was not set');
        this.firingProgress = this.gunTree.play(new FiringState(this));
        this.firingProgress.next();
    }

    notifyFired(state: IFiringState, bullet: IBullet): void {
        // TODO:
    }
}
