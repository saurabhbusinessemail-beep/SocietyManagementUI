export interface UIOption<T = any> {
    id: T;
    label: string;

    disabled?: boolean;
    hidden?: boolean;

    icon?: string;
    description?: string;

    meta?: Record<string, any>; // backend extensibility
}
