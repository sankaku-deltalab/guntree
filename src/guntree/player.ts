import { IFiringState, FiringState, IGun, IBullet } from 'guntree/gun';
import { Parameter } from 'guntree/parameter';

export interface IPlayer {
    isRunning: boolean;

    setGunTree(gunTree: IGun): void;
    start(): void;
    tick(): void;

    notifyFired(state: IFiringState, bullet: IBullet): void;
}

export interface IPlayerOwner {
    notifyFired(player: IPlayer, state: IFiringState, bullet: IBullet): void;
}

export type TPlayerOption = {
    additionalParameters?: {[key: string]: number};
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
        let initialParameters: [string, number][] = [
            ['angle', 0],
            ['aimAngle', 0],
            ['speed', 1],
            ['size', 1],
        ];
        if (this.option.additionalParameters !== undefined) {
            const additional = Object.entries(this.option.additionalParameters);
            initialParameters = initialParameters.concat(additional);
        }
        for (const [key, value] of initialParameters) {
            state.parameters.set(key, new Parameter(value));
        }
        return state;
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
}
