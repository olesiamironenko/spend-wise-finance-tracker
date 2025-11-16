// Validate one field based on rules
function validateField(key, schema, value, fullRecord) {
  // Handle required
  if (
    schema.required &&
    (value === undefined || value === null || value === '')
  ) {
    return `${key} is required`;
  }

  // Handle requiredIf
  if (schema.requiredIf && schema.requiredIf(fullRecord) === true) {
    if (!value) {
      return `${key} is required`;
    }
  }

  if (value == null) return null; // Skip further validation if optional and empty

  // Type check
  if (schema.type) {
    const valueType = Array.isArray(value) ? 'array' : typeof value;
    if (valueType !== schema.type) {
      return `${key} must be of type ${schema.type}`;
    }
  }

  // minLength / maxLength
  if (schema.minLength && value.length < schema.minLength) {
    return `${key} must be at least ${schema.minLength} characters`;
  }

  if (schema.maxLength && value.length > schema.maxLength) {
    return `${key} must be at most ${schema.maxLength} characters`;
  }

  // Pattern validation
  if (schema.pattern && !schema.pattern.test(value)) {
    return `${key} is invalid`;
  }

  // Enum validation
  if (schema.enum && !schema.enum.includes(value)) {
    return `${key} must be one of: ${schema.enum.join(', ')}`;
  }

  // Custom validate() rule
  if (schema.validate) {
    const result = schema.validate(value, fullRecord);
    if (result !== true) return result; // return custom error msg
  }

  // Not future (dates)
  if (schema.notFuture) {
    const date = new Date(value);
    if (isNaN(date.getTime())) return `${key} is not a valid date`;
    if (date > new Date()) return `${key} cannot be in the future`;
  }

  return null;
}

// Validate full record
export function validateRecord(tableName, record, schemas) {
  const schema = schemas[tableName];
  if (!schema) throw new Error(`Unknown schema: ${tableName}`);

  const errors = {};

  for (const key in schema) {
    const rule = schema[key];
    if (rule.readonly) continue; // Skip readonly validation

    const error = validateField(key, rule, record[key], record);
    if (error) errors[key] = error;
  }

  return Object.keys(errors).length > 0 ? errors : null;
}
