import type {Placement as PlacementType} from '@floating-ui/core';
import {autoUpdate, flip, shift, useFloating} from '@floating-ui/react-dom';
import {useLayoutEffect, useState} from 'react';

import {allPlacements} from '../utils/allPlacements';
import {Controls} from '../utils/Controls';
import {useSize} from '../utils/useSize';

export function Placement() {
  const [rtl, setRtl] = useState(false);
  const [placement, setPlacement] = useState<PlacementType>('bottom');
  const {x, y, reference, floating, strategy, update} = useFloating({
    placement,
    middleware: [shift(), flip()],
    whileElementsMounted: autoUpdate,
  });
  const [size, handleSizeChange] = useSize();

  useLayoutEffect(update, [size, update, rtl]);

  return (
    <>
      <h1>Placement</h1>
      <p>
        The floating element should be correctly positioned when given each of
        the 12 placements.
      </p>
      <div className="container" style={{direction: rtl ? 'rtl' : 'ltr'}}>
        <div ref={reference} className="reference">
          Reference
        </div>
        <div
          ref={floating}
          className="floating"
          style={{
            position: strategy,
            top: y ?? '',
            left: x ?? '',
            width: size,
            height: size,
          }}
        >
          Floating
        </div>
        <div
          style={{
            position: 'absolute',
            top: 400,
            left: 400,
            background: 'orange',
            padding: 15,
          }}
          data-floating-ui-collidable
        >
          Collidable
        </div>
        <div
          style={{
            position: 'absolute',
            top: 400,
            left: 800,
            background: 'orange',
            padding: 15,
          }}
          data-floating-ui-collidable
        >
          Collidable
        </div>
        <div
          style={{
            position: 'absolute',
            top: 250,
            left: 475,
            background: 'orange',
            padding: 15,
          }}
          data-floating-ui-collidable
        >
          Collidable
        </div>
      </div>

      <Controls>
        <label htmlFor="size">Size</label>
        <input
          id="size"
          type="range"
          min="1"
          max="200"
          value={size}
          onChange={handleSizeChange}
        />
      </Controls>

      <Controls>
        {allPlacements.map((localPlacement) => (
          <button
            key={localPlacement}
            data-testid={`placement-${localPlacement}`}
            onClick={() => setPlacement(localPlacement)}
            style={{
              backgroundColor: localPlacement === placement ? 'black' : '',
            }}
          >
            {localPlacement}
          </button>
        ))}
      </Controls>

      <h2>RTL</h2>
      <Controls>
        {[true, false].map((bool) => (
          <button
            key={String(bool)}
            data-testid={`rtl-${bool}`}
            onClick={() => setRtl(bool)}
            style={{
              backgroundColor: rtl === bool ? 'black' : '',
            }}
          >
            {String(bool)}
          </button>
        ))}
      </Controls>
    </>
  );
}
