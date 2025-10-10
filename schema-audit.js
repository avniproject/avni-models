#!/usr/bin/env node

/**
 * Schema Audit Script for Realm v12 Compatibility
 * 
 * Checks for patterns that are incompatible with Realm v12:
 * 1. Implicit mixed arrays: type: "[]" 
 * 2. Lists without objectType
 * 3. Mixed shorthand and object form
 * 4. Old object reference syntax
 */

const fs = require('fs');
const path = require('path');

class SchemaAuditor {
    constructor(srcDir) {
        this.srcDir = srcDir;
        this.issues = [];
        this.warnings = [];
        this.info = [];
    }

    /**
     * Find all schema files
     */
    findSchemaFiles(dir, fileList = []) {
        if (!fs.existsSync(dir)) {
            console.error(`Directory not found: ${dir}`);
            return fileList;
        }

        const entries = fs.readdirSync(dir, { withFileTypes: true });

        for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);

            if (entry.isDirectory()) {
                // Skip node_modules, dist, and hidden directories
                if (!entry.name.startsWith('.') && entry.name !== 'node_modules' && entry.name !== 'dist') {
                    this.findSchemaFiles(fullPath, fileList);
                }
            } else if (entry.isFile() && (entry.name.endsWith('.js') || entry.name.endsWith('.ts'))) {
                fileList.push(fullPath);
            }
        }

        return fileList;
    }

    /**
     * Audit a single file
     */
    auditFile(filePath) {
        const content = fs.readFileSync(filePath, 'utf8');
        const relativePath = path.relative(this.srcDir, filePath);

        // Only process files with schemas
        if (!content.includes('static schema')) {
            return;
        }

        // Check 1: Implicit mixed array "[]"
        if (content.match(/type:\s*["']\[\]["']/)) {
            this.issues.push({
                file: relativePath,
                type: 'ERROR',
                issue: 'Implicit mixed array "[]" detected',
                fix: 'Change type: "[]" to type: "mixed[]"',
                pattern: 'type: "[]"'
            });
        }

        // Check 2: List without objectType
        const listWithoutObjectType = content.match(/type:\s*["']list["'](?!\s*,\s*objectType)/g);
        if (listWithoutObjectType) {
            this.issues.push({
                file: relativePath,
                type: 'ERROR',
                issue: 'List type without objectType',
                fix: 'Add objectType property: { type: "list", objectType: "YourType" }',
                pattern: 'type: "list"'
            });
        }

        // Check 3: Mixed shorthand and object form (? with optional: true)
        const lines = content.split('\n');
        lines.forEach((line, index) => {
            if (line.match(/type:\s*["'][^"']*\?["']/) && line.match(/optional:\s*true/)) {
                this.issues.push({
                    file: relativePath,
                    type: 'ERROR',
                    issue: `Mixed shorthand (?) and explicit optional: true on line ${index + 1}`,
                    fix: 'Use either "Type?" OR {type: "Type", optional: true}, not both',
                    pattern: line.trim()
                });
            }
        });

        // Check 4: Old object reference syntax (main migration target)
        // Node v10 compatible alternative to matchAll()
        const getMatches = (str, regex) => {
            const matches = [];
            let match;
            while ((match = regex.exec(str)) !== null) {
                matches.push(match);
            }
            return matches;
        };

        const oldSyntaxMatches = getMatches(content, /(\w+):\s*"([A-Z]\w+)"\s*,/g);
        const oldSyntaxWithType = getMatches(content, /(\w+):\s*\{type:\s*"([A-Z]\w+)"[^}]*\}/g);

        // Filter out primitive types
        const primitiveTypes = ['string', 'int', 'float', 'double', 'bool', 'date', 'data', 'list'];
        
        const customObjectReferences = oldSyntaxMatches.filter(match => {
            const typeName = match[2];
            return !primitiveTypes.includes(typeName.toLowerCase()) && /^[A-Z]/.test(typeName);
        });

        if (customObjectReferences.length > 0) {
            this.warnings.push({
                file: relativePath,
                type: 'WARNING',
                issue: `Found ${customObjectReferences.length} old-style object reference(s)`,
                fix: 'Will be migrated by migrate-realm-schema.js',
                count: customObjectReferences.length
            });
        }

        // Check 5: Schema version presence
        if (content.includes('Realm.open') && !content.includes('schemaVersion')) {
            this.info.push({
                file: relativePath,
                type: 'INFO',
                issue: 'Realm.open without explicit schemaVersion',
                fix: 'Consider adding schemaVersion property'
            });
        }

        // Check 6: Embedded objects
        if (content.includes('embedded: true')) {
            this.info.push({
                file: relativePath,
                type: 'INFO',
                issue: 'Contains embedded objects',
                fix: 'Verify embedded object syntax is correct for v12'
            });
        }

        // Check 7: Default values syntax
        const defaultValueMatch = content.match(/default:\s*\{[^}]+\}/g);
        if (defaultValueMatch) {
            this.info.push({
                file: relativePath,
                type: 'INFO',
                issue: 'Contains default object values',
                fix: 'Verify default value format is correct for v12'
            });
        }
    }

    /**
     * Run complete audit
     */
    audit() {
        console.log('🔍 Starting Realm v12 Schema Compatibility Audit...\n');
        console.log(`📁 Source directory: ${this.srcDir}\n`);

        const files = this.findSchemaFiles(this.srcDir);
        console.log(`Found ${files.length} files to audit\n`);

        files.forEach(file => this.auditFile(file));

        this.printResults();
        return this.issues.length === 0;
    }

    /**
     * Print audit results
     */
    printResults() {
        console.log('\n' + '='.repeat(80));
        console.log('📊 AUDIT RESULTS');
        console.log('='.repeat(80) + '\n');

        // Print errors
        if (this.issues.length > 0) {
            console.log(`❌ CRITICAL ISSUES (${this.issues.length}):`);
            console.log('These MUST be fixed before Realm v12 upgrade:\n');
            
            this.issues.forEach(({file, issue, fix, pattern}, index) => {
                console.log(`${index + 1}. 📄 ${file}`);
                console.log(`   ⚠️  ${issue}`);
                console.log(`   💡 Fix: ${fix}`);
                if (pattern) {
                    console.log(`   📝 Pattern: ${pattern}`);
                }
                console.log('');
            });
        }

        // Print warnings
        if (this.warnings.length > 0) {
            console.log(`\n⚠️  WARNINGS (${this.warnings.length}):`);
            console.log('These will be handled by migration script:\n');
            
            this.warnings.forEach(({file, issue, fix, count}) => {
                console.log(`   • ${file}`);
                console.log(`     ${issue}`);
                console.log(`     ${fix}`);
                if (count) {
                    console.log(`     Count: ${count} occurrence(s)`);
                }
            });
        }

        // Print info
        if (this.info.length > 0) {
            console.log(`\n💡 INFORMATIONAL (${this.info.length}):`);
            
            this.info.forEach(({file, issue, fix}) => {
                console.log(`   • ${file}: ${issue}`);
            });
        }

        // Summary
        console.log('\n' + '='.repeat(80));
        console.log('SUMMARY');
        console.log('='.repeat(80));
        console.log(`Critical Issues: ${this.issues.length}`);
        console.log(`Warnings: ${this.warnings.length}`);
        console.log(`Informational: ${this.info.length}`);
        
        if (this.issues.length === 0) {
            console.log('\n✅ No blocking issues found! Safe to proceed with migration.');
        } else {
            console.log('\n❌ Fix critical issues before running migration script.');
        }
    }
}

// Main execution
const srcDir = process.argv[2] || path.join(__dirname, 'src');
const auditor = new SchemaAuditor(srcDir);
const passed = auditor.audit();

process.exit(passed ? 0 : 1);
