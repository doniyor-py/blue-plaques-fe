import { decodePolyline } from './polyline';

describe('decodePolyline', () => {
  // Google's own example from the polyline format documentation (5 decimal places)
  const googleExample = '_p~iF~ps|U_ulLnnqC_mqNvxq`@';

  it('decodes Google\'s documented example', () => {
    const points = decodePolyline(googleExample, 5);
    expect(points.length).toBe(3);
    expect(points[0][0]).toBeCloseTo(38.5, 5);
    expect(points[0][1]).toBeCloseTo(-120.2, 5);
    expect(points[1][0]).toBeCloseTo(40.7, 5);
    expect(points[1][1]).toBeCloseTo(-120.95, 5);
    expect(points[2][0]).toBeCloseTo(43.252, 5);
    expect(points[2][1]).toBeCloseTo(-126.453, 5);
  });

  it('uses 6 decimal places by default, like Stadia routes', () => {
    const points = decodePolyline(googleExample);
    expect(points[0][0]).toBeCloseTo(3.85, 6);
    expect(points[0][1]).toBeCloseTo(-12.02, 6);
  });

  it('returns no points for an empty route', () => {
    expect(decodePolyline('')).toEqual([]);
  });
});
