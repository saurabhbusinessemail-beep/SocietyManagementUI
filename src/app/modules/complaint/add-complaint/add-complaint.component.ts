import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { IFlat, IUIControlConfig, IUIDropdownOption } from '../../../interfaces';
import { Location } from '@angular/common';
import { SocietyService } from '../../../services/society.service';
import { Subject, take, takeUntil } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { ComplaintService } from '../../../services/complaint.service';

@Component({
  selector: 'app-add-complaint',
  templateUrl: './add-complaint.component.html',
  styleUrl: './add-complaint.component.scss'
})
export class AddComplaintComponent implements OnInit, OnDestroy {

  societyId?: string;
  flatId?: string;
  flat?: IFlat;

  errorMessage = '';
  isComponentActive = new Subject<void>();

  titleConfig: IUIControlConfig = {
    id: 'title',
    label: 'Title',
    placeholder: 'Enter Title',
    validations: [
      { name: 'required', validator: Validators.required },
      { name: 'minlength', validator: Validators.minLength(3) }
    ],
    errorMessages: {
      required: 'Title is required',
      minlength: 'Minimum 3 characters required'
    }
  };
  descriptionConfig: IUIControlConfig = {
    id: 'description',
    label: 'Description',
    placeholder: 'Enter Description',
    validations: [
      { name: 'required', validator: Validators.required },
      { name: 'minlength', validator: Validators.minLength(3) }
    ],
    errorMessages: {
      required: 'Description is required',
      minlength: 'Minimum 3 characters required'
    }
  };
  priorityTabsConfig: IUIControlConfig = {
    id: 'priority',
    label: 'Priority'
  };
  complaintTypeTabsConfig: IUIControlConfig = {
    id: 'complaintType',
    label: 'Complaint Type'
  };
  flatSearchConfig: IUIControlConfig = {
    id: 'flat',
    label: 'Flat',
    placeholder: 'Select Flat',
  };
  errorConfig: IUIControlConfig = {
    id: 'error',
    label: '',
  };

  priorityOptions: IUIDropdownOption[] = [
    {
      value: 'low',
      label: 'Low'
    },
    {
      value: 'medium',
      label: 'Medium'
    },
    {
      value: 'high',
      label: 'High'
    },
    {
      value: 'urgent',
      label: 'Urgent'
    }
  ];
  complaintTypeOptions: IUIDropdownOption[] = [
    {
      value: 'Private',
      label: 'Private'
    },
    {
      value: 'Public',
      label: 'Public'
    },
  ];
  flatOptions: IUIDropdownOption[] = [];

  fb = new FormGroup({
    flat: new FormControl<IUIDropdownOption | undefined>(undefined),
    title: new FormControl<string>('New Complaint'),
    description: new FormControl<string>('New Complaint'),
    priority: new FormControl<string>('low'),
    complaintType: new FormControl<string>('Private'),
    status: new FormControl<string>('submitted'),
  });

  constructor(
    private societyService: SocietyService,
    private route: ActivatedRoute,
    private location: Location,
    private complaintService: ComplaintService
  ) { }

  ngOnInit(): void {
    this.societyId = this.route.snapshot.paramMap.get('id') ?? undefined;
    this.flatId = this.route.snapshot.paramMap.get('flatId') ?? undefined;

    if (this.flatId && !this.societyId) this.loadFlatDetails(this.flatId);

    this.loadAllMyFlats(this.societyId);
    this.fb.get('flat')?.valueChanges
      .pipe(takeUntil(this.isComponentActive))
      .subscribe({
        next: flat => {
          if (flat) {
            this.flatId = flat.value;
            this.loadFlatDetails(flat.value);
          }
          else this.flat = undefined;
        }
      });
  }

  loadFlatDetails(flatId: string) {
    this.societyService.getFlat(flatId)
      .pipe(take(1))
      .subscribe({
        next: response => {
          this.flat = response;
        }
      })
  }

  loadAllMyFlats(societyId?: string) {

    this.societyService.myFlats(societyId)
      .pipe(take(1))
      .subscribe(response => {
        if (!response.success) return;

        this.flatOptions = response.data.map(flatMember => this.societyService.convertFlatMemberToDropdownOption(flatMember));
        if (this.flatOptions.length === 1) {
          this.fb.get('flat')?.setValue(this.flatOptions[0]);
        }
        else if (this.flatId) {
          const flat = this.flatOptions.find(f => f.value === this.flatId);
          if (flat) this.fb.get('flat')?.setValue(flat);
        }
      });
  }

  cancel() {
    this.location.back();
  }

  save() {
    if (!this.fb.valid) return;

    const formValue = this.fb.value;
    const payload = {
      flatId: this.flatId,
      societyId: this.flat ? this.flat.societyId : this.societyId,
      title: formValue.title ?? '',
      description: formValue.description,
      priority: formValue.priority,
      complaintType: formValue.complaintType,
      status: formValue.status,
    };
    this.complaintService.newComplaint(payload)
      .pipe(take(1))
      .subscribe({
        next: response => {
          if (response.success) {
            this.cancel();
          } else {
            this.errorMessage = response.message ?? 'Failed to add complaint';
          }
        }
      });
  }

  ngOnDestroy(): void {
    this.isComponentActive.next();
    this.isComponentActive.complete();
  }
}
