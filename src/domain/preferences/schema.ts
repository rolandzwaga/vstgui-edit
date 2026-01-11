/**
 * Preferences JSON Schema
 *
 * AJV schema for validating user preferences.
 */

import type { JSONSchemaType } from 'ajv';
import type { UserPreferences } from './types';

/**
 * JSON Schema for preferences validation.
 *
 * Only version is required - other fields are validated if present.
 * This allows partial preferences from old versions to be merged with defaults.
 */
export const PREFERENCES_SCHEMA: JSONSchemaType<UserPreferences> = {
  type: 'object',
  required: ['version'],
  additionalProperties: false,
  properties: {
    version: { type: 'number', const: 1 },

    grid: {
      type: 'object',
      nullable: true,
      additionalProperties: false,
      required: [],
      properties: {
        size: { type: 'number', enum: [5, 8, 10, 12, 16, 20], nullable: true },
        style: { type: 'string', enum: ['lines', 'dots', 'crosshairs'], nullable: true },
        visibleByDefault: { type: 'boolean', nullable: true },
      },
    },

    snap: {
      type: 'object',
      nullable: true,
      additionalProperties: false,
      required: [],
      properties: {
        enabledByDefault: { type: 'boolean', nullable: true },
        threshold: { type: 'number', minimum: 1, maximum: 20, nullable: true },
      },
    },

    smartGuides: {
      type: 'object',
      nullable: true,
      additionalProperties: false,
      required: [],
      properties: {
        enabledByDefault: { type: 'boolean', nullable: true },
      },
    },

    customGuides: {
      type: 'object',
      nullable: true,
      additionalProperties: false,
      required: [],
      properties: {
        snapEnabledByDefault: { type: 'boolean', nullable: true },
      },
    },

    theme: {
      type: 'object',
      nullable: true,
      additionalProperties: false,
      required: [],
      properties: {
        mode: { type: 'string', enum: ['light', 'dark', 'system'], nullable: true },
      },
    },

    ui: {
      type: 'object',
      nullable: true,
      additionalProperties: false,
      required: [],
      properties: {
        alignmentToolbar: {
          type: 'object',
          nullable: true,
          additionalProperties: false,
          required: [],
          properties: {
            isDocked: { type: 'boolean', nullable: true },
            floatingPosition: {
              type: 'object',
              nullable: true,
              additionalProperties: false,
              required: ['x', 'y'],
              properties: {
                x: { type: 'number' },
                y: { type: 'number' },
              },
            },
          },
        },
      },
    },

    save: {
      type: 'object',
      nullable: true,
      additionalProperties: false,
      required: [],
      properties: {
        format: {
          type: ['string', 'null'],
          enum: ['json', 'xml', null],
        },
      },
    },
  },
} as unknown as JSONSchemaType<UserPreferences>;
