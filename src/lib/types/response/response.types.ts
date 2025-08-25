export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: unknown;
    message?: string;
}