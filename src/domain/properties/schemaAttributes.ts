import schema from '../../../vstgui-uidesc.schema.json';
import type { AttributeDefinition, EditorType, ViewClassSchema } from '../../types/properties';

type SchemaDefinitions = Record<string, SchemaDefinition>;
type SchemaDefinition = {
  type?: string;
  description?: string;
  allOf?: Array<{ $ref?: string }>;
  properties?: Record<string, PropertyDefinition>;
  enum?: string[];
  $ref?: string;
};
type PropertyDefinition = {
  type?: string;
  $ref?: string;
  description?: string;
  enum?: string[];
};

const defs = schema.$defs as SchemaDefinitions;
const schemaCache = new Map<string, ViewClassSchema>();

const CLASS_TO_ATTRIBUTES: Record<string, string> = {
  CView: 'CViewAttributes',
  CViewContainer: 'CViewContainerAttributes',
  CLayeredViewContainer: 'CLayeredViewContainerAttributes',
  CRowColumnView: 'CRowColumnViewAttributes',
  CScrollView: 'CScrollViewAttributes',
  CSplitView: 'CSplitViewAttributes',
  CShadowViewContainer: 'CShadowViewContainerAttributes',
  UIViewSwitchContainer: 'UIViewSwitchContainerAttributes',
  CControl: 'CControlAttributes',
  CParamDisplay: 'CParamDisplayAttributes',
  CTextLabel: 'CTextLabelAttributes',
  CMultiLineTextLabel: 'CMultiLineTextLabelAttributes',
  CTextEdit: 'CTextEditAttributes',
  CSearchTextEdit: 'CSearchTextEditAttributes',
  CTextButton: 'CTextButtonAttributes',
  COnOffButton: 'COnOffButtonAttributes',
  CCheckBox: 'CCheckBoxAttributes',
  CSegmentButton: 'CSegmentButtonAttributes',
  CKickButton: 'CKickButtonAttributes',
  CRockerSwitch: 'CRockerSwitchAttributes',
  CVerticalSwitch: 'CVerticalSwitchAttributes',
  CHorizontalSwitch: 'CHorizontalSwitchAttributes',
  CMovieBitmap: 'CMovieBitmapAttributes',
  CMovieButton: 'CMovieButtonAttributes',
  CKnob: 'CKnobAttributes',
  CAnimKnob: 'CAnimKnobAttributes',
  CSlider: 'CSliderAttributes',
  CVuMeter: 'CVuMeterAttributes',
  CXYPad: 'CXYPadAttributes',
  COptionMenu: 'COptionMenuAttributes',
  CGradientView: 'CGradientViewAttributes',
  CStringListControl: 'CStringListControlAttributes',
  CAutoAnimation: 'CAutoAnimationAttributes',
  CAnimationSplashScreen: 'CAnimationSplashScreenAttributes',
};

function resolveRef(ref: string): SchemaDefinition | undefined {
  const defName = ref.replace('#/$defs/', '');
  return defs[defName];
}

function getParentClass(className: string): string | undefined {
  const attrSchemaName = CLASS_TO_ATTRIBUTES[className];
  if (!attrSchemaName) return undefined;

  const def = defs[attrSchemaName];
  if (!def?.allOf) return undefined;

  for (const item of def.allOf) {
    if (item.$ref) {
      const parentAttrName = item.$ref.replace('#/$defs/', '');
      for (const [cls, attrs] of Object.entries(CLASS_TO_ATTRIBUTES)) {
        if (attrs === parentAttrName) return cls;
      }
    }
  }
  return undefined;
}

export function getInheritanceChain(className: string): string[] {
  if (!CLASS_TO_ATTRIBUTES[className]) {
    return ['CView'];
  }

  const chain: string[] = [className];
  let current = className;

  while (true) {
    const parent = getParentClass(current);
    if (!parent) break;
    chain.push(parent);
    current = parent;
  }

  return chain;
}

const BOOLEAN_REF = 'booleanValue';

function mapRefToEditorType(ref: string): EditorType {
  const refName = ref.replace('#/$defs/', '');

  switch (refName) {
    case 'colorValue':
      return 'color';
    case 'pointValue':
    case 'sizeValue':
    case 'rectValue':
      return 'point';
    case BOOLEAN_REF:
      return 'boolean';
    case 'numericValue':
      return 'number';
    case 'gradientDefinition':
      return 'gradient';
    default:
      return 'text';
  }
}

function getEditorTypeFromProperty(prop: PropertyDefinition, name: string): EditorType {
  if (prop.$ref) {
    return mapRefToEditorType(prop.$ref);
  }

  if (prop.enum) {
    return 'enum';
  }

  if (name === 'font') return 'font';
  if (name === 'bitmap' || name.endsWith('-bitmap')) return 'bitmap';
  if (name === 'gradient' || name.endsWith('-gradient')) return 'gradient';
  if (name === 'control-tag') return 'control-tag';

  return 'text';
}

function getOwnProperties(className: string): AttributeDefinition[] {
  const attrSchemaName = CLASS_TO_ATTRIBUTES[className];
  if (!attrSchemaName) return [];

  const def = defs[attrSchemaName];
  if (!def?.properties) return [];

  const attrs: AttributeDefinition[] = [];

  for (const [name, prop] of Object.entries(def.properties)) {
    const editorType = getEditorTypeFromProperty(prop, name);

    const attr: AttributeDefinition = {
      name,
      editorType,
      description: prop.description,
    };

    if (prop.enum) {
      attr.enumValues = prop.enum;
    }

    if (prop.$ref) {
      attr.schemaRef = prop.$ref;
      const refName = prop.$ref.replace('#/$defs/', '');
      if (refName !== BOOLEAN_REF) {
        const refDef = resolveRef(prop.$ref);
        if (refDef?.enum) {
          attr.enumValues = refDef.enum;
          attr.editorType = 'enum';
        }
      }
    }

    attrs.push(attr);
  }

  return attrs;
}

export function resolveClassAttributes(className: string): AttributeDefinition[] {
  const chain = getInheritanceChain(className);
  const seenNames = new Set<string>();
  const attrs: AttributeDefinition[] = [];

  for (const cls of chain) {
    const ownAttrs = getOwnProperties(cls);
    for (const attr of ownAttrs) {
      if (!seenNames.has(attr.name)) {
        seenNames.add(attr.name);
        attrs.push(attr);
      }
    }
  }

  return attrs;
}

export function getAttributesForClass(className: string): ViewClassSchema {
  const cached = schemaCache.get(className);
  if (cached) return cached;

  const inheritanceChain = getInheritanceChain(className);
  const attributes = resolveClassAttributes(className);

  const result: ViewClassSchema = {
    className,
    inheritanceChain,
    attributes,
  };

  schemaCache.set(className, result);
  return result;
}

export function findCommonBaseClass(classNames: string[]): string {
  if (classNames.length === 0) return 'CView';
  if (classNames.length === 1) return classNames[0];

  const chains = classNames.map(cn => getInheritanceChain(cn));
  const firstChain = chains[0];

  for (const cls of firstChain) {
    if (chains.every(chain => chain.includes(cls))) {
      return cls;
    }
  }

  return 'CView';
}
