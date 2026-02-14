export interface ICacheConfig {
    // ttl?: number; // Time to live in milliseconds
    maxSize?: number; // Maximum entries for this cache
}

export interface ICacheEntry<T = any> {
    data: T;
    timestamp: number;
    params: any;
    // ttl: number;
}

export interface ICacheableOptions {
    /** Time to live in milliseconds (default: 5 minutes) */
    ttl?: number;
    /** Indices of parameters to use for caching (default: all) */
    paramIndices?: number[];
    /** For complex objects, specify which keys to use for cache key */
    paramKeys?: { [paramIndex: number]: string[] };
    /** Group name for bulk cache invalidation */
    group?: string;
    /** Maximum number of entries for this method's cache */
    maxSize?: number;
    /** Custom cache key generator */
    keyGenerator?: (methodName: string, args: any[]) => string;
}

export interface InvalidateCacheOptions {
    /** Methods to invalidate (can include wildcards) */
    methods: string[];
    /** Group names to invalidate */
    groups?: string[];
    /** Parameters to match for selective invalidation */
    matchParams?: boolean;
    /** Parameter indices to use for matching */
    paramIndices?: number[];
    /** Custom invalidation logic */
    shouldInvalidate?: (cacheKey: string, methodArgs: any[]) => boolean;
}