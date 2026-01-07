export function generateViewId(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 11);
  return `view-${timestamp}-${random}`;
}

export function generateUniqueViewIds(count: number): string[] {
  const ids: string[] = [];
  for (let i = 0; i < count; i++) {
    ids.push(generateViewId());
  }
  return ids;
}
