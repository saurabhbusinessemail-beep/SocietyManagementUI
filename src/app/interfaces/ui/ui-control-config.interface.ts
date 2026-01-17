import { FormControl, ValidatorFn } from "@angular/forms";
import { ControlOrientation, ControlSize } from "../../types";
import { IUIDropdownOption } from "./ui-drop-down-option.interface";

export interface IUIControlConfig<T = any> {
    id: string;

    label?: string;
    placeholder?: string;
    helpText?: string;

    formControl?: FormControl<T>;
    validations?: UIValidationRule[];
    errorMessages?: {
        [validationKey: string]: string;
    };

    dropDownOptions?: IUIDropdownOption[];

    orientation?: ControlOrientation;
    size?: ControlSize;

    cssClass?: string | string[];
    testId?: string;
}

export interface UIValidationRule {
    name: string;              // required | minlength | maxlength | pattern | custom
    validator: ValidatorFn;    // Angular validator
  }

  