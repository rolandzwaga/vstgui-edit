const VALID_TEMPLATE_NAME_PATTERN = /^[A-Za-z_][A-Za-z0-9_-]*$/;

export function isValidTemplateName(name: string): boolean {
  if (!name || name.length === 0) return false;
  return VALID_TEMPLATE_NAME_PATTERN.test(name);
}

export function generateUniqueTemplateName(
  existingNames: string[],
  baseName = 'NewTemplate'
): string {
  if (!existingNames.includes(baseName)) {
    return baseName;
  }

  let counter = 2;
  while (existingNames.includes(`${baseName}${counter}`)) {
    counter++;
  }

  return `${baseName}${counter}`;
}

export function generateDuplicateName(existingNames: string[], sourceName: string): string {
  const copyName = `${sourceName}Copy`;

  if (!existingNames.includes(copyName)) {
    return copyName;
  }

  let counter = 2;
  while (existingNames.includes(`${copyName}${counter}`)) {
    counter++;
  }

  return `${copyName}${counter}`;
}
