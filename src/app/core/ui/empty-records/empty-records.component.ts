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
  @Input() overrideTitle?: string;
  @Input() overrideMessage?: string;
  @Input() overrideButtonText?: string;
  @Input() hideAddButton = false;
  @Input() hideMessage = false;
  @Input() addRouterLink?: string;
  @Output() addClicked = new EventEmitter<void>();


  get pascalCaseSingular() {
    return this.singular.split(' ').map(s => {
      return  s[0] ? s[0].toUpperCase() + s.slice(1, s.length) : '';
    }).join(' ')
   
  } 

  constructor(private router: Router) { }

  onAddClick(): void {
    if (this.addRouterLink)
      this.router.navigateByUrl(this.addRouterLink);
    else
      this.addClicked.emit();
  }
}
