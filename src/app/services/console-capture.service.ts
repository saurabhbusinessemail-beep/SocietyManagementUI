import { Injectable, NgZone } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ConsoleCaptureService {
    logs: { method: string, message: any }[] = [];

    constructor(private zone: NgZone) {
        this.hijackConsole();
    }

    private hijackConsole() {
        const methods: (keyof Console)[] = ['log', 'warn', 'error', 'info'];

        methods.forEach(method => {
            const original = console[method];

            console[method] = (...args: any[]) => {
                original.apply(console, args);

                this.zone.run(() => {
                    const message = {args}
                    // `[${method.toUpperCase()}] ${args
                    //     .map(a => (typeof a === 'object' ? JSON.stringify(a) : a))
                    //     .join(' ')}`;

                    this.logs.push({method,message});

                    // limit memory
                    if (this.logs.length > 500) {
                        this.logs.shift();
                    }
                });
            };
        });
    }

    getText(): string {
        return this.logs.join('\n');
    }

    clear() {
        this.logs = [];
    }
}
