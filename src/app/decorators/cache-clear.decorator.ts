import { Observable } from 'rxjs';
import { GLOBAL_CACHE } from '../services/cache.service';

export function ClearCache(
    groups?: string | string[] | { groups?: string | string[]; clearAll?: boolean }
) {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        const originalMethod = descriptor.value;
        const cacheService = GLOBAL_CACHE;

        descriptor.value = function (...args: any[]) {
            const result = originalMethod.apply(this, args);

            // If result is an Observable, clear cache after successful completion
            if (result instanceof Observable) {
                return new Observable(observer => {
                    result.subscribe({
                        next: (data) => {
                            performClear(groups, cacheService);
                            observer.next(data);
                        },
                        error: (err) => observer.error(err),
                        complete: () => observer.complete()
                    });
                });
            }

            // For non‑Observable results (promises, direct values), clear synchronously
            performClear(groups, cacheService);
            return result;
        };

        return descriptor;
    };
}

// Helper to interpret the different input formats
function performClear(
    groups: string | string[] | { groups?: string | string[]; clearAll?: boolean } | undefined,
    cacheService: any
) {
    if (!groups) return;  // nothing to clear

    // Case 1: direct string → single group
    if (typeof groups === 'string') {
        cacheService.clearGroup(groups);
        return;
    }

    // Case 2: array of strings → multiple groups
    if (Array.isArray(groups)) {
        groups.forEach(group => cacheService.clearGroup(group));
        return;
    }

    // Case 3: options object
    if (typeof groups === 'object') {
        if (groups.clearAll) {
            cacheService.clearAll();
        } else if (groups.groups) {
            const groupList = Array.isArray(groups.groups) ? groups.groups : [groups.groups];
            groupList.forEach(group => cacheService.clearGroup(group));
        }
    }
}