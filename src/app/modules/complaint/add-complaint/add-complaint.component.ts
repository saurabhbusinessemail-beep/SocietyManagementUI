import { Component, inject, Inject, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { IFlat, IUIControlConfig, IUIDropdownOption } from '../../../interfaces';
import { Location } from '@angular/common';
import { SocietyService } from '../../../services/society.service';
import { Subject, take, takeUntil } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { ComplaintService } from '../../../services/complaint.service';
import { PendingHttpService } from '../../../services/pending-http.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-add-complaint',
  templateUrl: './add-complaint.component.html',
  styleUrl: './add-complaint.component.scss'
})
export class AddComplaintComponent implements OnInit, OnDestroy {

  public societyService = inject(SocietyService);
  private route = inject(ActivatedRoute);
  private location = inject(Location);
  private complaintService = inject(ComplaintService);
  private pendingHttpService = inject(PendingHttpService);

  societyId?: string;
  flatId?: string;
  flat?: IFlat;

  errorMessage = '';
  isComponentActive = new Subject<void>();

  titleConfig!: IUIControlConfig;
  descriptionConfig!: IUIControlConfig;
  priorityTabsConfig!: IUIControlConfig;
  complaintTypeTabsConfig!: IUIControlConfig;
  flatSearchConfig!: IUIControlConfig;
  errorConfig!: IUIControlConfig;

  priorityOptions: IUIDropdownOption[] = [];
  complaintTypeOptions: IUIDropdownOption[] = [];
  flatOptions: IUIDropdownOption[] = [];

  fb = new FormGroup({
    flat: new FormControl<IUIDropdownOption | undefined>(undefined),
    title: new FormControl<string>('New Complaint'),
    description: new FormControl<string>('New Complaint'),
    priority: new FormControl<string>('low'),
    complaintType: new FormControl<string>('Private'),
    status: new FormControl<string>('submitted'),
  });

  initFormConfigs() {
    this.titleConfig = {
      id: 'title',
      label: this.translate.instant('COMPLAINTS.TITLE_LABEL') || 'Title',
      placeholder: this.translate.instant('COMPLAINTS.ENTER_TITLE') || 'Enter Title',
      validations: [
        { name: 'required', validator: Validators.required },
        { name: 'minlength', validator: Validators.minLength(3) }
      ],
      errorMessages: {
        required: this.translate.instant('COMPLAINTS.TITLE_REQUIRED') || 'Title is required',
        minlength: this.translate.instant('COMPLAINTS.TITLE_MIN') || 'Minimum 3 characters required'
      }
    };

    this.descriptionConfig = {
      id: 'description',
      label: this.translate.instant('COMPLAINTS.DESCRIPTION') || 'Description',
      placeholder: this.translate.instant('COMPLAINTS.ENTER_DESCRIPTION') || 'Enter Description',
      validations: [
        { name: 'required', validator: Validators.required },
        { name: 'minlength', validator: Validators.minLength(3) }
      ],
      errorMessages: {
        required: this.translate.instant('COMPLAINTS.DESCRIPTION_REQUIRED') || 'Description is required',
        minlength: this.translate.instant('COMPLAINTS.DESCRIPTION_MIN') || 'Minimum 3 characters required'
      }
    };

    this.priorityTabsConfig = {
      id: 'priority',
      label: this.translate.instant('COMPLAINTS.PRIORITY') || 'Priority'
    };

    this.complaintTypeTabsConfig = {
      id: 'complaintType',
      label: this.translate.instant('COMPLAINTS.COMPLAINT_TYPE') || 'Complaint Type'
    };

    this.flatSearchConfig = {
      id: 'flat',
      label: this.translate.instant('PARKINGS.FLAT') || 'Flat',
      placeholder: this.translate.instant('PARKINGS.SELECT_FLAT') || 'Select Flat',
    };

    this.errorConfig = {
      id: 'error',
      label: '',
    };

    this.priorityOptions = [
      {
        value: 'low',
        label: this.translate.instant('COMPLAINTS.PRIORITY_LOW') || 'Low'
      },
      {
        value: 'medium',
        label: this.translate.instant('COMPLAINTS.PRIORITY_MEDIUM') || 'Medium'
      },
      {
        value: 'high',
        label: this.translate.instant('COMPLAINTS.PRIORITY_HIGH') || 'High'
      },
      {
        value: 'urgent',
        label: this.translate.instant('COMPLAINTS.PRIORITY_URGENT') || 'Urgent'
      }
    ];

    this.complaintTypeOptions = [
      {
        value: 'Private',
        label: this.translate.instant('COMPLAINTS.TYPE_PRIVATE') || 'Private'
      },
      {
        value: 'Public',
        label: this.translate.instant('COMPLAINTS.TYPE_PUBLIC') || 'Public'
      },
    ];
  }

  constructor(private translate: TranslateService) {}

  ngOnInit(): void {
    this.initFormConfigs();
    this.translate.onLangChange.pipe(takeUntil(this.isComponentActive)).subscribe(() => {
      this.initFormConfigs();
    });

    this.societyId = this.route.snapshot.paramMap.get('societyId') ?? undefined;
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
        if (this.flatOptions.length > 0) {
          if (this.flatId) {
            const flat = this.flatOptions.find(f => f.value === this.flatId);
            if (flat) {
              this.fb.get('flat')?.setValue(flat);
              this.fb.get('flat')?.disable();
            }
          } else
            this.fb.get('flat')?.setValue(this.flatOptions[0]);
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
      flatId: this.flatId ?? formValue.flat?.value,
      societyId: this.flat ? this.flat.societyId : this.societyId,
      title: formValue.title ?? '',
      description: formValue.description,
      priority: formValue.priority,
      complaintType: formValue.complaintType,
      status: formValue.status,
    };
    this.pendingHttpService.addRequest('add-complaint', { message: 'Complaint Added' });
    this.complaintService.newComplaint(payload)
      .pipe(take(1))
      .subscribe({
        next: response => {
          this.pendingHttpService.removeRequest('add-complaint');
          if (response.success) {
            this.cancel();
          } else {
            this.errorMessage = response.message ?? 'Failed to add complaint';
          }
        },
        error: err => {
          this.pendingHttpService.removeRequest('add-complaint');
        }
      });
  }

  ngOnDestroy(): void {
    this.isComponentActive.next();
    this.isComponentActive.complete();
  }
}
