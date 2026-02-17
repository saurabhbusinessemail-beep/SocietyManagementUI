import { Component, OnInit } from '@angular/core';
import { IFlatMember } from '../../../interfaces';
import { SocietyService } from '../../../services/society.service';
import { Subject, take } from 'rxjs';
import { SocietyRoles } from '../../../types';
import { DialogService } from '../../../services/dialog.service';

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

  constructor(private societyService: SocietyService, private dialogService: DialogService) { }

  ngOnInit(): void {

  }

  loadMembers(selectedFIlter: IMemberFilter) {
    this.selectedFIlter = selectedFIlter;
    const societyId = selectedFIlter.societyId;
    const flatId = selectedFIlter.flatId;

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

  allowDelete(flatMember: IFlatMember): boolean {

    // If I am admin/society manager then I will see no delete button
    // If I am flat owner then I will see delete buttons for all records
    // If I am tenant then I can delete only members that are 

    return true;
  }
}
