#!/usr/bin/env node

/**
 * Realm Schema Migration Script
 * 
 * Converts Realm v11 schema syntax to Realm v12 syntax
 * 
 * Changes:
 * OLD: propertyName: "ObjectType"
 * NEW: propertyName: { type: 'object', objectType: 'ObjectType' }
 * 
 * OLD: propertyName: {type: "ObjectType", optional: true}
 * NEW: propertyName: { type: 'object', objectType: 'ObjectType', optional: true }
 */

const fs = require('fs');
const path = require('path');

// Primitive types that should NOT be converted
const PRIMITIVE_TYPES = [
    'string',
    'int',
    'float',
    'double',
    'bool',
    'date',
    'data',
    'list',
    'linkingObjects',
    'objectId',
    'decimal128',
    'uuid',
    'mixed'
];

/**
 * Check if a type name is a custom object (starts with uppercase and isn't a primitive)
 */
function isCustomObjectType(typeName) {
    if (PRIMITIVE_TYPES.includes(typeName.toLowerCase())) {
        return false;
    }
    // Must start with uppercase letter to be a custom type
    return /^[A-Z]/.test(typeName);
}

// Patterns to match and convert
const PATTERNS = [
    {
        // Pattern 1: Simple object reference: propertyName: "ObjectType"
        // Match properties like: subjectType: "SubjectType",
        regex: /(\s+)(\w+):\s*"([A-Z]\w+)"\s*,/g,
        replacement: (match, indent, propName, objectType) => {
            if (!isCustomObjectType(objectType)) {
                return match;
            }
            return `${indent}${propName}: { type: 'object', objectType: '${objectType}' },`;
        }
    },
    {
        // Pattern 2: Object reference with type but no objectType
        // gender: {type: "Gender", optional: true}
        // Should become: gender: { type: 'object', objectType: 'Gender', optional: true }
        regex: /(\s+)(\w+):\s*\{\s*type:\s*"([A-Z]\w+)"\s*(,\s*optional:\s*(true|false))?\s*\}/g,
        replacement: (match, indent, propName, objectType, optionalPart, optionalValue) => {
            if (!isCustomObjectType(objectType)) {
                return match;
            }
            const optional = optionalPart ? `, optional: ${optionalValue}` : '';
            return `${indent}${propName}: { type: 'object', objectType: '${objectType}'${optional} }`;
        }
    }
];

class RealmSchemaMigrator {
    constructor(srcDir) {
        this.srcDir = srcDir;
        this.filesProcessed = 0;
        this.filesModified = 0;
        this.changesCount = 0;
        this.dryRun = false;
    }

    /**
     * Main migration method
     */
    migrate(dryRun = false) {
        this.dryRun = dryRun;
        console.log('🚀 Starting Realm Schema Migration...');
        console.log(`📁 Source directory: ${this.srcDir}`);
        console.log(`🔍 Mode: ${dryRun ? 'DRY RUN (no files will be modified)' : 'LIVE (files will be modified)'}\n`);

        this.processDirectory(this.srcDir);

        console.log('\n' + '='.repeat(80));
        console.log('📊 Migration Summary:');
        console.log('='.repeat(80));
        console.log(`Files processed: ${this.filesProcessed}`);
        console.log(`Files modified: ${this.filesModified}`);
        console.log(`Total changes: ${this.changesCount}`);
        
        if (dryRun) {
            console.log('\n⚠️  This was a DRY RUN. No files were actually modified.');
            console.log('Run with --apply to apply changes.');
        } else {
            console.log('\n✅ Migration completed successfully!');
        }
    }

    /**
     * Recursively process directory
     */
    processDirectory(dir) {
        const entries = fs.readdirSync(dir, { withFileTypes: true });

        for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);

