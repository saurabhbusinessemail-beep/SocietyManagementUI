export interface IUIDropdownOption<T = any> {
    label: string;
    value: T;
    disabled?: boolean;
}