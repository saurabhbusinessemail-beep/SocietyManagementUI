import { Observable } from "rxjs";
import { InvalidateCacheOptions } from "../interfaces";
import { CacheService } from "../services/cache.service";


export function InvalidateCache(options: InvalidateCacheOptions) {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        const originalMethod = descriptor.value;
        const cacheService = new CacheService(); // Inject properly in practice

        descriptor.value = function (...args: any[]): Observable<any> {
            // Execute the original method first
            const result = originalMethod.apply(this, args);

            // If result is Observable, invalidate cache after it completes
            if (result instanceof Observable) {
                return new Observable(observer => {
                    result.subscribe({
                        next: (data) => {
                            // Invalidate specified methods after successful response
                            if (options.methods) {
                                options.methods.forEach(methodPattern => {
                                    if (options.matchParams) {
                                        // Selective invalidation based on parameters
                                        const relevantParams = (options.paramIndices ?? [0])
                                            .map(index => args[index])
                                            .filter(p => p !== undefined);

                                        cacheService.clear(methodPattern, relevantParams);
                                    } else {
                                        // Clear all cache for these methods
                                        cacheService.clear(methodPattern);
                                    }
                                });
                            }

                            // Invalidate groups
                            if (options.groups) {
                                options.groups.forEach(group => {
                                    cacheService.clearGroup(group);
                                });
                            }

                            observer.next(data);
                        },
                        error: (err) => observer.error(err),
                        complete: () => observer.complete()
                    });
                });
            }

            // If result is not an Observable, return as is (though in HTTP services it should be Observable)
            return result;
        };

        return descriptor;
    };
}