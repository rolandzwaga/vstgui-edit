# Feature Specification: Uidesc Parsing and Validation

**Feature Branch**: `002-uidesc-parsing`
**Created**: 2026-01-05
**Status**: Draft
**Input**: User description: "Parse the content uploaded by 001-uidesc-upload using the uidesc schema. The format should be auto detected. JSON is validated against the JSON schema, XML is validated against the XSD. Use AJV to perform the JSON schema validation. If the format is XML, convert the xml tree into the same format as the json file."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Parse and Validate JSON Uidesc File (Priority: P1)

As a plugin developer, I want to upload a JSON-format uidesc file and have it automatically detected as JSON, validated against the JSON schema, and parsed into a structured document model so I can view and edit its contents.

**Why this priority**: JSON is the simpler format to implement and will establish the core parsing architecture. It provides immediate value by enabling schema validation.

**Independent Test**: Can be fully tested by uploading a valid JSON uidesc file and verifying the parsed document model contains all expected views, colors, fonts, and bitmaps.

**Acceptance Scenarios**:

1. **Given** a valid JSON uidesc file is uploaded, **When** parsing completes, **Then** the document store contains the parsed structure with views, colors, fonts, and bitmaps accessible.
2. **Given** a JSON file with schema violations, **When** parsing is attempted, **Then** specific validation errors are reported with paths to invalid properties.
3. **Given** a JSON file with valid structure, **When** parsing completes, **Then** the uploadState transitions to 'success' and documentModel is populated.

---

### User Story 2 - Parse and Validate XML Uidesc File (Priority: P1)

As a plugin developer, I want to upload an XML-format uidesc file and have it automatically detected as XML, converted to the internal JSON structure, validated using the same JSON Schema (via AJV), and parsed into the same document model as JSON files.

**Why this priority**: XML is the original VSTGUI format and many existing projects use it. Supporting both formats is essential for broad compatibility.

**Independent Test**: Can be fully tested by uploading a valid XML uidesc file and verifying the parsed document model matches what would be produced from an equivalent JSON file.

**Acceptance Scenarios**:

1. **Given** a valid XML uidesc file is uploaded, **When** parsing completes, **Then** the document store contains the same structure as an equivalent JSON file.
2. **Given** an XML file with schema violations (detected after conversion to JSON), **When** parsing is attempted, **Then** specific validation errors are reported with mapped element/attribute locations.
3. **Given** an XML file with VSTGUI-specific elements (views, colors, fonts, bitmaps), **When** conversion completes, **Then** all elements are correctly mapped to the JSON structure.

---

### User Story 3 - Handle Invalid or Malformed Files (Priority: P2)

As a plugin developer, when I upload a malformed or invalid uidesc file, I want to see clear error messages that help me understand what went wrong and where the problem is located.

**Why this priority**: Error handling improves user experience but is secondary to core parsing functionality.

**Independent Test**: Can be fully tested by uploading various invalid files (malformed JSON/XML, schema violations) and verifying appropriate error messages are displayed.

**Acceptance Scenarios**:

1. **Given** a file with malformed JSON syntax, **When** parsing is attempted, **Then** an error indicates the JSON parse failure with line/column if available.
2. **Given** a file with malformed XML syntax, **When** parsing is attempted, **Then** an error indicates the XML parse failure with location information.
3. **Given** a file that is neither JSON nor XML, **When** format detection runs, **Then** an error indicates the format could not be determined.

---

### Edge Cases

- What happens when the file starts with whitespace before JSON/XML content? → Handled (FR-002)
- How does system handle XML files with BOM (Byte Order Mark)? → Strip BOM before parsing
- What happens with extremely large uidesc files (>1MB)? → Performance may exceed 500ms target; no hard limit
- How are XML namespaces handled? → Ignored; namespace prefixes stripped during conversion
- What happens with JSON files containing comments (non-standard)? → Rejected as invalid JSON
- Unknown/extra properties in JSON are rejected (strict validation mode)

## Requirements *(mandatory)*

### Functional Requirements

#### Parsing Trigger
- **FR-000**: System MUST automatically trigger parsing immediately after successful file upload (no user action required)

#### Format Detection
- **FR-001**: System MUST auto-detect file format by examining content (JSON starts with `{` or `[`, XML starts with `<` or `<?xml`)
- **FR-002**: System MUST handle leading whitespace before format detection characters
- **FR-003**: System MUST report a clear error if format cannot be determined

#### JSON Parsing & Validation
- **FR-004**: System MUST use AJV library for JSON Schema validation
- **FR-005**: System MUST validate JSON against `vstgui-uidesc.schema.json`
- **FR-006**: System MUST collect all validation errors (not fail on first error)
- **FR-007**: Validation errors MUST include JSON path to invalid property
- **FR-008**: System MUST parse valid JSON into a typed document model
- **FR-008a**: System MUST reject files with unknown/extra properties (strict mode)

#### XML Parsing & Conversion
- **FR-009**: System MUST parse XML using browser-native DOMParser
- **FR-010**: System MUST convert XML tree to JSON-equivalent structure before validation
- **FR-011**: System MUST validate converted JSON using AJV (same as native JSON files)
- **FR-012**: Validation errors MUST map JSON paths back to original XML element/attribute locations (mapping available for all converted elements; unavailable only for schema-level constraints like missing required fields)

#### Document Model
- **FR-013**: System MUST produce identical document model structure from equivalent JSON and XML inputs
- **FR-014**: Document model MUST preserve all uidesc data: views, colors, fonts, bitmaps, gradients, control-tags
- **FR-015**: TypeScript types for UidescDocument MUST be generated from JSON schema (json-schema-to-typescript)

### Key Entities

- **UidescDocument**: Root document containing all uidesc data (views, colors, fonts, bitmaps, gradients, control-tags)
- **ParseResult**: Discriminated union representing either successful parse (with document) or failure (with errors)
- **ValidationError**: Contains error type, message, and location (JSON path or XML element path)
- **FormatType**: Enum of 'json' | 'xml' | 'unknown' for detected format

## Clarifications

### Session 2026-01-05

- Q: How should XML files be validated given browser DOMParser doesn't support XSD? → A: Convert XML to JSON first, then validate with AJV (same as JSON path)
- Q: How should unknown/extra properties be handled in JSON validation? → A: Strict - reject files with unknown properties (AJV additionalProperties: false)
- Q: How should TypeScript types for the document model be defined? → A: Generate from JSON schema at build time (json-schema-to-typescript, already configured)
- Q: When should parsing/validation trigger after file upload? → A: Immediately after upload success (automatic, no user action needed)
- Q: How should XML namespaces be handled? → A: Ignore namespaces - VSTGUI uidesc files don't use them; strip namespace prefixes during conversion
- Q: How should JSON files with comments be handled? → A: Reject as invalid JSON - comments are non-standard and indicate file corruption or wrong format
- Q: What defines "extremely large" uidesc files for performance? → A: Files >1MB; performance target of <500ms applies to files ≤1MB

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Valid JSON uidesc files pass schema validation with zero false negatives
- **SC-002**: Valid XML uidesc files convert to correct JSON structure with 100% element mapping accuracy
- **SC-003**: All validation errors include actionable location information (path or element)
- **SC-004**: Format detection correctly identifies JSON vs XML in 100% of valid uidesc files
- **SC-005**: Parsing of typical uidesc files (< 1MB) completes in under 500ms
- **SC-006**: Test coverage for parsing module reaches 90%+ including edge cases
