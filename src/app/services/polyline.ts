/**
 * Decodes an encoded polyline (Google's format) into [lat, lng] points.
 * Valhalla / Stadia use precision 6 (6 decimal places).
 */
export function decodePolyline(encoded: string, precision: number = 6): [number, number][] {
  const factor = Math.pow(10, precision);
  const points: [number, number][] = [];
  let index = 0;
  let lat = 0;
  let lng = 0;

  while (index < encoded.length) {
    for (const axis of ['lat', 'lng']) {
      let result = 0;
      let shift = 0;
      let byte: number;
      do {
        byte = encoded.charCodeAt(index++) - 63;
        result |= (byte & 0x1f) << shift;
        shift += 5;
      } while (byte >= 0x20);
      const change = (result & 1) ? ~(result >> 1) : (result >> 1);
      if (axis === 'lat') { lat += change; } else { lng += change; }
    }
    points.push([lat / factor, lng / factor]);
  }
  return points;
}
