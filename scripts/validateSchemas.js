#!/usr/bin/env node
/**
 * Realm Schema Validator - Validates schema compatibility
 * Critical for Realm v12+: All list properties must have explicit objectType
 */

const EntityMappingConfig = require('../dist/Schema').default;

function validateSchemas() {
  const config = EntityMappingConfig.getInstance().getRealmConfig();
  const issues = [];

  config.schema.forEach(schema => {
    Object.entries(schema.properties).forEach(([propName, propDef]) => {
      // Critical: Realm v12 requires explicit objectType for list properties
      if (propDef.type === 'list' && !propDef.objectType) {
        issues.push(`${schema.name}.${propName}: Missing objectType`);
      }
      // Critical: No implicit "[]" shorthand allowed in v12
      if (propDef === '[]') {
        issues.push(`${schema.name}.${propName}: Use "mixed[]" instead of "[]"`);
      }
    });
  });

  if (issues.length > 0) {
    console.error('\n❌ Schema validation failed:\n');
    issues.forEach(issue => console.error(`  ${issue}`));
    process.exit(1);
  }

  console.log(`✓ All ${config.schema.length} schemas valid (v${config.schemaVersion})`);
}

try {
  validateSchemas();
} catch (error) {
  console.error('Validation failed:', error.message);
  process.exit(1);
}
