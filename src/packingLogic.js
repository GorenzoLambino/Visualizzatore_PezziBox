export const PREDEFINED_BOXES = [
  { name: 'BOX Logimat A2', dimensions: [10, 8, 17] },
  { name: 'BOX Logimat A3', dimensions: [21, 8, 17] },
  { name: 'BOX Logimat B4', dimensions: [32, 18, 17] },
  { name: 'BOX Logimat B5', dimensions: [43, 18, 17] }
];

export const ARRIVI_BOXES = [
  { name: 'Cassa Grigia', dimensions: [35, 19, 55] }
];

function getOrientations(itemDims) {
  const [ix, iy, iz] = itemDims;
  return [
    [ix, iy, iz],
    [ix, iz, iy],
    [iy, ix, iz],
    [iy, iz, ix],
    [iz, ix, iy],
    [iz, iy, ix]
  ];
}

// Algoritmo 1: Blocco Singolo Uniforme (Nessun rimescolamento)
function packUniform(W, H, D, startX, startY, startZ, itemDims) {
  const orientations = getOrientations(itemDims);
  let bestCount = -1;
  let bestOrientation = null;
  let bestCounts = [0, 0, 0];

  for (const rot of orientations) {
    const [dx, dy, dz] = rot;
    const nx = Math.floor(W / dx);
    const ny = Math.floor(H / dy);
    const nz = Math.floor(D / dz);
    
    const qty = nx * ny * nz;
    
    if (qty > bestCount) {
      bestCount = qty;
      bestOrientation = rot;
      bestCounts = [nx, ny, nz];
    }
  }

  const items = [];
  if (bestCount > 0) {
    const [dx, dy, dz] = bestOrientation;
    const [nx, ny, nz] = bestCounts;

    for (let x = 0; x < nx; x++) {
      for (let y = 0; y < ny; y++) {
        for (let z = 0; z < nz; z++) {
          items.push({
            position: [
              startX + x * dx + dx / 2,
              startY + y * dy + dy / 2,
              startZ + z * dz + dz / 2
            ],
            size: [dx, dy, dz]
          });
        }
      }
    }
  }

  return { items, count: bestCount, orientation: bestOrientation };
}

// Algoritmo 2: Bin Packing Misto Ricorsivo (Taglio a Ghigliottina)
function packSpaceMixed(W, H, D, startX, startY, startZ, itemDims, depth = 0) {
  const minDim = Math.min(...itemDims);
  if (W < minDim || H < minDim || D < minDim || depth > 5) {
    return { items: [], count: 0 };
  }

  const orientations = getOrientations(itemDims);
  let bestCount = 0;
  let bestItems = [];

  for (const rot of orientations) {
    const [dx, dy, dz] = rot;
    const nx = Math.floor(W / dx);
    const ny = Math.floor(H / dy);
    const nz = Math.floor(D / dz);

    if (nx === 0 || ny === 0 || nz === 0) continue;

    const count = nx * ny * nz;
    const Pw = nx * dx;
    const Ph = ny * dy;
    const Pd = nz * dz;

    const currentItems = [];
    for (let x = 0; x < nx; x++) {
      for (let y = 0; y < ny; y++) {
        for (let z = 0; z < nz; z++) {
          currentItems.push({
            position: [
              startX + x * dx + dx / 2,
              startY + y * dy + dy / 2,
              startZ + z * dz + dz / 2
            ],
            size: [dx, dy, dz]
          });
        }
      }
    }

    // Guillotine Split: Right, Top, Front
    const rightRes = packSpaceMixed(W - Pw, H, D, startX + Pw, startY, startZ, itemDims, depth + 1);
    const topRes = packSpaceMixed(Pw, H - Ph, D, startX, startY + Ph, startZ, itemDims, depth + 1);
    const frontRes = packSpaceMixed(Pw, Ph, D - Pd, startX, startY, startZ + Pd, itemDims, depth + 1);

    const totalCount = count + rightRes.count + topRes.count + frontRes.count;

    if (totalCount > bestCount) {
      bestCount = totalCount;
      bestItems = [...currentItems, ...rightRes.items, ...topRes.items, ...frontRes.items];
    }
  }

  return { items: bestItems, count: bestCount };
}

export function calculatePacking(boxDims, itemDims, isMixed = false) {
  const [bx, by, bz] = boxDims;
  const [ix, iy, iz] = itemDims;

  if (!bx || !by || !bz || !ix || !iy || !iz) {
    return {
      maxQuantity: 0,
      efficiency: 0,
      optimalOrientation: ['N/A'],
      items: []
    };
  }

  const startX = -bx / 2;
  const startY = -by / 2;
  const startZ = -bz / 2;

  let result;
  let orientationLabel;

  if (isMixed) {
    result = packSpaceMixed(bx, by, bz, startX, startY, startZ, itemDims, 0);
    orientationLabel = ['Misto (Multiplo)'];
  } else {
    result = packUniform(bx, by, bz, startX, startY, startZ, itemDims);
    orientationLabel = result.count > 0 ? result.orientation : ['N/A'];
  }

  const volumeBox = bx * by * bz;
  const volumeItem = ix * iy * iz;
  const efficiency = volumeBox > 0 ? ((result.count * volumeItem) / volumeBox) * 100 : 0;

  return {
    maxQuantity: result.count,
    efficiency: efficiency.toFixed(1),
    optimalOrientation: orientationLabel,
    items: result.items
  };
}
