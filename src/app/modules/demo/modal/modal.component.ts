import { Component, Input, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';

@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss']
})
export class ModalComponent {
  @Input() title: string = '';
  @Input() hideConfirm: boolean = false;
  @Input() confirmText: string = 'Confirm';
  @Input() cancelText: string = 'Cancel';

  @Output() onConfirm = new EventEmitter<void>();
  @Output() onCancel = new EventEmitter<void>();

  @ViewChild('modalOverlay') modalOverlay!: ElementRef;
  @ViewChild('modalContent') modalContent!: ElementRef;

  isOpen: boolean = false;

  open(): void {
    this.isOpen = true;
    document.body.style.overflow = 'hidden';
  }

  close(): void {
    this.isOpen = false;
    document.body.style.overflow = '';
  }

  confirm(): void {
    this.onConfirm.emit();
    this.close();
  }

  cancel(): void {
    this.onCancel.emit();
    this.close();
  }

  onClickOverlay(event: MouseEvent): void {
    if (event.target === this.modalOverlay.nativeElement) {
      this.cancel();
    }
  }
}