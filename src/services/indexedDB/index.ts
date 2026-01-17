/**
 * IndexedDB Services
 *
 * Database and CRUD services for project storage.
 */

// Bitmap service
export { bitmapService } from './bitmapService';
// Database
export {
  closeDatabase,
  getDatabaseInstance,
  getStore,
  openDatabase,
  promisifyRequest,
} from './database';
// Project service
export { projectService } from './projectService';
export type { QuotaWarningResult } from './storageQuota';
// Storage quota
export {
  checkQuotaWarning,
  estimateStorageQuota,
  QUOTA_WARNING_THRESHOLD,
} from './storageQuota';
