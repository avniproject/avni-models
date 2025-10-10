#!/usr/bin/env node

/**
 * Breaking Changes Checker for Realm v12
 * 
 * Scans codebase for deprecated API usage that breaks in v12:
 * 1. RealmObject.keys() → Object.keys()
 * 2. RealmObject.entries() → Object.entries() or spread
 * 3. UserState.Active → UserState.LoggedIn
 * 4. SubscriptionsState → SubscriptionSetState
 */

const fs = require('fs');
const path = require('path');

const DEPRECATED_PATTERNS = [
    {
        pattern: /\.keys\(\)/g,
        name: 'RealmObject.keys()',
        fix: 'Use Object.keys(realmObject) instead',
        severity: 'ERROR',
        context: 'realmObject.keys()'
    },
    {
        pattern: /\.entries\(\)/g,
        name: 'RealmObject.entries()',
        fix: 'Use Object.entries(realmObject) or spread {...realmObject}',
        severity: 'ERROR',
        context: 'realmObject.entries()'
    },
    {
        pattern: /UserState\.Active/g,
        name: 'UserState.Active',
        fix: 'Replace with UserState.LoggedIn',
        severity: 'ERROR',
        context: 'UserState.Active'
    },
    {
        pattern: /SubscriptionsState/g,
        name: 'SubscriptionsState',
        fix: 'Replace with SubscriptionSetState',
        severity: 'ERROR',
        context: 'SubscriptionsState'
    },
    {
        pattern: /\.objectForPrimaryKey\(/g,
        name: '.objectForPrimaryKey()',
        fix: 'Consider using .objects().filtered() instead',
        severity: 'WARNING',
        context: 'realm.objectForPrimaryKey()'
    },
    {
        pattern: /new\s+Realm\(/g,
        name: 'new Realm()',
        fix: 'Prefer async Realm.open() over new Realm()',
        severity: 'WARNING',
        context: 'new Realm(config)'
    }
];

class BreakingChangesChecker {
    constructor(srcDir) {
        this.srcDir = srcDir;
        this.findings = [];
    }

    /**
     * Scan directory recursively
     */
    scanDirectory(dir, fileList = []) {
        if (!fs.existsSync(dir)) {
            console.error(`Directory not found: ${dir}`);
            return fileList;
        }

        const entries = fs.readdirSync(dir, { withFileTypes: true });

        for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);

            if (entry.isDirectory()) {
                if (!entry.name.startsWith('.') && entry.name !== 'node_modules' && entry.name !== 'dist') {
                    this.scanDirectory(fullPath, fileList);
                }
            } else if (entry.isFile() && entry.name.match(/\.(js|jsx|ts|tsx)$/)) {
                fileList.push(fullPath);
            }
        }

        return fileList;
    }

    /**
     * Check a single file
     */
    checkFile(filePath) {
        const content = fs.readFileSync(filePath, 'utf8');
        const relativePath = path.relative(this.srcDir, filePath);
        const lines = content.split('\n');

        DEPRECATED_PATTERNS.forEach(({pattern, name, fix, severity, context}) => {
            // Reset regex
            pattern.lastIndex = 0;
            
            let match;
            while ((match = pattern.exec(content)) !== null) {
                // Find line number
                let lineNumber = 1;
                let charCount = 0;
                
                for (let i = 0; i < lines.length; i++) {
                    charCount += lines[i].length + 1; // +1 for newline
                    if (charCount > match.index) {
                        lineNumber = i + 1;
                        break;
                    }
                }

                this.findings.push({
                    file: relativePath,
                    line: lineNumber,
                    pattern: name,
                    fix: fix,
                    severity: severity,
                    codeSnippet: lines[lineNumber - 1].trim(),
                    context: context
                });
            }
        });
    }

    /**
     * Run complete check
     */
    check() {
        console.log('🔍 Scanning for Realm v12 Breaking Changes...\n');
        console.log(`📁 Source directory: ${this.srcDir}\n`);

        const files = this.scanDirectory(this.srcDir);
        console.log(`Scanning ${files.length} files...\n`);

        files.forEach(file => this.checkFile(file));

        this.printResults();
        
        const errors = this.findings.filter(f => f.severity === 'ERROR');
        return errors.length === 0;
    }

    /**
     * Print results
     */
    printResults() {
        console.log('='.repeat(80));
        console.log('📊 BREAKING CHANGES SCAN RESULTS');
        console.log('='.repeat(80) + '\n');

        if (this.findings.length === 0) {
            console.log('✅ No deprecated API usage detected!\n');
            console.log('Your codebase appears clean for Realm v12 upgrade.');
            return;
        }

        // Group by severity
        const errors = this.findings.filter(f => f.severity === 'ERROR');
        const warnings = this.findings.filter(f => f.severity === 'WARNING');

        // Print errors
        if (errors.length > 0) {
            console.log(`❌ CRITICAL ISSUES (${errors.length}):`);
            console.log('These MUST be fixed before upgrading to Realm v12:\n');

            const byFile = this.groupByFile(errors);
            Object.keys(byFile).forEach(file => {
                console.log(`\n📄 ${file}`);
                byFile[file].forEach(({line, pattern, fix, codeSnippet}) => {
                    console.log(`   Line ${line}: ${pattern}`);
                    console.log(`   Code: ${codeSnippet}`);
                    console.log(`   Fix:  ${fix}`);
                });
            });
        }

        // Print warnings
        if (warnings.length > 0) {
            console.log(`\n\n⚠️  WARNINGS (${warnings.length}):`);
            console.log('These should be reviewed and updated:\n');

            const byFile = this.groupByFile(warnings);
            Object.keys(byFile).forEach(file => {
                console.log(`\n📄 ${file}`);
                byFile[file].forEach(({line, pattern, fix, codeSnippet}) => {
                    console.log(`   Line ${line}: ${pattern}`);
                    console.log(`   Code: ${codeSnippet}`);
                    console.log(`   Recommendation: ${fix}`);
                });
            });
        }

        // Summary
        console.log('\n' + '='.repeat(80));
        console.log('SUMMARY');
        console.log('='.repeat(80));
        console.log(`Total Issues Found: ${this.findings.length}`);
        console.log(`  - Critical (must fix): ${errors.length}`);
        console.log(`  - Warnings (should fix): ${warnings.length}`);

        if (errors.length > 0) {
            console.log('\n❌ Fix critical issues before proceeding with upgrade.');
        } else if (warnings.length > 0) {
            console.log('\n✅ No blocking issues, but review warnings.');
        } else {
            console.log('\n✅ All clear for Realm v12 upgrade!');
        }
    }

    /**
     * Group findings by file
     */
    groupByFile(findings) {
        const byFile = {};
        findings.forEach(finding => {
            if (!byFile[finding.file]) {
                byFile[finding.file] = [];
            }
            byFile[finding.file].push(finding);
        });
        return byFile;
    }
}

// Main execution
const srcDir = process.argv[2] || path.join(__dirname, 'src');
const checker = new BreakingChangesChecker(srcDir);
const passed = checker.check();

process.exit(passed ? 0 : 1);
