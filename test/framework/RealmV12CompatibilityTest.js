/**
 * Schema and Wrapper Compatibility Tests
 */

import RealmListProxy from '../../src/framework/RealmListProxy';
import Individual from '../../src/Individual';
import SyncError from '../../src/error/SyncError';

describe('Schema Validation', () => {
  test('All schemas loadable', () => {
    const Schema = require('../../src/Schema').default;
    const config = Schema.getInstance().getRealmConfig();
    expect(config.schema.length).toBeGreaterThan(0);
  });

  test('List properties have objectType', () => {
    const Schema = require('../../src/Schema').default;
    const config = Schema.getInstance().getRealmConfig();
    const issues = [];
    config.schema.forEach(s => {
      Object.entries(s.properties).forEach(([k, v]) => {
        if (v.type === 'list' && !v.objectType) issues.push(`${s.name}.${k}`);
      });
    });
    expect(issues).toEqual([]);
  });
});

describe('Wrapper Pattern', () => {
  test('Individual wrapper', () => {
    const ind = new Individual();
    expect(ind.that).toBeDefined();
  });

  test('RealmListProxy extends Array', () => {
    const list = new RealmListProxy([]);
    expect(Array.isArray(list)).toBe(true);
  });

  test('SyncError prototype chain', () => {
    const err = new SyncError('CODE', 'msg');
    expect(err).toBeInstanceOf(Error);
    expect(err.errorCode).toBe('CODE');
  });
});
