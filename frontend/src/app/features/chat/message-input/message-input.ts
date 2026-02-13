import { Component, Input, ChangeDetectorRef, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Api } from '../../../core/api/api';

@Component({
  selector: 'app-message-input',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './message-input.html',
  styleUrl: './message-input.css',
})
export class MessageInput {
  @Input() roomId!: number;
  @Output() messageSent = new EventEmitter<void>();
  
  messageControl = new FormControl('');
  isSending = false;

  constructor(
    private apiService: Api,
    private cdr: ChangeDetectorRef
  ) {}

  sendMessage() {
    const content = this.messageControl.value?.trim();
    
    if (!content || this.isSending) {
      return;
    }

    this.isSending = true;
    this.cdr.detectChanges();

    this.apiService.sendMessage({
      room_id: this.roomId,
      content: content
    }).subscribe({
      next: () => {
        this.messageControl.setValue('');
        this.isSending = false;
        this.messageSent.emit();
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error sending message:', error);
        this.isSending = false;
        this.cdr.detectChanges();
      }
    });
  }

  onKeyPress(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }
}
