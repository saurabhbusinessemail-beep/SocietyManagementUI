import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { IAnnouncement, ISociety, IUIControlConfig, IUIDropdownOption } from '../../../interfaces';
import { AnnouncementCategoryTypes, AnnouncementCategoryTypesText, AnnouncementPriorityTypes, AnnouncementPriorityTypesText, adminManagerRoles } from '../../../constants';
import { SocietyService } from '../../../services/society.service';
import { take } from 'rxjs';
import { Location } from '@angular/common';
import { LoginService } from '../../../services/login.service';
import { AnnouncementService } from '../../../services/announcement.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-add-announcement',
  templateUrl: './add-announcement.component.html',
  styleUrl: './add-announcement.component.scss'
})
export class AddAnnouncementComponent implements OnInit {

  announcementId?: string | null;

  societies: ISociety[] = [];
  societyOptions: IUIDropdownOption[] = [];

  fb = new FormGroup({
    society: new FormControl<IUIDropdownOption | undefined>(undefined),
    title: new FormControl<string | null>(null),
    content: new FormControl<string | null>(null),
    priority: new FormControl<string | undefined>(undefined),
    category: new FormControl<string | undefined>(undefined),
    expiryDate: new FormControl<Date>(new Date(new Date().setDate(new Date().getDate() + 1))),
  });

  societySearchConfig: IUIControlConfig = {
    id: 'society',
    label: 'Society',
    placeholder: 'Select Society',
    validations: [
      {
        name: 'required',
        validator: Validators.required
      }
    ],
    errorMessages: {
      required: 'Select any Society'
    }
  };
  titleConfig: IUIControlConfig = {
    id: 'title',
    label: 'Title',
    placeholder: 'Add Title',
    validations: [
      {
        name: 'required',
        validator: Validators.required
      }
    ],
    errorMessages: {
      required: 'Title is required'
    }
  };
  contentConfig: IUIControlConfig = {
    id: 'content',
    label: 'Content',
    placeholder: 'Add Content',
    validations: [
      {
        name: 'required',
        validator: Validators.required
      }
    ],
    errorMessages: {
      required: 'Content is required'
    }
  };
  priorityConfig: IUIControlConfig = {
    id: 'priority',
    label: 'Priority',
    placeholder: 'Select Priority',
    validations: [
      {
        name: 'required',
        validator: Validators.required
      }
    ],
    errorMessages: {
      required: 'Select any Priority'
    },
    dropDownOptions: [
      {
        label: AnnouncementPriorityTypesText.low.toString(),
        value: AnnouncementPriorityTypes.low.toString()
      },
      {
        label: AnnouncementPriorityTypesText.medium.toString(),
        value: AnnouncementPriorityTypes.medium.toString()
      },
      {
        label: AnnouncementPriorityTypesText.high.toString(),
        value: AnnouncementPriorityTypes.high.toString()
      },
      {
        label: AnnouncementPriorityTypesText.urgent.toString(),
        value: AnnouncementPriorityTypes.urgent.toString()
      }
    ]
  };
  categoryConfig: IUIControlConfig = {
    id: 'category',
    label: 'Category',
    placeholder: 'Select Category',
    validations: [
      {
        name: 'required',
        validator: Validators.required
      }
    ],
    errorMessages: {
      required: 'Select any Category'
    },
    dropDownOptions: [
      {
        label: AnnouncementCategoryTypesText.billing.toString(),
        value: AnnouncementCategoryTypes.billing
      },
      {
        label: AnnouncementCategoryTypesText.event.toString(),
        value: AnnouncementCategoryTypes.event
      },
      {
        label: AnnouncementCategoryTypesText.general.toString(),
        value: AnnouncementCategoryTypes.general
      },
      {
        label: AnnouncementCategoryTypesText.maintenance.toString(),
        value: AnnouncementCategoryTypes.maintenance
      },
      {
        label: AnnouncementCategoryTypesText.other.toString(),
        value: AnnouncementCategoryTypes.other
      },
      {
        label: AnnouncementCategoryTypesText.security.toString(),
        value: AnnouncementCategoryTypes.security
      },
    ]
  };
  expiryDateConfig: IUIControlConfig = {
    id: 'expiryDate',
    label: 'Expiry Date',
    placeholder: 'Add Expiry Date',
    validations: [
      {
        name: 'required',
        validator: Validators.required
      }
    ],
    errorMessages: {
      required: 'Expiry Date is required'
    },
  };

