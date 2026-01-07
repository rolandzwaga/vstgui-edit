import { beforeEach, describe, expect, it } from 'vitest';
import { testInRoot } from '../../__tests__/helpers/solidjs';
import type { SerializedView } from '../../types/views';
import {
	clearClipboard,
	clipboardStore,
	copyToClipboard,
	getClipboardContent,
	incrementPasteCount,
	resetClipboard,
} from '../clipboardStore';

describe('clipboardStore', () => {
	beforeEach(() => {
		testInRoot(() => {
			resetClipboard();
		});
	});

	describe('initial state', () => {
		it('should have null data', () => {
			testInRoot(() => {
				expect(clipboardStore.data).toBeNull();
			});
		});

		it('should have hasContent as false', () => {
			testInRoot(() => {
				expect(clipboardStore.hasContent).toBe(false);
			});
		});
	});

	describe('copyToClipboard', () => {
		it('should store views with metadata', () => {
			testInRoot(() => {
				const views: SerializedView[] = [
					{
						originalId: 'view-1',
						class: 'CTextButton',
						attributes: { origin: '10, 20', size: '100, 30' },
					},
				];
				const origins = { 'view-1': { x: 10, y: 20 } };

				copyToClipboard(views, origins);

				expect(clipboardStore.hasContent).toBe(true);
				expect(clipboardStore.data?.views).toEqual(views);
				expect(clipboardStore.data?.sourceOrigins).toEqual(origins);
				expect(clipboardStore.data?.pasteCount).toBe(0);
			});
		});

		it('should set copyTimestamp to current time', () => {
			testInRoot(() => {
				const before = Date.now();
				const views: SerializedView[] = [
					{
						originalId: 'view-1',
						class: 'CTextButton',
						attributes: {},
					},
				];
				copyToClipboard(views, {});
				const after = Date.now();

				const timestamp = clipboardStore.data?.copyTimestamp ?? 0;
				expect(timestamp).toBeGreaterThanOrEqual(before);
				expect(timestamp).toBeLessThanOrEqual(after);
			});
		});

		it('should replace previous clipboard content', () => {
			testInRoot(() => {
				const views1: SerializedView[] = [
					{ originalId: 'view-1', class: 'CKnob', attributes: {} },
				];
				const views2: SerializedView[] = [
					{ originalId: 'view-2', class: 'CSlider', attributes: {} },
				];

				copyToClipboard(views1, {});
				copyToClipboard(views2, {});

				expect(clipboardStore.data?.views).toEqual(views2);
			});
		});
	});

	describe('clearClipboard', () => {
		it('should clear clipboard content', () => {
			testInRoot(() => {
				const views: SerializedView[] = [
					{ originalId: 'view-1', class: 'CTextButton', attributes: {} },
				];
				copyToClipboard(views, {});

				clearClipboard();

				expect(clipboardStore.data).toBeNull();
				expect(clipboardStore.hasContent).toBe(false);
			});
		});

		it('should do nothing when already empty', () => {
			testInRoot(() => {
				clearClipboard();
				expect(clipboardStore.data).toBeNull();
			});
		});
	});

	describe('incrementPasteCount', () => {
		it('should increment paste count', () => {
			testInRoot(() => {
				const views: SerializedView[] = [
					{ originalId: 'view-1', class: 'CTextButton', attributes: {} },
				];
				copyToClipboard(views, {});

				incrementPasteCount();
				expect(clipboardStore.data?.pasteCount).toBe(1);

				incrementPasteCount();
				expect(clipboardStore.data?.pasteCount).toBe(2);
			});
		});

		it('should do nothing when clipboard is empty', () => {
			testInRoot(() => {
				incrementPasteCount();
				expect(clipboardStore.data).toBeNull();
			});
		});
	});

	describe('getClipboardContent', () => {
		it('should return null when empty', () => {
			testInRoot(() => {
				expect(getClipboardContent()).toBeNull();
			});
		});

		it('should return clipboard data when content exists', () => {
			testInRoot(() => {
				const views: SerializedView[] = [
					{ originalId: 'view-1', class: 'CTextButton', attributes: {} },
				];
				copyToClipboard(views, { 'view-1': { x: 0, y: 0 } });

				const content = getClipboardContent();
				expect(content).not.toBeNull();
				expect(content?.views).toEqual(views);
			});
		});
	});

	describe('multiple views', () => {
		it('should handle copying multiple views', () => {
			testInRoot(() => {
				const views: SerializedView[] = [
					{ originalId: 'view-1', class: 'CKnob', attributes: {} },
					{ originalId: 'view-2', class: 'CSlider', attributes: {} },
					{ originalId: 'view-3', class: 'CTextLabel', attributes: {} },
				];
				const origins = {
					'view-1': { x: 10, y: 20 },
					'view-2': { x: 50, y: 60 },
					'view-3': { x: 100, y: 100 },
				};

				copyToClipboard(views, origins);

				expect(clipboardStore.data?.views.length).toBe(3);
				expect(clipboardStore.data?.sourceOrigins['view-2']).toEqual({
					x: 50,
					y: 60,
				});
			});
		});
	});

	describe('views with children', () => {
		it('should handle serialized views with children', () => {
			testInRoot(() => {
				const views: SerializedView[] = [
					{
						originalId: 'container-1',
						class: 'CViewContainer',
						attributes: { origin: '0, 0', size: '200, 200' },
						children: [
							{
								originalId: 'child-1',
								class: 'CTextButton',
								attributes: { origin: '10, 10', size: '100, 30' },
							},
						],
					},
				];

				copyToClipboard(views, { 'container-1': { x: 0, y: 0 } });

				expect(clipboardStore.data?.views[0].children?.length).toBe(1);
				expect(clipboardStore.data?.views[0].children?.[0].class).toBe(
					'CTextButton',
				);
			});
		});
	});
});
