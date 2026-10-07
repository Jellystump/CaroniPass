export interface TelemetriaPayload {
    readonly sessionId: string;
    readonly userId: string;
    readonly eventName: string;
    readonly timestamp: number;
    readonly category: 'user_action' | 'system_event' | 'performance' | 'error';
    readonly properties: Record<string, string | number | boolean | null>;
    readonly context: {
        readonly appVersion: string;
        readonly platform: 'web' | 'ios' | 'android' | 'desktop';
        readonly userAgent?: string;
        readonly locale: string;
        readonly networkType?: 'wifi' | 'cellular' | 'ethernet' | 'unknown';
    }
}