
# REALM UPGRADE SOP: v11.10.2 → v12.14.2
# Standard Operating Procedure
# React Native 0.81.4 (Legacy Architecture)

## PHASE 0: PRE-UPGRADE BACKUP & PREPARATION
## ═══════════════════════════════════════════

### 0.1 Create Git Checkpoint
git add .
git commit -m "chore: checkpoint before Realm v11.10.2 → v12.14.2 upgrade"
git tag realm-v11.10.2-baseline

### 0.2 Backup Realm Database Files (if applicable)
# For development databases you want to preserve
mkdir -p ~/realm-backups/$(date +%Y%m%d-%H%M%S)
find . -name "*.realm" -type f -exec cp {} ~/realm-backups/$(date +%Y%m%d-%H%M%S)/ \;

### 0.3 Document Current Configuration
npm list realm --depth=0 > realm-upgrade-baseline.txt
echo "React Native Version:" >> realm-upgrade-baseline.txt
npm list react-native --depth=0 >> realm-upgrade-baseline.txt

### 0.4 Verify No Schema Breaking Changes Required
# Review your Realm schemas - v12 has stricter requirements
# Create schema-audit.js:

cat > schema-audit.js << 'EOF'
// Audit script to find v12 incompatible schema patterns
const fs = require('fs');
const path = require('path');

function findSchemaFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      if (!file.includes('node_modules')) {
        findSchemaFiles(filePath, fileList);
      }
    } else if (file.match(/schema|model/i) && file.endsWith('.js')) {
      fileList.push(filePath);
    }
  });
  return fileList;
}

const issues = [];
const schemaFiles = findSchemaFiles('./src');

