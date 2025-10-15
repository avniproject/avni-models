# Realm v12 Upgrade Notes

## Required Changes

### 1. Dependencies (package.json)
- **Realm:** `11.23.0` → `12.14.2` (moved to devDependencies - consumers manage their own)
- **TypeScript:** `3.7.4` → `5.0.0` (devDependency - for build only)
- **Node.js:** `v10` → `v18+` (for avni-models development only)

### 2. TypeScript Config (tsconfig.json)
```json
"lib": ["es2020", "dom"]  // Changed from es2015 for BigInt, AsyncGenerator support
```

### 3. Node Version (.nvmrc)
```
v18  // Minimum required for Realm v12
```

## Validation

### Schema Validation
```bash
npm run validate:schemas
```
Critical checks:
- All `type: 'list'` must have `objectType`
- No implicit `"[]"` shorthand allowed

### Tests
```bash
npm run test:realm-v12
```

## Impact on Consumers

**No breaking changes for consuming projects:**
- Realm is devDependency (consumers control their own Realm version)
- Compiled output remains ES5-compatible
- Only avni-models development requires Node 18+

## Tested & Verified
- ✓ 86 schemas compatible with Realm v12
- ✓ Custom proxy wrappers work
- ✓ 1.4M+ observations migrated successfully
- ✓ Build/deploy to avni-client successful
