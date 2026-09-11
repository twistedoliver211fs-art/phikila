/**
 * Decimal Service Layer
 *
 * Centralized business logic services. Every service function follows:
 *   1. Validate input
 *   2. Check RBAC permission
 *   3. Check subscription entitlement
 *   4. Check usage limits
 *   5. Perform database operation
 *   6. Emit domain event
 *   7. Create audit log
 *   8. Return result
 */

export { getSchoolContext, requireSchoolContext, setActiveSchool, validateSchoolAccess } from "./tenant";
export { hasPermission, requirePermission, getUserPermissions } from "./rbac";
export { emitEvent, getEvents, getEventsByResource } from "./events";
export { logAudit, getAuditLogs } from "./audit";
export { isFeatureEnabled, requireFeature, getEnabledFeatures, setSchoolFeature } from "./features";
export { getInvoices, getInvoiceById, createInvoice, updateInvoicePayment, getInvoicesByStudent } from "./invoice";
export { getLedgerByStudent, createLedgerEntry, getStudentBalance } from "./ledger";
export { getReceipts, getReceiptById, getReceiptByPaymentId, getReceiptsByStudent, createReceipt } from "./receipt";
export { getMessages, getUnreadCount, sendMessage, getConversations, createConversation, getConversationMessages } from "./message";
export { getPreferences, updatePreference, shouldNotify, getEnabledEventsForUser, setDefaultPreferences } from "./notification";
export { getChildrenForParent, getParentsForStudent, linkParentToStudent, unlinkParentFromStudent, getStudentAttendanceForParent, getStudentFeesForParent } from "./parent";
export { getReportCards, getReportCardById, getReportCardsByStudent, generateReportCard } from "./reportcard";
export { getDashboardStats, getEnrollmentTrend, getAttendanceTrend, getRevenueTrend, getClassPerformance } from "./analytics";
export { parseCSV, importStudents, importStaff, importFees } from "./import";
export { getDocuments, getDocumentById, createDocument, updateDocument, deleteDocument, getCategories, createCategory } from "./document";
export { getApiKeys, createApiKey, revokeApiKey, validateApiKey, getWebhookEndpoints, createWebhookEndpoint, deleteWebhookEndpoint, getWebhookDeliveries } from "./apikey";
export { getSystemSettings, updateSystemSetting, getPlatformStats, getSchoolsWithStats, toggleMaintenanceMode } from "./platform";
