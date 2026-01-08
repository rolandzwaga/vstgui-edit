export function truncateGradientName(name: string, maxLength: number = 24): string {
  if (name.length <= maxLength) {
    return name;
  }

  if (maxLength < 3) {
    return '.'.repeat(maxLength);
  }

  return name.slice(0, maxLength - 3) + '...';
}

export function formatStopCount(count: number): string {
  return count === 1 ? '1 stop' : `${count} stops`;
}
