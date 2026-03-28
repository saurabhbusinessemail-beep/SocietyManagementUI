import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-empty-records',
  templateUrl: './empty-records.component.html',
  styleUrl: './empty-records.component.scss'
})
export class EmptyRecordsComponent {
  @Input() singular = 'society';
  @Input() plural = 'societies';
  @Input() hideAddButton = false;
  @Input() routerLink?: string;
  @Output() addClicked = new EventEmitter<void>();


  // @Input() title: string = 'No societies added yet';
  // @Input() message: string = "You haven't added any society yet. Get started by adding your first society.";
  // @Input() buttonText: string = 'Start adding Society';

  get pascalCaseSingular() {
    return this.singular.split(' ').map(s => {
      return  s[0].toUpperCase() + s.slice(1, s.length)
    }).join(' ')
   
  } 

  get title() {
    return `No ${this.plural} added yet`;
  }

  get message() {
    return `"You haven't added any ${this.singular} yet. Get started by adding your first ${this.singular}.`
  }

  get buttonText() {
    return `Start adding ` + this.pascalCaseSingular;
  }

  constructor(private router: Router) { }

  onAddClick(): void {
    if (this.routerLink)
      this.router.navigateByUrl(this.routerLink);
    else
      this.addClicked.emit();
  }
}