  constructor(
    private location: Location,
    private societyService: SocietyService,
    private loginService: LoginService,
    private announcementService: AnnouncementService,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.announcementId = this.route.snapshot.paramMap.get('id');
    this.loadSocities();

    if (this.announcementId) this.loadAnnouncement(this.announcementId);
  }

  loadSocities() {
    this.societyService.getAllSocieties()
      .pipe(take(1))
      .subscribe({
        next: response => {
          const myProfile = this.loginService.getProfileFromStorage();
          if (!myProfile) return;

          const managerSocities = new Set<string>(myProfile.socities
            .filter(s => s.societyRoles.some(sr => adminManagerRoles.includes(sr.name)))
            .map(s => s.societyId));
          const societies = (response.data ?? []).filter(s => managerSocities.has(s._id));

          this.societies = societies;
          this.societyOptions = societies.map(s => ({
            label: s.societyName,
            value: s._id
          } as IUIDropdownOption));

          this.loadDefaultSociety();
        },
        error: () => console.log('Error while getting socities')
      });
  }

  loadDefaultSociety() {
    if (this.societyOptions.length > 0) {
      this.fb.get('society')?.setValue(this.societyOptions[0]);
    }
  }

  loadAnnouncement(id: string) {
    this.announcementService.getAnnouncement(id)
      .pipe(take(1))
      .subscribe({
        next: response => {
          if (!response.success || !response.data) return;

          this.patchAnnouncement(response.data);
        }
      })
  }
  patchAnnouncement(announcement: IAnnouncement) {
    const societyId = typeof announcement.societyId === 'string' ? announcement.societyId : announcement.societyId._id
    const so = this.societyOptions.find(so => so.value === societyId);
    if (!so) return;

    this.fb.get('society')?.setValue(so, { emitEvent: false });
    this.fb.get('title')?.setValue(announcement.title, { emitEvent: false });
    this.fb.get('content')?.setValue(announcement.content, { emitEvent: false });
    if (announcement.expiryDate) this.fb.get('expiryDate')?.setValue(announcement.expiryDate);

    const priorityOption = this.priorityConfig.dropDownOptions?.find(o => o.value === announcement.priority);
    if (priorityOption) {
      this.fb.get('priority')?.setValue(announcement.priority, { emitEvent: false });
    }

    const categoryOption = this.categoryConfig.dropDownOptions?.find(o => o.value === announcement.category);
    if (categoryOption) {
      this.fb.get('category')?.setValue(announcement.category, { emitEvent: false });
    }
  }

  cancel() {
    this.location.back();
  }

  publish() {
    if (this.fb.invalid) return;

    const formValue = this.fb.value;
    const payload = {
      societyId: formValue.society?.value,
      title: formValue.title,
      content: formValue.content,
      priority: formValue.priority,
      category: formValue.category,
      expiryDate: formValue.expiryDate,
      status: 'published',
      isPublished: true,
      publishDate: new Date()
    };

    this.save(payload);
  }

  saveDraft() {
    if (this.fb.invalid) return;

    const formValue = this.fb.value;
    const payload = {
      societyId: formValue.society?.value,
      title: formValue.title,
      content: formValue.content,
      priority: formValue.priority,
      category: formValue.category,
      expiryDate: formValue.expiryDate,
      status: 'draft',
      isPublished: false,
    };

    this.save(payload);
  }

  save(payload: any) {
    (
      this.announcementId
        ? this.announcementService.updateAnnouncement(this.announcementId, payload)
        : this.announcementService.createAnnouncement(payload)
    ).pipe(take(1))
      .subscribe({
        next: response => {
          if (!response.success) return;

          this.location.back();
        }
      });
  }
}
