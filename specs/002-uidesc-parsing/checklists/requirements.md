# Requirements Checklist: Uidesc Parsing and Validation

**Feature Branch**: `002-uidesc-parsing`
**Generated**: 2026-01-05
**Updated**: 2026-01-05 (implementation complete)

## Functional Requirements

### Parsing Trigger
- [x] **FR-000**: System MUST automatically trigger parsing immediately after successful file upload (no user action required)

### Format Detection
- [x] **FR-001**: System MUST auto-detect file format by examining content (JSON starts with `{` or `[`, XML starts with `<` or `<?xml`)
- [x] **FR-002**: System MUST handle leading whitespace before format detection characters
- [x] **FR-003**: System MUST report a clear error if format cannot be determined

### JSON Parsing & Validation
- [x] **FR-004**: System MUST use AJV library for JSON Schema validation
- [x] **FR-005**: System MUST validate JSON against `vstgui-uidesc.schema.json`
- [x] **FR-006**: System MUST collect all validation errors (not fail on first error)
- [x] **FR-007**: Validation errors MUST include JSON path to invalid property
- [x] **FR-008**: System MUST parse valid JSON into a typed document model
- [x] **FR-008a**: System MUST reject files with unknown/extra properties (strict mode)

### XML Parsing & Conversion
- [x] **FR-009**: System MUST parse XML using browser-native DOMParser
- [x] **FR-010**: System MUST convert XML tree to JSON-equivalent structure before validation
- [x] **FR-011**: System MUST validate converted JSON using AJV (same as native JSON files)
- [x] **FR-012**: Validation errors MUST map JSON paths back to original XML element/attribute locations (mapping available for all converted elements; unavailable only for schema-level constraints)

### Document Model
- [x] **FR-013**: System MUST produce identical document model structure from equivalent JSON and XML inputs
- [x] **FR-014**: Document model MUST preserve all uidesc data: views, colors, fonts, bitmaps, gradients, control-tags
- [x] **FR-015**: TypeScript types for UidescDocument MUST be generated from JSON schema (json-schema-to-typescript)

## Success Criteria

- [x] **SC-001**: Valid JSON uidesc files pass schema validation with zero false negatives
- [x] **SC-002**: Valid XML uidesc files convert to correct JSON structure with 100% element mapping accuracy
- [x] **SC-003**: All validation errors include actionable location information (path or element)
- [x] **SC-004**: Format detection correctly identifies JSON vs XML in 100% of valid uidesc files
- [x] **SC-005**: Parsing of typical uidesc files (< 1MB) completes in under 500ms
- [x] **SC-006**: Test coverage for parsing module reaches 90%+ including edge cases

## Acceptance Scenarios

### User Story 1 - Parse and Validate JSON Uidesc File
- [x] Valid JSON uidesc file is parsed with document store containing views, colors, fonts, bitmaps
- [x] JSON file with schema violations reports errors with paths to invalid properties
- [x] Valid JSON file transitions uploadState to 'success' and populates documentModel

### User Story 2 - Parse and Validate XML Uidesc File
- [x] Valid XML uidesc file produces same structure as equivalent JSON file
- [x] XML file with schema violations (after conversion) reports errors with mapped element/attribute locations
- [x] All VSTGUI elements (views, colors, fonts, bitmaps) correctly map to JSON structure

### User Story 3 - Handle Invalid or Malformed Files
- [x] Malformed JSON shows parse failure error with line/column if available
- [x] Malformed XML shows parse failure error with location information
- [x] Unrecognized format shows clear error that format could not be determined

## Edge Cases

- [x] Files starting with whitespace before JSON/XML content are handled correctly
- [x] XML files with BOM (Byte Order Mark) are stripped before parsing
- [x] Large uidesc files (>1MB) are parsed (may exceed 500ms target)
- [x] XML namespaces are ignored; namespace prefixes stripped during conversion
- [x] JSON files with comments are rejected as invalid JSON
- [x] Unknown/extra properties in JSON are rejected (strict validation mode)
