# Realm v12 Schema Migration Plan for openchs-models

**Package:** openchs-models v1.32.54  
**Scope:** Models library (consumed by React Native apps)  
**Goal:** Update Realm schema definitions from v11 to v12 syntax

## Overview

This package provides data models consumed by Realm-based apps. We need to update schema definitions to be compatible with Realm v12, which requires explicit object type declarations.

---

## Phase-by-Phase Execution Plan

### ✅ Phase 0: Backup & Preparation (COMPLETE)

**Status:** Script created, ready to execute
- ✅ Git checkpoint script created: `realm-upgrade-sop.sh`
- ✅ Schema migration script created: `migrate-realm-schema.js`

**Actions Needed:**
```bash
git add .
git commit -m "chore: checkpoint before Realm v12 schema migration"
git tag realm-schema-v11-baseline
```

---

### 🔧 Phase 1: Schema Audit (IN PROGRESS)

**Goal:** Identify all patterns that need migration

**Script Status:** Need to create comprehensive audit

**Expected Changes:**
- 36 files will be modified
- 73 schema property definitions to update

**Key Patterns to Fix:**
1. `propertyName: "ObjectType"` → `propertyName: { type: 'object', objectType: 'ObjectType' }`
2. `propertyName: {type: "ObjectType", optional: true}` → `propertyName: { type: 'object', objectType: 'ObjectType', optional: true }`

**Files Affected (Sample):**
- `Settings.js` - locale property
- `Individual.js` - subjectType, gender, lowestAddressLevel, etc.
- `Encounter.js`, `ProgramEnrolment.js`, `FormElement.js`, etc.

---

### 🔍 Phase 2: Pre-Migration Validation

**Create audit scripts to verify:**

1. **Schema Compatibility Audit** (from SOP)
   - Check for implicit mixed arrays
   - Check for lists without objectType
   - Verify no mixed shorthand syntax

2. **Breaking Changes Check** (from SOP)
   - Scan for `.keys()` usage
   - Scan for `.entries()` usage
   - Check for `UserState.Active`

3. **Custom Audit for Our Codebase**
   - Verify all object references follow v11 patterns
   - Identify any edge cases

---

### 🚀 Phase 3: Execute Migration

**Steps:**

1. **Dry Run First:**
   ```bash
   node migrate-realm-schema.js
   ```
   Review output carefully

2. **Apply Changes:**
   ```bash
   node migrate-realm-schema.js --apply
   ```

3. **Verify Changes:**
   ```bash
   git diff
   ```

---

### ✅ Phase 4: Post-Migration Validation

**Validation Steps:**

1. **Build Test:**
   ```bash
   npm run build
   ```
   Verify transpilation works

2. **Unit Tests:**
   ```bash
   npm test
   ```

3. **Manual Schema Review:**
   - Spot check modified files
   - Verify common patterns (Individual.js, Settings.js)
   - Check nested schemas (FormElement.js)

4. **TypeScript Compilation:**
   ```bash
   npm run build  # Includes tsc
   ```

---

### 📦 Phase 5: Package Publishing

**Pre-publish Checklist:**

- [ ] All tests passing
- [ ] Build successful
- [ ] Version bumped appropriately
- [ ] CHANGELOG.md updated
- [ ] Migration documented

**Version Strategy:**
- **Minor version bump** (1.32.54 → 1.33.0) if backward compatible
- **Major version bump** (1.32.54 → 2.0.0) if breaking changes for consumers

**Publish:**
```bash
npm version minor -m "feat: update Realm schemas to v12 syntax"
npm publish
```

---

### 📝 Phase 6: Documentation

**Update:**

1. **README.md** - Note Realm v12+ compatibility
2. **CHANGELOG.md** - Document schema changes
3. **Migration guide** for consuming apps

**Sample CHANGELOG Entry:**
```markdown
## [1.33.0] - 2025-10-10

### Changed
- Updated all Realm schema definitions to v12 syntax
- Object type references now use explicit `{ type: 'object', objectType: 'TypeName' }` format
- **Breaking:** Consuming apps must use Realm v12+

### Migration for Consuming Apps
Apps using this package must upgrade to Realm v12+ to consume this version.
See migration guide: [REALM_MIGRATION_GUIDE.md](./REALM_MIGRATION_GUIDE.md)
```

---

### 🔄 Phase 7: Rollback Plan (If Needed)

**If issues discovered:**

```bash
# Revert to baseline
git reset --hard realm-schema-v11-baseline

# Reinstall dependencies
npm install

# Rebuild
npm run build
```

---

## Script Inventory

| Script | Purpose | Status |
|--------|---------|--------|
| `migrate-realm-schema.js` | Main migration script | ✅ Created |
| `realm-upgrade-sop.sh` | Full SOP reference | ✅ Created |
| `schema-audit.js` | Pre-migration audit | ⏳ To create |
| `check-breaking-changes.js` | API deprecation check | ⏳ To create |
| `validate-schemas.js` | Post-migration validation | ⏳ To create |

---

## Critical Differences from Full SOP

**Not Applicable to This Package:**
- ❌ iOS/Android native updates (no mobile code)
- ❌ Realm dependency upgrade (consumed by apps)
- ❌ Schema version increment (handled by consuming apps)
- ❌ Pod/Gradle updates (no native code)

**Applicable:**
- ✅ Schema syntax migration
- ✅ Schema audit
- ✅ Build/test validation
- ✅ Documentation
- ✅ Version management

---

## Next Immediate Actions

1. **Create audit scripts** (Phase 2)
2. **Run dry-run migration** (Phase 3.1)
3. **Review output** (Phase 3.3)
4. **Execute if validated** (Phase 3.2)

---

## Risk Assessment

**Low Risk:**
- Schema syntax changes are mechanical
- No logic changes
- Backward compatible syntax (v12 understands new format)

**Mitigation:**
- Git checkpoint before changes
- Dry run first
- Comprehensive testing
- Controlled rollout to consuming apps

---

## Success Criteria

- [ ] All 73 schema definitions updated
- [ ] Build passes
- [ ] Tests pass
- [ ] No TypeScript errors
- [ ] Git history clean
- [ ] Documentation updated
- [ ] Package version bumped
- [ ] Published successfully
