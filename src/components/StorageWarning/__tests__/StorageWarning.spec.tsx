import { render, screen, fireEvent, cleanup } from '@solidjs/testing-library';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { StorageWarning } from '../StorageWarning';
import type { StorageQuota } from '../../../domain/project/types';

// Mock the storageQuota service
vi.mock('../../../services/indexedDB/storageQuota', () => ({
  checkQuotaWarning: vi.fn(),
  QUOTA_WARNING_THRESHOLD: 80,
}));

import { checkQuotaWarning } from '../../../services/indexedDB/storageQuota';

const mockCheckQuotaWarning = checkQuotaWarning as ReturnType<typeof vi.fn>;

const createQuota = (percentUsed: number): StorageQuota => ({
  used: percentUsed * 1024 * 1024, // percentUsed MB
  available: 100 * 1024 * 1024, // 100 MB total
  percentUsed,
});

describe('StorageWarning', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  test('renders warning when quota exceeds threshold', async () => {
    const quota = createQuota(85);
    mockCheckQuotaWarning.mockResolvedValue({
      shouldWarn: true,
      quota,
    });

    render(() => <StorageWarning />);

    // Wait for the warning to appear
    const warning = await screen.findByRole('alert');
    expect(warning).toBeInTheDocument();
    expect(warning).toHaveTextContent(/storage.*85%/i);
  });

  test('does not render when quota is below threshold', async () => {
    const quota = createQuota(50);
    mockCheckQuotaWarning.mockResolvedValue({
      shouldWarn: false,
      quota,
    });

    render(() => <StorageWarning />);

    // Give time for the check to complete
    await new Promise((r) => setTimeout(r, 50));

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  test('shows usage statistics', async () => {
    const quota: StorageQuota = {
      used: 85 * 1024 * 1024, // 85 MB
      available: 100 * 1024 * 1024, // 100 MB
      percentUsed: 85,
    };
    mockCheckQuotaWarning.mockResolvedValue({
      shouldWarn: true,
      quota,
    });

    render(() => <StorageWarning />);

    const warning = await screen.findByRole('alert');
    // Should show used and available space
    expect(warning).toHaveTextContent(/85.*MB/i);
    expect(warning).toHaveTextContent(/100.*MB/i);
  });

  test('is dismissible', async () => {
    const quota = createQuota(85);
    mockCheckQuotaWarning.mockResolvedValue({
      shouldWarn: true,
      quota,
    });

    render(() => <StorageWarning />);

    const warning = await screen.findByRole('alert');
    expect(warning).toBeInTheDocument();

    // Find and click dismiss button
    const dismissButton = screen.getByRole('button', { name: /dismiss|close/i });
    fireEvent.click(dismissButton);

    // Warning should be hidden
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  test('calls onDismiss callback when dismissed', async () => {
    const quota = createQuota(85);
    mockCheckQuotaWarning.mockResolvedValue({
      shouldWarn: true,
      quota,
    });

    const onDismiss = vi.fn();
    render(() => <StorageWarning onDismiss={onDismiss} />);

    await screen.findByRole('alert');

    const dismissButton = screen.getByRole('button', { name: /dismiss|close/i });
    fireEvent.click(dismissButton);

    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  test('shows progress bar with correct percentage', async () => {
    const quota = createQuota(85);
    mockCheckQuotaWarning.mockResolvedValue({
      shouldWarn: true,
      quota,
    });

    render(() => <StorageWarning />);

    await screen.findByRole('alert');

    // Check for progress bar
    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toBeInTheDocument();
    expect(progressBar).toHaveAttribute('aria-valuenow', '85');
    expect(progressBar).toHaveAttribute('aria-valuemin', '0');
    expect(progressBar).toHaveAttribute('aria-valuemax', '100');
  });

  test('re-checks quota when recheckInterval triggers', async () => {
    vi.useFakeTimers();

    const quota = createQuota(85);
    mockCheckQuotaWarning.mockResolvedValue({
      shouldWarn: true,
      quota,
    });

    render(() => <StorageWarning recheckInterval={5000} />);

    // Initial check
    await vi.advanceTimersByTimeAsync(0);
    expect(mockCheckQuotaWarning).toHaveBeenCalledTimes(1);

    // Advance past the recheck interval
    await vi.advanceTimersByTimeAsync(5000);
    expect(mockCheckQuotaWarning).toHaveBeenCalledTimes(2);

    vi.useRealTimers();
  });

  test('handles large storage values with appropriate units', async () => {
    const quota: StorageQuota = {
      used: 1.5 * 1024 * 1024 * 1024, // 1.5 GB
      available: 2 * 1024 * 1024 * 1024, // 2 GB
      percentUsed: 75,
    };
    // Force warning even though below threshold for this test
    mockCheckQuotaWarning.mockResolvedValue({
      shouldWarn: true,
      quota,
    });

    render(() => <StorageWarning />);

    const warning = await screen.findByRole('alert');
    // Should format as GB
    expect(warning).toHaveTextContent(/1\.5.*GB/i);
    expect(warning).toHaveTextContent(/2.*GB/i);
  });

  test('cleans up interval on unmount', async () => {
    vi.useFakeTimers();
    const clearIntervalSpy = vi.spyOn(globalThis, 'clearInterval');

    const quota = createQuota(85);
    mockCheckQuotaWarning.mockResolvedValue({
      shouldWarn: true,
      quota,
    });

    const { unmount } = render(() => <StorageWarning recheckInterval={5000} />);

    await vi.advanceTimersByTimeAsync(0);
    unmount();

    expect(clearIntervalSpy).toHaveBeenCalled();

    clearIntervalSpy.mockRestore();
    vi.useRealTimers();
  });
});
