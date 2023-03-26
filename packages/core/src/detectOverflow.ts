import type {
  Boundary,
  Coords,
  ElementContext,
  MiddlewareState,
  Padding,
  RootBoundary,
  Side,
  SideObject,
} from './types';
import {getSideObjectFromPadding} from './utils/getPaddingObject';
import {max, min} from './utils/math';
import {rectToClientRect} from './utils/rectToClientRect';

export interface Options {
  /**
   * The clipping element(s) or area in which overflow will be checked.
   * @default 'clippingAncestors'
   */
  boundary: Boundary;

  /**
   * The root clipping area in which overflow will be checked.
   * @default 'viewport'
   */
  rootBoundary: RootBoundary;

  /**
   * The element in which overflow is being checked relative to a boundary.
   * @default 'floating'
   */
  elementContext: ElementContext;

  /**
   * Whether to check for overflow using the alternate element's boundary
   * (`clippingAncestors` boundary only).
   * @default false
   */
  altBoundary: boolean;

  /**
   * Virtual padding for the resolved overflow detection offsets.
   * @default 0
   */
  padding: Padding;
}

/**
 * Resolves with an object of overflow side offsets that determine how much the
 * element is overflowing a given clipping boundary on each side.
 * - positive = overflowing the boundary by that number of pixels
 * - negative = how many pixels left before it will overflow
 * - 0 = lies flush with the boundary
 * @see https://floating-ui.com/docs/detectOverflow
 */
export async function detectOverflow(
  state: MiddlewareState,
  options: Partial<Options> = {}
): Promise<
  SideObject & {
    isIntersecting: boolean;
    collidableIntersections: Array<
      Coords & {xDirection: Side; yDirection: Side}
    >;
  }
> {
  const {x, y, platform, rects, elements, strategy} = state;

  const {
    boundary = 'clippingAncestors',
    rootBoundary = 'viewport',
    elementContext = 'floating',
    altBoundary = false,
    padding = 0,
  } = options;

  const paddingObject = getSideObjectFromPadding(padding);
  const altContext = elementContext === 'floating' ? 'reference' : 'floating';
  const element = elements[altBoundary ? altContext : elementContext];

  const clippingClientRect = rectToClientRect(
    await platform.getClippingRect({
      element:
        (await platform.isElement?.(element)) ?? true
          ? element
          : element.contextElement ||
            (await platform.getDocumentElement?.(elements.floating)),
      boundary,
      rootBoundary,
      strategy,
    })
  );

  const rect =
    elementContext === 'floating' ? {...rects.floating, x, y} : rects.reference;

  const offsetParent = await platform.getOffsetParent?.(elements.floating);
  const offsetScale = (await platform.isElement?.(offsetParent))
    ? (await platform.getScale?.(offsetParent)) || {x: 1, y: 1}
    : {x: 1, y: 1};

  const elementClientRect = rectToClientRect(
    platform.convertOffsetParentRelativeRectToViewportRelativeRect
      ? await platform.convertOffsetParentRelativeRectToViewportRelativeRect({
          rect,
          offsetParent,
          strategy,
        })
      : rect
  );

  const collidables = Array.from(
    document.querySelectorAll('[data-floating-ui-collidable]')
  );

  function getIsIntersecting(element: Element) {
    const {top, left, bottom, right} = element.getBoundingClientRect();
    return (
      elementClientRect.top < bottom &&
      elementClientRect.bottom > top &&
      elementClientRect.left < right &&
      elementClientRect.right > left
    );
  }

  const isIntersecting = collidables
    .filter((el) => el !== element)
    .some(getIsIntersecting);

  // Check how much the element is intersecting with a collidable
  const collidableIntersections = collidables
    .filter(getIsIntersecting)
    .filter((el) => el !== element)
    .map((collidable) => {
      const collidableClientRect = collidable.getBoundingClientRect();

      const xDirection: Side =
        elementClientRect.left + elementClientRect.width / 2 <
        collidableClientRect.left + collidableClientRect.width / 2
          ? 'left'
          : 'right';
      const yDirection: Side =
        elementClientRect.top + elementClientRect.height / 2 <
        collidableClientRect.top + collidableClientRect.height / 2
          ? 'top'
          : 'bottom';

      const leftOp =
        xDirection === 'right'
          ? elementClientRect.left < collidableClientRect.left
          : elementClientRect.left > collidableClientRect.left;
      const rightOp =
        xDirection === 'right'
          ? elementClientRect.right > collidableClientRect.right
          : elementClientRect.right < collidableClientRect.right;
      const topOp =
        yDirection === 'bottom'
          ? elementClientRect.top < collidableClientRect.top
          : elementClientRect.top > collidableClientRect.top;
      const bottomOp =
        yDirection === 'bottom'
          ? elementClientRect.bottom > collidableClientRect.bottom
          : elementClientRect.bottom < collidableClientRect.bottom;

      const left = leftOp
        ? min(elementClientRect.left, collidableClientRect.left)
        : max(elementClientRect.left, collidableClientRect.left);
      const right = rightOp
        ? min(elementClientRect.right, collidableClientRect.right)
        : max(elementClientRect.right, collidableClientRect.right);
      const top = topOp
        ? min(elementClientRect.top, collidableClientRect.top)
        : max(elementClientRect.top, collidableClientRect.top);
      const bottom = bottomOp
        ? min(elementClientRect.bottom, collidableClientRect.bottom)
        : max(elementClientRect.bottom, collidableClientRect.bottom);

      return {
        x: right - left,
        y: bottom - top,
        xDirection,
        yDirection,
      };
    });

  return {
    isIntersecting,
    collidableIntersections,
    top:
      (clippingClientRect.top - elementClientRect.top + paddingObject.top) /
      offsetScale.y,
    bottom:
      (elementClientRect.bottom -
        clippingClientRect.bottom +
        paddingObject.bottom) /
      offsetScale.y,
    left:
      (clippingClientRect.left - elementClientRect.left + paddingObject.left) /
      offsetScale.x,
    right:
      (elementClientRect.right -
        clippingClientRect.right +
        paddingObject.right) /
      offsetScale.x,
  };
}