            if (entry.isDirectory()) {
                // Skip node_modules, dist, and hidden directories
                if (!entry.name.startsWith('.') && entry.name !== 'node_modules' && entry.name !== 'dist') {
                    this.processDirectory(fullPath);
                }
            } else if (entry.isFile() && (entry.name.endsWith('.js') || entry.name.endsWith('.ts'))) {
                this.processFile(fullPath);
            }
        }
    }

    /**
     * Extract properties section from schema
     */
    extractPropertiesSection(content, startIndex) {
        let braceCount = 0;
        let inProperties = false;
        let propertiesStart = -1;
        let propertiesEnd = -1;

        for (let i = startIndex; i < content.length; i++) {
            if (!inProperties && content.substring(i, i + 11) === 'properties:') {
                inProperties = true;
                // Find the opening brace
                for (let j = i + 11; j < content.length; j++) {
                    if (content[j] === '{') {
                        propertiesStart = j;
                        braceCount = 1;
                        i = j;
                        break;
                    }
                }
                continue;
            }

            if (inProperties) {
                if (content[i] === '{') braceCount++;
                if (content[i] === '}') {
                    braceCount--;
                    if (braceCount === 0) {
                        propertiesEnd = i + 1;
                        break;
                    }
                }
            }
        }

        return { start: propertiesStart, end: propertiesEnd };
    }

    /**
     * Process a single file
     */
    processFile(filePath) {
        this.filesProcessed++;
        
        let content = fs.readFileSync(filePath, 'utf8');
        const originalContent = content;
        let fileChanges = 0;

        // Only process files that contain Realm schemas
        if (!content.includes('static schema')) {
            return;
        }

        // Find all schema definitions
        const schemaMatches = [...content.matchAll(/static\s+schema\s*=\s*\{/g)];
        
        // Process in reverse order to maintain correct indices
        for (let i = schemaMatches.length - 1; i >= 0; i--) {
            const schemaStart = schemaMatches[i].index;
            const propertiesInfo = this.extractPropertiesSection(content, schemaStart);
            
            if (propertiesInfo.start === -1) continue;

            // Extract properties section
            const before = content.substring(0, propertiesInfo.start);
            const propertiesSection = content.substring(propertiesInfo.start, propertiesInfo.end);
            const after = content.substring(propertiesInfo.end);

            let modifiedProperties = propertiesSection;

            // Apply all patterns
            for (const pattern of PATTERNS) {
                modifiedProperties = modifiedProperties.replace(pattern.regex, (...args) => {
                    const result = pattern.replacement(...args);
                    if (result !== args[0]) {
                        fileChanges++;
                    }
                    return result;
                });
            }

            // Reconstruct content
            content = before + modifiedProperties + after;
        }

        // If changes were made, write the file (unless dry run)
        if (content !== originalContent) {
            this.filesModified++;
            this.changesCount += fileChanges;
            
            console.log(`\n📝 ${path.relative(this.srcDir, filePath)}`);
            console.log(`   Changes: ${fileChanges}`);
            
            if (!this.dryRun) {
                fs.writeFileSync(filePath, content, 'utf8');
                console.log('   ✅ File updated');
            } else {
                console.log('   ⏭️  Skipped (dry run)');
                this.showDiff(originalContent, content, filePath);
            }
        }
    }

    /**
     * Show diff for dry run
     */
    showDiff(original, modified, filePath) {
        const originalLines = original.split('\n');
        const modifiedLines = modified.split('\n');
        
        let diffsShown = 0;
        const maxDiffsToShow = 3;

        for (let i = 0; i < Math.min(originalLines.length, modifiedLines.length); i++) {
            if (originalLines[i] !== modifiedLines[i] && diffsShown < maxDiffsToShow) {
                console.log(`   Line ${i + 1}:`);
                console.log(`   - ${originalLines[i].trim()}`);
                console.log(`   + ${modifiedLines[i].trim()}`);
                diffsShown++;
            }
        }

        if (diffsShown >= maxDiffsToShow) {
            console.log('   ... (more changes not shown)');
        }
    }
}

// Main execution
const args = process.argv.slice(2);
const dryRun = !args.includes('--apply');
const srcDir = args.find(arg => !arg.startsWith('--')) || path.join(__dirname, 'src');

const migrator = new RealmSchemaMigrator(srcDir);
migrator.migrate(dryRun);

if (dryRun) {
    console.log('\n💡 To apply changes, run:');
    console.log('   node migrate-realm-schema.js --apply');
}
