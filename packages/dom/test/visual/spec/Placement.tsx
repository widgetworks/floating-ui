import type {Placement as PlacementType} from '@floating-ui/core';
import {
  autoUpdate,
  flip,
  offset,
  shift,
  useFloating,
} from '@floating-ui/react-dom';
import {useLayoutEffect, useState} from 'react';

import {allPlacements} from '../utils/allPlacements';
import {Controls} from '../utils/Controls';
import {useSize} from '../utils/useSize';

export function Placement() {
  const [rtl, setRtl] = useState(false);
  const [placement, setPlacement] = useState<PlacementType>('bottom');
  const data1 = useFloating({
    placement,
    middleware: [offset(10), shift(), flip()],
    whileElementsMounted: autoUpdate,
  });
  const data2 = useFloating({
    placement,
    middleware: [offset(10), shift(), flip()],
    whileElementsMounted: autoUpdate,
  });
  const [size, handleSizeChange] = useSize();

  return (
    <>
      <h1>Placement</h1>
      <p>
        The floating element should be correctly positioned when given each of
        the 12 placements.
      </p>
      <div className="container" style={{direction: rtl ? 'rtl' : 'ltr'}}>
        <div ref={data1.refs.setReference} className="reference">
          Reference
        </div>
        <div ref={data2.refs.setReference} className="reference">
          Reference
        </div>
        <div
          ref={data1.refs.setFloating}
          className="floating"
          style={{
            position: data1.strategy,
            top: data1.y ?? 0,
            left: data1.x ?? 0,
            width: size,
            height: size,
          }}
        >
          Floating
        </div>
        <div
          ref={data2.refs.setFloating}
          className="floating"
          style={{
            position: data2.strategy,
            top: data2.y ?? 0,
            left: data2.x ?? 0,
            width: size,
            height: size,
          }}
          data-floating-ui-collidable
        >
          Floating
        </div>
        <div
          style={{
            position: 'absolute',
            top: 250,
            left: 450,
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
            left: 650,
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
            left: 900,
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
