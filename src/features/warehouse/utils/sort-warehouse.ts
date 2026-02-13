import type { WarehouseItem } from "@/types/api";

const ITEM_ORDER: Record<string, number> = {
  WEFT: 0,
  CLOSURE: 1,
  FRONTAL: 2,
};

const WEFT_QUALITY_ORDER: Record<string, number> = {
  SDD: 0,
  DD: 1,
  VIP: 2,
  SINGLEDONOR: 3,
};

function getClosureQualityOrder(quality: string): number {
  const q = quality.toUpperCase();
  const isHD = q.includes("HD");
  const isSingleDonor = q.includes("SINGLEDONOR");

  let categoryOrder = 0;
  if (!isHD && !isSingleDonor) categoryOrder = 0;
  else if (isHD && !isSingleDonor) categoryOrder = 1000;
  else if (isSingleDonor && !isHD) categoryOrder = 2000;
  else categoryOrder = 3000;

  const match = q.match(/(\d+)X(\d+)/);
  if (match) {
    const product = parseInt(match[1]) * parseInt(match[2]);
    return categoryOrder + product;
  }
  return categoryOrder;
}

function getQualityOrder(quality: string, item: string): number {
  if (item === "WEFT") {
    return WEFT_QUALITY_ORDER[quality] ?? 99;
  }
  return getClosureQualityOrder(quality);
}

function groupBy<T>(items: T[], key: (item: T) => string): Map<string, T[]> {
  const map = new Map<string, T[]>();
  for (const item of items) {
    const k = key(item);
    if (!map.has(k)) map.set(k, []);
    map.get(k)!.push(item);
  }
  return map;
}

export function sortWarehouseItems(items: WarehouseItem[]): WarehouseItem[] {
  if (!items.length) return items;

  const colorGroups = groupBy(items, (i) => i.color);

  const sortedColorEntries = [...colorGroups.entries()].sort(
    (a, b) => b[1].length - a[1].length
  );

  const result: WarehouseItem[] = [];

  for (const [, colorItems] of sortedColorEntries) {
    const styleGroups = groupBy(colorItems, (i) => i.style);

    const sortedStyleEntries = [...styleGroups.entries()].sort(
      (a, b) => b[1].length - a[1].length
    );

    for (const [, styleItems] of sortedStyleEntries) {
      const sorted = [...styleItems].sort((a, b) => {
        const itemDiff =
          (ITEM_ORDER[a.item] ?? 99) - (ITEM_ORDER[b.item] ?? 99);
        if (itemDiff !== 0) return itemDiff;

        const qualityDiff =
          getQualityOrder(a.quality, a.item) -
          getQualityOrder(b.quality, b.item);
        if (qualityDiff !== 0) return qualityDiff;

        return a.inches - b.inches;
      });

      result.push(...sorted);
    }
  }

  return result;
}

export function getWarehouseDisplayName(item: WarehouseItem): string {
  return `${item.item} ${item.inches}" - ${item.quality} ${item.style} (${item.color})`;
}
