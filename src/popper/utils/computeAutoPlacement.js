import getBoundaries from '../utils/getBoundaries';

/**
 * Utility used to transform the `auto` placement to the placement with more
 * available space.
 * @method
 * @memberof Popper.Utils
 * @argument {Object} data - The data object generated by update method
 * @argument {Object} options - Modifiers configuration and options
 * @returns {Object} The data object, properly modified
 */
export default function computeAutoPlacement(placement, refRect, popper) {
    if (placement.indexOf('auto') === -1) {
        return placement;
    }

    const boundaries = getBoundaries(popper, 0, 'scrollParent');

    const sides = {
        top: refRect.top - boundaries.top,
        right: boundaries.right - refRect.right,
        bottom: boundaries.bottom - refRect.bottom,
        left: refRect.left - boundaries.left,
    };

    const computedPlacement = Object.keys(sides).sort((a, b) => sides[b] - sides[a])[0];
    const variation = placement.split('-')[1];

    return computedPlacement + (variation ? `-${variation}` : '');
}
