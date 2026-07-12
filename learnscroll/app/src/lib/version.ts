const SEGMENT_PATTERN = /^\d+$/;

export const compareVersions = (current: string, next: string): number => {
  const currentParts = current.split('.');
  const nextParts = next.split('.');
  const maxLength = Math.max(currentParts.length, nextParts.length);

  for (let index = 0; index < maxLength; index += 1) {
    const left = currentParts[index] ?? '0';
    const right = nextParts[index] ?? '0';

    if (!SEGMENT_PATTERN.test(left) || !SEGMENT_PATTERN.test(right)) {
      return current.localeCompare(next);
    }

    const leftValue = Number(left);
    const rightValue = Number(right);

    if (leftValue > rightValue) {
      return 1;
    }

    if (leftValue < rightValue) {
      return -1;
    }
  }

  return 0;
};

export const isVersionNewer = (current: string, next: string): boolean => {
  return compareVersions(current, next) < 0;
};
