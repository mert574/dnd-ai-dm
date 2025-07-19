import { H3Error } from 'h3';

// Standard API response format
export interface ApiResponse<T = unknown> {
    success: boolean;
    data?: T;
    error?: {
        code: string;
        message: string;
        details?: unknown;
    };
}

// API Error codes
export enum ApiErrorCode {
    BAD_REQUEST = 'BAD_REQUEST',
    UNAUTHORIZED = 'UNAUTHORIZED',
    FORBIDDEN = 'FORBIDDEN',
    NOT_FOUND = 'NOT_FOUND',
    INTERNAL_ERROR = 'INTERNAL_ERROR',
    VALIDATION_ERROR = 'VALIDATION_ERROR'
}

// HTTP Status codes mapping
export const HTTP_STATUS = {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    INTERNAL_ERROR: 500
} as const;

// Custom API error class
export class ApiError extends H3Error {
    constructor(
        code: ApiErrorCode,
        message: string,
        statusCode: number = HTTP_STATUS.INTERNAL_ERROR,
        details?: unknown
    ) {
        super(message);
        this.statusCode = statusCode;
        this.data = {
            code,
            message,
            details
        };
    }
}

// Success response helper
export function successResponse<T>(data: T, _statusCode: number = HTTP_STATUS.OK): ApiResponse<T> {
    return {
        success: true,
        data
    };
}

// Error response helper
export function errorResponse(
    code: ApiErrorCode,
    message: string,
    details?: unknown
): ApiResponse {
    return {
        success: false,
        error: {
            code,
            message,
            details
        }
    };
}

// Common error creators
export const apiErrorCreators = {
    badRequest: (message: string, details?: unknown) => 
        new ApiError(ApiErrorCode.BAD_REQUEST, message, HTTP_STATUS.BAD_REQUEST, details),
    
    unauthorized: (message = 'Unauthorized') => 
        new ApiError(ApiErrorCode.UNAUTHORIZED, message, HTTP_STATUS.UNAUTHORIZED),
    
    forbidden: (message = 'Forbidden') => 
        new ApiError(ApiErrorCode.FORBIDDEN, message, HTTP_STATUS.FORBIDDEN),
    
    notFound: (message = 'Not Found') => 
        new ApiError(ApiErrorCode.NOT_FOUND, message, HTTP_STATUS.NOT_FOUND),
    
    internal: (message = 'Internal Server Error') => 
        new ApiError(ApiErrorCode.INTERNAL_ERROR, message, HTTP_STATUS.INTERNAL_ERROR),
    
    validation: (message: string, details?: unknown) => 
        new ApiError(ApiErrorCode.VALIDATION_ERROR, message, HTTP_STATUS.BAD_REQUEST, details)
}; 