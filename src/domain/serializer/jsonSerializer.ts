import type { VSTGUIUIDescription } from '../../types/uidesc';
import type { JsonSerializeOptions } from './types';

/**
 * Serializes a VSTGUIUIDescription document to JSON string.
 *
 * @param doc - The document to serialize
 * @param options - Serialization options
 * @returns JSON string representation of the document
 */
export function serializeToJson(
  doc: VSTGUIUIDescription,
  options: JsonSerializeOptions = {}
): string {
  const { pretty = true, indent = 2 } = options;

  if (pretty) {
    return JSON.stringify(doc, null, indent);
  }

  return JSON.stringify(doc);
}
