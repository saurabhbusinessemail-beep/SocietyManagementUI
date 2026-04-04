import { Observable, of } from "rxjs";
import { share, take } from "rxjs/operators";
import { GLOBAL_CACHE } from "../services/cache.service";
import { ICacheableOptions } from "../interfaces";

export function Cacheable(options: ICacheableOptions = {}) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    const cacheService = GLOBAL_CACHE;
    const methodName = `${target.constructor.name}.${propertyKey}`;

    // default value for sharing observable is true
    options.share = options.share ?? { shareSameObservableUntilComplete: true };

    // Configure parameter indices for caching
    const paramIndices = options.paramIndices ??
      Array.from({ length: originalMethod.length }, (_, i) => i);

    // Group methods if specified
    if (options.group) {
      cacheService.groupMethods(options.group, [methodName]);
    }

    descriptor.value = function (...args: any[]): Observable<any> {
      // Generate cache key
      let cacheKey: string;

      if (options.keyGenerator) {
        cacheKey = options.keyGenerator(methodName, args);
      } else {
        // Build key with specified parameters
        const relevantParams = paramIndices.map(index => {
          const param = args[index];

          // Handle complex objects with specific keys
          if (options.paramKeys && options.paramKeys[index]) {
            const keys = options.paramKeys[index];
            const extracted: any = {};
            keys.forEach(key => {
              if (param && typeof param === 'object' && key in param) {
                extracted[key] = param[key];
              }
            });
            return extracted;
          }

          return param;
        });

        cacheKey = `${methodName}_${JSON.stringify(relevantParams)}`;
      }

      // Check cache
      const cached = cacheService.get(cacheKey);
      if (cached !== null) {
        // console.log(`[Cache] HIT: ${cacheKey}`);
        // Return cached data as Observable
        return of(cached);
      }

      const shareConfig = options.share;
      const shouldShare = shareConfig?.shareSameObservableUntilComplete === true;

      // 2. If sharing is enabled, check for pending observable
      if (shouldShare) {
        const pending = cacheService.getPendingObservable(cacheKey);
        if (pending) {
          return pending;
        }
      }

      // 3. Execute original method
      const result = originalMethod.apply(this, args);

      // Handle non‑Observable results (Promise or plain value)
      if (!(result instanceof Observable)) {
        // For plain values we can still cache them
        if (result !== undefined && result !== null) {
          cacheService.set(cacheKey, result, args);
        }
        return result;
      }

      // 4. Observable result – apply sharing if requested
      if (shouldShare) {
        // Create a shared observable (multicast) without replay
        const shared = result.pipe(share());
        // Store it as pending BEFORE returning so subsequent calls can use it
        cacheService.setPendingObservable(cacheKey, shared);

        // Subscribe once to cache the final value and clean up pending
        shared.pipe(take(1)).subscribe({
          next: (data) => {
            cacheService.set(cacheKey, data, args);
          },
          error: () => {
            cacheService.removePendingObservable(cacheKey);
          },
          complete: () => {
            cacheService.removePendingObservable(cacheKey);
          }
        });

        return shared;
      } else {
        // Original behaviour: wrap and cache on subscription
        return new Observable(observer => {
          result.subscribe({
            next: (data) => {
              cacheService.set(cacheKey, data, args);
              observer.next(data);
            },
            error: (err) => observer.error(err),
            complete: () => observer.complete()
          });
        });
      }
    };

    return descriptor;
  };
}