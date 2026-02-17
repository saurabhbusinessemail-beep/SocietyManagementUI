import { Injectable } from "@angular/core";
import { ICacheEntry } from "../interfaces";

@Injectable({
    providedIn: 'root'
})
export class CacheService {
    private cache = new Map<string, ICacheEntry>();
    private methodGroups = new Map<string, Set<string>>();

    /**
     * Generate a cache key based on method name and relevant parameters
     */
    generateKey(methodName: string, params: any[], paramIndices: number[], paramKeys?: string[]): string {
        const relevantParams = paramIndices.map(index => {
            const param = params[index];

            // If it's a complex object and we have specific keys to use
            if (typeof param === 'object' && param !== null && paramKeys && paramKeys.length > 0) {
                const extracted: any = {};
                paramKeys.forEach(key => {
                    if (key in param) {
                        extracted[key] = param[key];
                    }
                });
                return extracted;
            }

            return param;
        });

        return `${methodName}_${JSON.stringify(relevantParams)}`;
    }

    /**
     * Set data in cache
     */
    set(key: string, data: any, params: any): void {
        const entry: ICacheEntry = {
            data,
            timestamp: Date.now(),
            params
        };

        this.cache.set(key, entry);
    }

    /**
     * Get data from cache if valid
     */
    get(key: string): any | null {
        const entry = this.cache.get(key);

        if (!entry) {
            return null;
        }

        // // Check if cache is still valid
        // if (Date.now() - entry.timestamp > entry.ttl) {
        //     this.cache.delete(key);
        //     return null;
        // }

        return entry.data;
    }

    /**
     * Clear specific cache entries
     */
    clear(methodPattern: string, params?: any): void {
        const pattern = new RegExp(methodPattern.replace('*', '.*'));

        for (const key of this.cache.keys()) {
            if (pattern.test(key)) {
                if (params) {
                    // If params provided, only clear if they match
                    try {
                        const keyParams = JSON.parse(key.substring(key.indexOf('_') + 1));
                        if (this.paramsMatch(keyParams, params)) {
                            this.cache.delete(key);
                        }
                    } catch {
                        this.cache.delete(key);
                    }
                } else {
                    this.cache.delete(key);
                }
            }
        }
    }

    /**
     * Group methods for easier cache invalidation
     */
    groupMethods(groupName: string, methodNames: string[]): void {
        if (!this.methodGroups.has(groupName)) {
            this.methodGroups.set(groupName, new Set());
        }

        const group = this.methodGroups.get(groupName);
        methodNames.forEach(name => group?.add(name));
    }

    /**
     * Clear all methods in a group
     */
    clearGroup(groupName: string): void {
        const methods = this.methodGroups.get(groupName);
        if (methods) {
            methods.forEach(method => {
                this.clear(method);
            });
        }
    }

    private paramsMatch(cachedParams: any, targetParams: any): boolean {
        // Implement parameter matching logic
        return JSON.stringify(cachedParams) === JSON.stringify(targetParams);
    }

    clearAll(): void {
        this.cache.clear();
    }
}

export const GLOBAL_CACHE = new CacheService();