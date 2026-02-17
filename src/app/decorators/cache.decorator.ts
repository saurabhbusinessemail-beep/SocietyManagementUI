import { Observable, of } from "rxjs";
import { GLOBAL_CACHE } from "../services/cache.service";
import { ICacheableOptions } from "../interfaces";

export function Cacheable(options: ICacheableOptions = {}) {
    return function(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
      const originalMethod = descriptor.value;
      const cacheService = GLOBAL_CACHE;
      const methodName = `${target.constructor.name}.${propertyKey}`;
      
      // Configure parameter indices for caching
      const paramIndices = options.paramIndices ?? 
        Array.from({ length: originalMethod.length }, (_, i) => i);
      
      // Group methods if specified
      if (options.group) {
        cacheService.groupMethods(options.group, [methodName]);
      }
  
      descriptor.value = function(...args: any[]): Observable<any> {
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
  
        // Execute original method and cache its result
        // console.log(`[Cache] MISS: ${cacheKey}`);
        const result = originalMethod.apply(this, args);
        
        // If result is Observable, subscribe and cache the data
        if (result instanceof Observable) {
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
        
        // If result is not an Observable (like Promise or direct value), handle accordingly
        return result;
      };
  
      return descriptor;
    };
  }