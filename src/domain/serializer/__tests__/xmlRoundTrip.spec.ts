import { describe, expect, test } from 'vitest';
import { xmlToJson } from '../../parser/xmlToJson';
import { serializeToXml } from '../xmlSerializer';

function parseXml(content: string): Document {
  const parser = new DOMParser();
  return parser.parseFromString(content, 'application/xml');
}

const COMPREHENSIVE_XML = `<?xml version="1.0" encoding="UTF-8"?>
<vstgui-ui-description version="1">
  <colors>
    <color name="Background" rgba="#1a1a1aff"/>
    <color name="Foreground" rgba="#ffffffff"/>
    <color name="Accent" rgba="#ff5500ff"/>
  </colors>
  <fonts>
    <font name="MainFont" font-name="Arial" size="12"/>
    <font name="BoldFont" font-name="Arial" size="14" bold="true"/>
    <font name="ItalicFont" font-name="Times" size="10" italic="true"/>
  </fonts>
  <bitmaps>
    <bitmap name="knob" path="images/knob.png"/>
    <bitmap name="slider" path="images/slider.png" nineparttiled-offsets="5, 5, 5, 5"/>
    <bitmap name="knobHD" path="images/knob@2x.png" scale-factor="2"/>
  </bitmaps>
  <control-tags>
    <control-tag name="Volume" tag="0"/>
    <control-tag name="Pan" tag="1"/>
    <control-tag name="Bypass" tag="100"/>
  </control-tags>
  <gradients>
    <gradient name="ButtonGradient">
      <color-stop rgba="#ffffffff" start="0"/>
      <color-stop rgba="#ccccccff" start="0.5"/>
      <color-stop rgba="#999999ff" start="1"/>
    </gradient>
    <gradient name="SliderGradient">
      <color-stop rgba="#ff0000ff" start="0"/>
      <color-stop rgba="#00ff00ff" start="1"/>
    </gradient>
  </gradients>
  <variables>
    <variable name="windowWidth" value="800"/>
    <variable name="windowHeight" value="600"/>
    <variable name="pluginName" value="MyPlugin"/>
  </variables>
  <template name="MainView" class="CViewContainer" origin="0, 0" size="800, 600" background-color="~Background">
    <view class="CTextLabel" origin="10, 10" size="200, 30" title="Hello World" font="~MainFont"/>
    <view class="CViewContainer" origin="10, 50" size="300, 200">
      <view class="CKnob" origin="5, 5" size="50, 50" bitmap="knob"/>
      <view class="CSlider" origin="60, 5" size="100, 20"/>
    </view>
  </template>
  <template name="SettingsView" class="CViewContainer" origin="0, 0" size="400, 300"/>
</vstgui-ui-description>`;

describe('XML Round-Trip Serialization', () => {
  test('parse -> serialize -> parse produces equivalent structure', () => {
    const originalDoc = parseXml(COMPREHENSIVE_XML);
    const parsed = xmlToJson(originalDoc);

    const serialized = serializeToXml(parsed.json);

    const reparsedDoc = parseXml(serialized);
    const reparsed = xmlToJson(reparsedDoc);

    expect(reparsed.json).toEqual(parsed.json);
  });

  test('preserves all colors', () => {
    const originalDoc = parseXml(COMPREHENSIVE_XML);
    const parsed = xmlToJson(originalDoc);

    const serialized = serializeToXml(parsed.json);
    const reparsedDoc = parseXml(serialized);
    const reparsed = xmlToJson(reparsedDoc);

    expect(reparsed.json['vstgui-ui-description'].colors).toEqual(
      parsed.json['vstgui-ui-description'].colors
    );
  });

  test('preserves all fonts with attributes', () => {
    const originalDoc = parseXml(COMPREHENSIVE_XML);
    const parsed = xmlToJson(originalDoc);

    const serialized = serializeToXml(parsed.json);
    const reparsedDoc = parseXml(serialized);
    const reparsed = xmlToJson(reparsedDoc);

    expect(reparsed.json['vstgui-ui-description'].fonts).toEqual(
      parsed.json['vstgui-ui-description'].fonts
    );
  });

  test('preserves all bitmaps with attributes', () => {
    const originalDoc = parseXml(COMPREHENSIVE_XML);
    const parsed = xmlToJson(originalDoc);

    const serialized = serializeToXml(parsed.json);
    const reparsedDoc = parseXml(serialized);
    const reparsed = xmlToJson(reparsedDoc);

    expect(reparsed.json['vstgui-ui-description'].bitmaps).toEqual(
      parsed.json['vstgui-ui-description'].bitmaps
    );
  });

  test('preserves all control-tags', () => {
    const originalDoc = parseXml(COMPREHENSIVE_XML);
    const parsed = xmlToJson(originalDoc);

    const serialized = serializeToXml(parsed.json);
    const reparsedDoc = parseXml(serialized);
    const reparsed = xmlToJson(reparsedDoc);

    expect(reparsed.json['vstgui-ui-description']['control-tags']).toEqual(
      parsed.json['vstgui-ui-description']['control-tags']
    );
  });

  test('preserves all gradients with color stops', () => {
    const originalDoc = parseXml(COMPREHENSIVE_XML);
    const parsed = xmlToJson(originalDoc);

    const serialized = serializeToXml(parsed.json);
    const reparsedDoc = parseXml(serialized);
    const reparsed = xmlToJson(reparsedDoc);

    expect(reparsed.json['vstgui-ui-description'].gradients).toEqual(
      parsed.json['vstgui-ui-description'].gradients
    );
  });

  test('preserves all variables', () => {
    const originalDoc = parseXml(COMPREHENSIVE_XML);
    const parsed = xmlToJson(originalDoc);

    const serialized = serializeToXml(parsed.json);
    const reparsedDoc = parseXml(serialized);
    const reparsed = xmlToJson(reparsedDoc);

    expect(reparsed.json['vstgui-ui-description'].variables).toEqual(
      parsed.json['vstgui-ui-description'].variables
    );
  });

  test('preserves template structure with nested views', () => {
    const originalDoc = parseXml(COMPREHENSIVE_XML);
    const parsed = xmlToJson(originalDoc);

    const serialized = serializeToXml(parsed.json);
    const reparsedDoc = parseXml(serialized);
    const reparsed = xmlToJson(reparsedDoc);

    expect(reparsed.json['vstgui-ui-description'].templates).toEqual(
      parsed.json['vstgui-ui-description'].templates
    );
  });

  test('handles special XML characters in attribute values', () => {
    const xmlWithSpecialChars = `<?xml version="1.0" encoding="UTF-8"?>
<vstgui-ui-description version="1">
  <colors>
    <color name="Test&amp;Color" rgba="#ff0000ff"/>
  </colors>
  <template name="View" class="CView" origin="0, 0" size="100, 100" title="Say &quot;Hello&quot;"/>
</vstgui-ui-description>`;

    const originalDoc = parseXml(xmlWithSpecialChars);
    const parsed = xmlToJson(originalDoc);

    const serialized = serializeToXml(parsed.json);
    const reparsedDoc = parseXml(serialized);
    const reparsed = xmlToJson(reparsedDoc);

    expect(reparsed.json['vstgui-ui-description'].colors?.['Test&Color']).toBe('#ff0000ff');
    expect(reparsed.json['vstgui-ui-description'].templates?.View.attributes.title).toBe(
      'Say "Hello"'
    );
  });
});
