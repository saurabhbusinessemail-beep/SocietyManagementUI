import { ControlValueAccessor, NgControl } from '@angular/forms';
import { Directive, Optional, Self } from '@angular/core';

@Directive()
export abstract class UIFormControlAdapter<T>
    implements ControlValueAccessor {

    value!: T | null;
    disabled = false;

    protected onChange: (value: T | null) => void = () => { };
    protected onTouched: () => void = () => { };

    constructor(
        @Optional() @Self() public ngControl: NgControl
    ) {
        if (this.ngControl) {
            this.ngControl.valueAccessor = this;
        }
    }

    writeValue(value: T | null): void {
        this.value = value;
    }

    registerOnChange(fn: any): void {
        this.onChange = fn;
    }

    registerOnTouched(fn: any): void {
        this.onTouched = fn;
    }

    setDisabledState(isDisabled: boolean): void {
        this.disabled = isDisabled;
    }
}
