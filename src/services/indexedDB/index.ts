/**
 * IndexedDB Services
 *
 * Database and CRUD services for project storage.
 */

// Database
export {
  openDatabase,
  closeDatabase,
  getStore,
  promisifyRequest,
  getDatabaseInstance,
} from './database';

// Project service
export { projectService } from './projectService';

// Bitmap service
export { bitmapService } from './bitmapService';

// Storage quota
export {
  estimateStorageQuota,
  checkQuotaWarning,
  QUOTA_WARNING_THRESHOLD,
} from './storageQuota';
export type { QuotaWarningResult } from './storageQuota';
