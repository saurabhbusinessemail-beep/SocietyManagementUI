import { Component, OnInit } from '@angular/core';
import { IFlatMember } from '../../../interfaces';
import { SocietyService } from '../../../services/society.service';
import { Subject, take } from 'rxjs';
import { SocietyRoles } from '../../../types';
import { DialogService } from '../../../services/dialog.service';
import { ActivatedRoute, Router } from '@angular/router';

interface IMemberFilter {
  societyId?: string, flatId?: string
}

@Component({
  selector: 'app-members-list',
  templateUrl: './members-list.component.html',
  styleUrl: './members-list.component.scss'
})
export class MembersListComponent implements OnInit {

  selectedFIlter: IMemberFilter = {};
  members: IFlatMember[] = [];
  routeFlatId?: string;

  constructor(public societyService: SocietyService, private dialogService: DialogService,
    private route: ActivatedRoute, private router: Router) { }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.routeFlatId = params['flatId'];
    });
  }

  loadMembers(selectedFIlter: IMemberFilter) {
    this.selectedFIlter = selectedFIlter;
    const societyId = selectedFIlter.societyId;
    const flatId = selectedFIlter.flatId;
    this.members = [];

    this.societyService.myFlatMembers(societyId, flatId)
      .pipe(take(1))
      .subscribe({
        next: response => {
          this.members = response.data;
        }
      });
  }

  async deleteMember(member: IFlatMember) {
    const forUser = !member.userId || typeof member.userId === 'string' ? undefined : ` ${member.userId.name ?? member.userId.phoneNumber}`

    if (!await this.dialogService.confirmDelete('Delete Flat Member', `Are you sure you want to delete flat member ${forUser}?`)) return;

    this.societyService.deleteFlatMember(member._id)
      .pipe(take(1))
      .subscribe({
        next: () => this.loadMembers(this.selectedFIlter)
      });
  }

  async openAddMember() {
    console.log('this.selectedFIlter.societyId = ', this.selectedFIlter);
    const societyId = this.selectedFIlter.societyId ?? this.societyService.selectedSocietyFilterValue?.value;
    const flatId = this.selectedFIlter.flatId;

    if (societyId && flatId)
      this.router.navigate(['members', societyId, 'add', flatId]);
    else if (societyId)
      this.router.navigate(['members', societyId, 'add']);
    else if (flatId)
      this.router.navigate(['members', 'add', flatId]);
    else
      this.router.navigate(['members', 'add']);
  }

  allowDelete(flatMember: IFlatMember): boolean {

    // If I am admin/society manager then I will see no delete button
    // If I am flat owner then I will see delete buttons for all records
    // If I am tenant then I can delete only members that are 

    return true;
  }
}
