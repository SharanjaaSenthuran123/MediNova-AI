const TILE_SIZE = 256;

export function project(lat: number, lng: number, zoom: number) {
  const sin = Math.sin((lat * Math.PI) / 180);
  const y = Math.log((1 + sin) / (1 - sin)) / 2;
  const scale = TILE_SIZE * 2 ** zoom;
  return {
    x: ((lng + 180) / 360) * scale,
    y: (0.5 - y / (2 * Math.PI)) * scale,
  };
}

export function unproject(x: number, y: number, zoom: number) {
  const scale = TILE_SIZE * 2 ** zoom;
  const lng = (x / scale) * 360 - 180;
  const n = Math.PI - (2 * Math.PI * y) / scale;
  const lat = (180 / Math.PI) * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n)));
  return { lat, lng };
}

export function latLngToPoint(
  lat: number,
  lng: number,
  centerLat: number,
  centerLng: number,
  zoom: number,
  width: number,
  height: number
) {
  const center = project(centerLat, centerLng, zoom);
  const point = project(lat, lng, zoom);
  return {
    x: width / 2 + (point.x - center.x),
    y: height / 2 + (point.y - center.y),
  };
}

export function pointToLatLng(
  x: number,
  y: number,
  centerLat: number,
  centerLng: number,
  zoom: number,
  width: number,
  height: number
) {
  const center = project(centerLat, centerLng, zoom);
  const worldX = center.x + (x - width / 2);
  const worldY = center.y + (y - height / 2);
  return unproject(worldX, worldY, zoom);
}

export function tileUrl(x: number, y: number, zoom: number) {
  return `https://tile.openstreetmap.org/${zoom}/${x}/${y}.png`;
}

export function visibleTiles(
  centerLat: number,
  centerLng: number,
  zoom: number,
  width: number,
  height: number
) {
  const center = project(centerLat, centerLng, zoom);
  const tiles: { x: number; y: number; left: number; top: number }[] = [];
  const minTileX = Math.floor((center.x - width / 2) / TILE_SIZE);
  const maxTileX = Math.floor((center.x + width / 2) / TILE_SIZE);
  const minTileY = Math.floor((center.y - height / 2) / TILE_SIZE);
  const maxTileY = Math.floor((center.y + height / 2) / TILE_SIZE);
  const maxIndex = 2 ** zoom;

  for (let tx = minTileX; tx <= maxTileX; tx += 1) {
    for (let ty = minTileY; ty <= maxTileY; ty += 1) {
      if (tx < 0 || ty < 0 || tx >= maxIndex || ty >= maxIndex) continue;
      tiles.push({
        x: tx,
        y: ty,
        left: tx * TILE_SIZE - center.x + width / 2,
        top: ty * TILE_SIZE - center.y + height / 2,
      });
    }
  }

  return tiles;
}
