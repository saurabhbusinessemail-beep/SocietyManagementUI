import { ValidatorFn } from "@angular/forms";
import { ControlOrientation, ControlSize } from "../../types";

export interface UIControlConfig {
    id: string;

    label?: string;
    placeholder?: string;
    helpText?: string;

    validations?: UIValidationRule[];
    errorMessages?: {
        [validationKey: string]: string;
    };

    orientation?: ControlOrientation;
    size?: ControlSize;

    cssClass?: string | string[];
    testId?: string;
}

export interface UIValidationRule {
    name: string;              // required | minlength | maxlength | pattern | custom
    validator: ValidatorFn;    // Angular validator
  }

  