/**
 * Document Factory API contract for Create New uidesc feature
 *
 * NOTE: This is a contract/design file, not actual source code.
 * Source will be created in src/domain/createNew/documentFactory.ts
 */

import type { VSTGUIUIDescription } from '../../../src/types/uidesc';
import type { NewDocumentConfig } from './types';

/**
 * Creates a new uidesc document structure from configuration.
 *
 * The created document has:
 * - version: "1"
 * - A single template named "view"
 * - Template with specified container class and dimensions
 * - Origin "0, 0"
 * - Background color "~ BlackCColor"
 *
 * @param config - Document configuration
 * @returns Valid VSTGUIUIDescription document
 *
 * @example
 * createDocument({ width: 800, height: 600, containerClass: 'CViewContainer' })
 * // => {
 * //   'vstgui-ui-description': {
 * //     version: '1',
 * //     templates: {
 * //       view: {
 * //         attributes: {
 * //           class: 'CViewContainer',
 * //           origin: '0, 0',
 * //           size: '800, 600',
 * //           'background-color': '~ BlackCColor'
 * //         }
 * //       }
 * //     }
 * //   }
 * // }
 */
export function createDocument(config: NewDocumentConfig): VSTGUIUIDescription;

/**
 * Template name used for new documents.
 */
export const DEFAULT_TEMPLATE_NAME = 'view';

/**
 * Default origin for new templates.
 */
export const DEFAULT_ORIGIN = '0, 0';

/**
 * Default background color for new templates.
 */
export const DEFAULT_BACKGROUND_COLOR = '~ BlackCColor';
