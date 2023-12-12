import SyncError from './SyncError';

class IgnorableSyncError extends SyncError {

  constructor(code, message, fileName, lineNumber) {
    super(code, message, fileName, lineNumber);
  }
}

export default IgnorableSyncError;