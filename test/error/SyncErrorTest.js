import {assert} from 'chai';
import IgnorableSyncError from '../../src/error/IgnorableSyncError';
import SyncError from '../../src/error/SyncError';

describe('SyncErrors', () => {
  it('validates that IgnorableSyncError is derived from SyncError ', () => {
    const ignorableSyncError = new IgnorableSyncError('code', 'msg');
    assert.isTrue(ignorableSyncError instanceof SyncError);
  });

  it('validates that IgnorableSyncError is an instance of type IgnorableSyncError', () => {
    const ignorableSyncError = new IgnorableSyncError('code', 'msg');
    assert.isTrue(ignorableSyncError instanceof IgnorableSyncError);
  });

  it('validates that Error is NOT an instance of type IgnorableSyncError', () => {
    const error = new Error();
    assert.isFalse(error instanceof IgnorableSyncError);
  });

  it('validates that SyncError is NOT an instance of type IgnorableSyncError', () => {
    const syncError = new SyncError('code', 'msg');
    assert.isFalse(syncError instanceof IgnorableSyncError);
  });

  it('validates that SyncError is an instance of SyncError ', () => {
    const syncError = new SyncError('code', 'msg');
    assert.isTrue(syncError instanceof SyncError);
  });
});