import { IFiringState, IBullet } from 'guntree/gun';

export interface IPlayer {
    notifyFired(state: IFiringState, bullet: IBullet): void;
}