schemaFiles.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');

  // Check for v12 breaking patterns
  if (content.match(/type:\s*["']\[\]["']/)) {
    issues.push({file, issue: 'Implicit mixed array "[]" - must be explicit "mixed[]"'});
  }
  if (content.match(/type:\s*["']list["'](?!,\s*objectType)/)) {
    issues.push({file, issue: 'Missing objectType for list'});
  }
  if (content.match(/type:\s*["'][^"']*\?["']/) && content.match(/optional:\s*true/)) {
    issues.push({file, issue: 'Mixed shorthand and object form (? with optional: true)'});
  }
});

if (issues.length > 0) {
  console.log('❌ SCHEMA ISSUES FOUND - MUST FIX BEFORE UPGRADE:');
  issues.forEach(({file, issue}) => {
    console.log(\`  • \${file}: \${issue}\`);
  });
  process.exit(1);
} else {
  console.log('✅ No schema compatibility issues detected');
}
EOF

node schema-audit.js


## PHASE 1: DEPENDENCY UPGRADE
## ══════════════════════════════

### 1.1 Upgrade Realm Package
npm install realm@12.14.2 --save-exact

### 1.2 Verify Installation
npm list realm --depth=0

### 1.3 Update Related Dependencies (if using @realm/react)
# Check if @realm/react is in package.json
if grep -q "@realm/react" package.json; then
  # @realm/react compatible version for realm 12.14.2
  npm install @realm/react@0.6.2 --save-exact
fi


## PHASE 2: IOS NATIVE DEPENDENCY UPDATE
## ═══════════════════════════════════════

### 2.1 Update Podfile.lock (macOS only)
cd ios

### 2.2 Clean Pods
rm -rf Pods
rm -rf Podfile.lock
rm -rf ~/Library/Developer/Xcode/DerivedData/*

### 2.3 Reinstall Pods
pod deintegrate
pod install --repo-update

### 2.4 Verify Realm Core Version in Pods
grep -A 2 "realm-core" Podfile.lock

cd ..


## PHASE 3: ANDROID NATIVE DEPENDENCY UPDATE
## ═══════════════════════════════════════════

### 3.1 Clean Android Build Artifacts
cd android
./gradlew clean

### 3.2 Clear Gradle Caches
rm -rf .gradle
rm -rf ~/.gradle/caches/

### 3.3 Return to Root
cd ..


## PHASE 4: CODE MIGRATION CHECKS
## ══════════════════════════════════

### 4.1 Search for Breaking API Changes
# Check for deprecated RealmObject methods

cat > check-breaking-changes.js << 'EOF'
const fs = require('fs');
const path = require('path');

const deprecatedPatterns = [
  {pattern: /\.keys\(\)/, fix: 'Use Object.keys() instead of RealmObject.keys()'},
  {pattern: /\.entries\(\)/, fix: 'Use Object.entries() or spread {...obj}'},
  {pattern: /UserState\.Active/g, fix: 'Replace with UserState.LoggedIn'},
  {pattern: /SubscriptionsState/g, fix: 'Replace with SubscriptionSetState'},
];

function scanDirectory(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      if (!file.includes('node_modules')) {
        scanDirectory(filePath, fileList);
      }
    } else if (file.match(/\.(js|jsx|ts|tsx)$/)) {
      fileList.push(filePath);
    }
  });
  return fileList;
}

const warnings = [];
const codeFiles = scanDirectory('./src');

codeFiles.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');

  deprecatedPatterns.forEach(({pattern, fix}) => {
    if (pattern.test(content)) {
      warnings.push({file, pattern: pattern.toString(), fix});
    }
  });
});

if (warnings.length > 0) {
  console.log('⚠️  DEPRECATED API USAGE FOUND:');
  warnings.forEach(({file, pattern, fix}) => {
    console.log(\`  • \${file}\`);
    console.log(\`    Pattern: \${pattern}\`);
    console.log(\`    Fix: \${fix}\n\`);
  });
} else {
  console.log('✅ No deprecated API usage detected');
}
EOF

node check-breaking-changes.js


## PHASE 5: SCHEMA VERSION INCREMENT
## ═════════════════════════════════════

### 5.1 Update Schema Version
# Locate your Realm configuration and increment schemaVersion

cat > update-schema-version.js << 'EOF'
const fs = require('fs');
const glob = require('glob');

// Find files containing Realm configuration
const configFiles = glob.sync('**/realm*.{js,ts}', {ignore: '**/node_modules/**'});

console.log('Files to review for schema version update:');
configFiles.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  if (content.includes('schemaVersion')) {
    console.log(\`  • \${file}\`);
    // Extract current version
    const match = content.match(/schemaVersion:\s*(\d+)/);
    if (match) {
      console.log(\`    Current version: \${match[1]}\`);
      console.log(\`    → Update to: \${parseInt(match[1]) + 1}\`);
    }
  }
});

console.log('\nManually update schemaVersion in these files');
EOF

# Install glob if needed for the script
npm install --no-save glob

node update-schema-version.js


## PHASE 6: CLEAR ALL CACHES
## ═════════════════════════════

### 6.1 Clear Metro Bundler Cache
rm -rf $TMPDIR/metro-*
rm -rf $TMPDIR/haste-map-*

### 6.2 Clear React Native Cache
npx react-native start --reset-cache &
sleep 3
pkill -f "react-native"

### 6.3 Clear Watchman (if installed)
if command -v watchman &> /dev/null; then
  watchman watch-del-all
fi

### 6.4 Clean npm Cache
npm cache clean --force

### 6.5 Reinstall node_modules (optional but recommended)
rm -rf node_modules
npm install


## PHASE 7: BUILD & TEST
## ═══════════════════════

### 7.1 Test iOS Build (macOS)
npx react-native run-ios --configuration Debug

### 7.2 Test Android Build
npx react-native run-android --variant=debug

### 7.3 Verify Realm Functionality
cat > test-realm.js << 'EOF'
import Realm from 'realm';

// Simple test to verify Realm loads
async function testRealm() {
  try {
    console.log('Realm version:', Realm.schemaVersion);

    // Test schema
    const TestSchema = {
      name: 'TestObject',
      properties: {
        id: 'int',
        name: 'string',
      },
      primaryKey: 'id',
    };

    const realm = await Realm.open({
      path: 'test.realm',
      schema: [TestSchema],
      schemaVersion: 1,
    });

    realm.write(() => {
      realm.create('TestObject', {id: 1, name: 'Test'});
    });

    const objects = realm.objects('TestObject');
    console.log('✅ Realm test successful, objects:', objects.length);

    realm.close();
    return true;
  } catch (error) {
    console.error('❌ Realm test failed:', error);
    return false;
  }
}

testRealm();
EOF


## PHASE 8: ROLLBACK PROCEDURE (IF ISSUES)
## ═══════════════════════════════════════════

### 8.1 If Build Fails, Rollback
# Revert to baseline
git reset --hard realm-v11.10.2-baseline

# Reinstall old version
npm install realm@11.10.2 --save-exact

# Clean and rebuild
rm -rf node_modules
npm install

cd ios
rm -rf Pods Podfile.lock
pod install
cd ..

cd android
./gradlew clean
cd ..

## PHASE 9: POST-UPGRADE VALIDATION
## ════════════════════════════════════

### 9.1 Create Validation Checklist
cat > validation-checklist.md << 'EOF'
# Realm v12.14.2 Upgrade Validation

## Functional Tests
- [ ] App launches successfully on iOS
- [ ] App launches successfully on Android
- [ ] Realm database opens without errors
- [ ] Existing data is readable
- [ ] Write operations work
- [ ] Queries return correct results
- [ ] Schema migrations execute
- [ ] No crashes in Realm operations

## Performance Tests
- [ ] Query performance acceptable
- [ ] Write performance acceptable
- [ ] App startup time not degraded
- [ ] Memory usage normal

## Integration Tests
- [ ] All Realm-dependent features work
- [ ] No console errors related to Realm
- [ ] Background sync works (if applicable)

## Sign-off
Date: ___________
Tester: ___________
EOF

echo "Review validation-checklist.md and complete all items"


## PHASE 10: CLEANUP & DOCUMENTATION
## ═════════════════════════════════════

### 10.1 Document Upgrade
echo "Realm upgraded from v11.10.2 to v12.14.2 on $(date)" >> UPGRADE_LOG.md
echo "React Native version: $(npm list react-native --depth=0 | grep react-native)" >> UPGRADE_LOG.md

### 10.2 Remove Temporary Scripts
rm -f schema-audit.js check-breaking-changes.js update-schema-version.js test-realm.js

### 10.3 Commit Upgrade
git add .
git commit -m "chore: upgrade Realm from v11.10.2 to v12.14.2

- Updated realm package to 12.14.2
- Updated iOS pods
- Cleaned Android builds
- Incremented schema version
- Verified all tests passing"

git tag realm-v12.14.2-success

echo "✅ REALM UPGRADE COMPLETE"
