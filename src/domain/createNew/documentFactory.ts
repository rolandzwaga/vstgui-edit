/**
 * Document factory for Create New uidesc feature
 */

import type { NewDocumentConfig } from '../../types/createNew';
import type { VSTGUIUIDescription } from '../../types/uidesc';

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
 */
export function createDocument(config: NewDocumentConfig): VSTGUIUIDescription {
  const { width, height, containerClass } = config;

  return {
    'vstgui-ui-description': {
      version: '1',
      templates: {
        [DEFAULT_TEMPLATE_NAME]: {
          attributes: {
            class: containerClass,
            origin: DEFAULT_ORIGIN,
            size: `${width}, ${height}`,
            'background-color': DEFAULT_BACKGROUND_COLOR,
          },
        },
      },
    },
  };
}
