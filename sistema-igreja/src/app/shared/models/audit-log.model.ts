export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'LOGOUT';
  module: 'members' | 'finance' | 'events' | 'cells' | 'ministries' | 'users' | 'auth' | 'pastor' | 'media';
  entityId?: string;
  entityName?: string;
  description: string;
  changes?: {
    before?: any;
    after?: any;
  };
  timestamp: string;
  ipAddress?: string;
}

export interface AuditLogFilters {
  userId?: string;
  module?: string;
  action?: string;
  startDate?: string;
  endDate?: string;
}
