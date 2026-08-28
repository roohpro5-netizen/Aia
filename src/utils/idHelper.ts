import { MediaItem } from '../types';

/**
 * Generates or derives a deterministic 3 to 4 digit numeric code for any item.
 * If numericCode is already provided, returns it; otherwise computes a clean 3-4 digit string (e.g. "101", "204", "849").
 */
export function getNumericCode(item: MediaItem): string {
  if (item.numericCode) {
    return item.numericCode;
  }
  
  // Extract number from existing ID pattern like 'w1-item-3' -> '103'
  const match = item.id.match(/w(\d+)-item-(\d+)/i);
  if (match) {
    const win = match[1];
    const num = parseInt(match[2], 10);
    // Format as 101, 102, 201, 305 etc.
    const padded = num < 10 ? `0${num}` : `${num}`;
    return `${win}${padded}`;
  }

  // Generic hash to 3-4 digits (100 - 9999)
  let hash = 0;
  for (let i = 0; i < item.id.length; i++) {
    hash = (hash << 5) - hash + item.id.charCodeAt(i);
    hash |= 0;
  }
  const positive = Math.abs(hash);
  const code = (positive % 9000) + 1000; // 4-digit code between 1000 and 9999
  return `${code}`;
}

/**
 * Returns the full shareable and search-friendly URL for any window or item
 */
export function getItemFullUrl(item: MediaItem): string {
  const code = getNumericCode(item);
  return `${window.location.origin}${window.location.pathname}#/item/${code}`;
}

export function getWindowFullUrl(windowId: number): string {
  return `${window.location.origin}${window.location.pathname}#/window/${windowId}`;
}
