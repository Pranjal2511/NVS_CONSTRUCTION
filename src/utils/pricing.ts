export const estimatePrice = (area: number, rate: number) => Number.isFinite(area) && Number.isFinite(rate) && area > 0 && rate >= 0 ? Math.round(area * rate * 100) / 100 : 0;
export const escapeHtml = (value: string) => value.replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]!));
export const validPricingGroups = (input: unknown): boolean => Array.isArray(input) && input.length > 0 && input.every(group =>
  group && typeof group.title === 'string' && typeof group.startingRate === 'string' && Array.isArray(group.items) && group.items.length > 0 && group.items.every((item: { label?: unknown; service?: unknown; unit?: unknown; rate?: unknown }) =>
    item && typeof item.label === 'string' && typeof item.service === 'string' && typeof item.unit === 'string' && (item.rate === null || (typeof item.rate === 'number' && Number.isFinite(item.rate) && item.rate >= 0))));
