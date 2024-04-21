export interface Coordinate {
  latitude: number;
  longitude: number;
}

export function findNearest(location: Coordinate, locations: Coordinate[]) {
  if (locations.length === 0) return null;

  let nearestItem: Coordinate = locations[0];
  let minDistance: number = calculateDistance(location, nearestItem);
  let nearestIndex: number = -1;

  for (const [index, item] of locations.entries()) {
    const distance = calculateDistance(location, item);
    if (distance < minDistance) {
      minDistance = distance;
      nearestItem = item;
      nearestIndex = index;
    }
  }

  console.log({ nearestItem, nearestIndex });
  return { nearestItem, index: nearestIndex };
}

function calculateDistance(coord1: Coordinate, coord2: Coordinate): number {
  const earthRadius = 6371; // Radius of the Earth in kilometers
  const lat1 = degreesToRadians(coord1.latitude);
  const lon1 = degreesToRadians(coord1.longitude);
  const lat2 = degreesToRadians(coord2.latitude);
  const lon2 = degreesToRadians(coord2.longitude);

  const dLat = lat2 - lat1;
  const dLon = lon2 - lon1;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  const distance = earthRadius * c;
  return distance;
}

function degreesToRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}
