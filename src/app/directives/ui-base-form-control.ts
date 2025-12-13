import { Directive, Input, OnChanges, SimpleChanges } from '@angular/core';
import { AbstractControl, ValidatorFn } from '@angular/forms';
import { UIFormControlAdapter } from './ui-form-control-adapter';
import { UIControlConfig } from '../interfaces';

@Directive()
export abstract class UIBaseFormControl<T>
    extends UIFormControlAdapter<T>
    implements OnChanges {

    @Input() config?: UIControlConfig;

    get required(): boolean {
        return this.config?.validations?.some(v => v.name === 'required') ?? false;
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['config']) {
            this.applyValidators();
        }
    }

    protected applyValidators(): void {
        const control = this.control;
        if (!control) return;

        const validators: ValidatorFn[] =
            this.config?.validations?.map(v => v.validator) ?? [];

        control.setValidators(validators);
        control.updateValueAndValidity({ emitEvent: false });
    }

    get control(): AbstractControl | null {
        return this.ngControl?.control ?? null;
    }

    get errors(): Record<string, any> | null {
        return this.control?.errors ?? null;
    }

    get errorKeys(): string[] {
        return this.errors ? Object.keys(this.errors) : [];
    }

    get invalid(): boolean {
        return !!(this.control && this.control.invalid && this.control.touched);
    }

    updateValue(value: T): void {
        this.value = value;
        this.onChange(value);
        this.onTouched();
    }
}
