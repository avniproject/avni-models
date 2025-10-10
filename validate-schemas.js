#!/usr/bin/env node

/**
 * Post-Migration Schema Validator
 * 
 * Validates that all schemas have been properly migrated to Realm v12 syntax:
 * 1. All object references use { type: 'object', objectType: 'TypeName' }
 * 2. No old-style string references remain
 * 3. Schema structure is valid
 */

const fs = require('fs');
const path = require('path');

class SchemaValidator {
    constructor(srcDir) {
        this.srcDir = srcDir;
        this.errors = [];
        this.warnings = [];
        this.validated = 0;
        this.schemaCount = 0;
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
     * Validate a single file
     */
    validateFile(filePath) {
        const content = fs.readFileSync(filePath, 'utf8');
        const relativePath = path.relative(this.srcDir, filePath);

        // Only process files with schemas
        if (!content.includes('static schema')) {
            return;
        }

        this.schemaCount++;
        this.validated++;

        const lines = content.split('\n');

        // Check 1: Old-style object references (should be none after migration)
        const oldStyleReferences = this.findOldStyleReferences(content, lines);
        if (oldStyleReferences.length > 0) {
            oldStyleReferences.forEach(ref => {
                this.errors.push({
                    file: relativePath,
                    line: ref.line,
                    issue: `Old-style object reference found: ${ref.match}`,
                    fix: `Should use: { type: 'object', objectType: '${ref.typeName}' }`
                });
            });
        }

        // Check 2: Verify new syntax is properly formed
        const newSyntaxIssues = this.validateNewSyntax(content, lines);
        if (newSyntaxIssues.length > 0) {
            newSyntaxIssues.forEach(issue => {
                this.errors.push({
                    file: relativePath,
                    line: issue.line,
                    issue: issue.message,
                    fix: issue.fix
                });
            });
        }

        // Check 3: List types have objectType
        const listIssues = this.validateListTypes(content, lines);
        if (listIssues.length > 0) {
            listIssues.forEach(issue => {
                this.errors.push({
                    file: relativePath,
                    line: issue.line,
                    issue: 'List type without objectType',
                    fix: 'Add objectType: "YourTypeName"'
                });
            });
        }

        // Check 4: Schema structure
        if (!content.match(/static\s+schema\s*=\s*\{[\s\S]*name:/)) {
            this.warnings.push({
                file: relativePath,
                issue: 'Schema missing "name" property',
                severity: 'WARNING'
            });
        }

        if (!content.match(/static\s+schema\s*=\s*\{[\s\S]*properties:/)) {
            this.errors.push({
                file: relativePath,
                issue: 'Schema missing "properties" property',
                severity: 'ERROR'
            });
        }
    }

    /**
     * Find old-style object references
     */
    findOldStyleReferences(content, lines) {
        const primitiveTypes = ['string', 'int', 'float', 'double', 'bool', 'date', 'data', 'list'];
        const found = [];

        // Extract properties section
        const propertiesMatch = content.match(/properties:\s*\{([^}]+(?:\{[^}]*\})*)\}/s);
        if (!propertiesMatch) return found;

        const propertiesContent = propertiesMatch[1];
        const propertiesLines = propertiesContent.split('\n');

        propertiesLines.forEach((line, idx) => {
            // Look for: propertyName: "TypeName",
            const match = line.match(/(\w+):\s*"([A-Z]\w+)"\s*,/);
            if (match) {
                const [fullMatch, propName, typeName] = match;
                
                // Exclude primitives and special cases
                if (!primitiveTypes.includes(typeName.toLowerCase()) && /^[A-Z]/.test(typeName)) {
                    // Find actual line number in original file
                    const lineNumber = lines.findIndex(l => l.includes(fullMatch)) + 1;
                    
                    found.push({
                        line: lineNumber,
                        match: fullMatch.trim(),
                        propName: propName,
                        typeName: typeName
                    });
                }
            }

            // Look for: propertyName: {type: "TypeName", ...}
            const typeMatch = line.match(/(\w+):\s*\{\s*type:\s*"([A-Z]\w+)"/);
            if (typeMatch) {
                const [fullMatch, propName, typeName] = typeMatch;
                
                // This is only an issue if it's NOT using objectType
                if (!line.includes('objectType') && !primitiveTypes.includes(typeName.toLowerCase()) && /^[A-Z]/.test(typeName)) {
                    const lineNumber = lines.findIndex(l => l.includes(fullMatch)) + 1;
                    
                    found.push({
                        line: lineNumber,
                        match: fullMatch.trim(),
                        propName: propName,
                        typeName: typeName
                    });
                }
            }
        });

        return found;
    }

    /**
     * Validate new v12 syntax is properly formed
     */
    validateNewSyntax(content, lines) {
        const issues = [];

        lines.forEach((line, idx) => {
            // Check for malformed object syntax
            if (line.includes("type: 'object'") || line.includes('type: "object"')) {
                // Must have objectType
                if (!line.includes('objectType')) {
                    // Check if objectType is on next line
                    const nextLine = lines[idx + 1] || '';
                    if (!nextLine.includes('objectType')) {
                        issues.push({
                            line: idx + 1,
                            message: 'Object type without objectType property',
                            fix: "Add objectType: 'YourTypeName'"
                        });
                    }
                }
            }

            // Check for mismatched quotes
            if (line.match(/type:\s*['"][^'"]*['"]/) && line.match(/objectType:\s*['"][^'"]*['"]/)) {
                const typeQuote = line.match(/type:\s*(['"])/)?.[1];
                const objectTypeQuote = line.match(/objectType:\s*(['"])/)?.[1];
                
                if (typeQuote !== objectTypeQuote) {
                    issues.push({
                        line: idx + 1,
                        message: 'Inconsistent quote styles',
                        fix: 'Use consistent quotes (all single or all double)'
                    });
                }
            }
        });

        return issues;
    }

    /**
     * Validate list types
     */
    validateListTypes(content, lines) {
        const issues = [];

        lines.forEach((line, idx) => {
            if (line.match(/type:\s*['"]list['"]/) && !line.includes('objectType')) {
                // Check next line
                const nextLine = lines[idx + 1] || '';
                if (!nextLine.includes('objectType')) {
                    issues.push({
                        line: idx + 1
                    });
                }
            }
        });

        return issues;
    }

    /**
     * Run validation
     */
    validate() {
        console.log('✅ Running Post-Migration Schema Validation...\n');
        console.log(`📁 Source directory: ${this.srcDir}\n`);

        const files = this.findSchemaFiles(this.srcDir);
        console.log(`Validating ${files.length} files...\n`);

        files.forEach(file => this.validateFile(file));

        this.printResults();
        
        return this.errors.length === 0;
    }

    /**
     * Print validation results
     */
    printResults() {
        console.log('='.repeat(80));
        console.log('📊 VALIDATION RESULTS');
        console.log('='.repeat(80) + '\n');

        console.log(`Files scanned: ${this.validated}`);
        console.log(`Schemas found: ${this.schemaCount}`);
        console.log(`Errors: ${this.errors.length}`);
        console.log(`Warnings: ${this.warnings.length}\n`);

        if (this.errors.length > 0) {
            console.log('❌ ERRORS FOUND:\n');
            
            const byFile = {};
            this.errors.forEach(error => {
                if (!byFile[error.file]) byFile[error.file] = [];
                byFile[error.file].push(error);
            });

            Object.keys(byFile).forEach(file => {
                console.log(`📄 ${file}`);
                byFile[file].forEach(({line, issue, fix}) => {
                    console.log(`   Line ${line}: ${issue}`);
                    console.log(`   Fix: ${fix}\n`);
                });
            });
        }

        if (this.warnings.length > 0) {
            console.log('⚠️  WARNINGS:\n');
            
            this.warnings.forEach(({file, issue}) => {
                console.log(`   • ${file}: ${issue}`);
            });
            console.log('');
        }

        console.log('='.repeat(80));
        if (this.errors.length === 0 && this.warnings.length === 0) {
            console.log('✅ ALL SCHEMAS VALID! Migration successful.');
        } else if (this.errors.length === 0) {
            console.log('✅ No errors, but review warnings above.');
        } else {
            console.log('❌ Validation failed. Fix errors above.');
        }
        console.log('='.repeat(80));
    }
}

// Main execution
const srcDir = process.argv[2] || path.join(__dirname, 'src');
const validator = new SchemaValidator(srcDir);
const passed = validator.validate();

process.exit(passed ? 0 : 1);
