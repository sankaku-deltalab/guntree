import * as mat from 'transformation-matrix';

import { IBullet } from './gun';
import { IFireData } from './firing-state';

/**
 * Muzzle presents firing location and angle.
 */
export interface IMuzzle {
    /**
     * Fire bullet.
     *
     * @param data FireData when fired.
     * @param bullet Firing bullet.
     */
    fire(data: IFireData, bullet: IBullet): void;

    /**
     * Get muzzle transform.
     */
    getMuzzleTransform(): mat.Matrix;

    /**
     * Get enemy transform.
     */
    getEnemyTransform(): mat.Matrix;
}
