export interface UserSession {
  sessionId: string;
  userId: string;
  loginTime: string | Date;
  lastActivity: string | Date;
  deviceInfo?: string;
}
