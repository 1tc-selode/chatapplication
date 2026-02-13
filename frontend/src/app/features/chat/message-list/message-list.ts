import { Component, Input, OnInit, OnChanges, SimpleChanges, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Api } from '../../../core/api/api';
import { Message } from '../../../core/models/chat.model';

@Component({
  selector: 'app-message-list',
  imports: [CommonModule],
  templateUrl: './message-list.html',
  styleUrl: './message-list.css',
})
export class MessageList implements OnInit, OnChanges, OnDestroy {
  @Input() roomId!: number;
  @Input() currentUser: any = null;
  
  messages: Message[] = [];
  isLoading = false;
  private refreshInterval: any;

  constructor(
    private apiService: Api,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    if (this.roomId) {
      this.loadMessages();
      this.startAutoRefresh();
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['roomId'] && !changes['roomId'].firstChange) {
      this.stopAutoRefresh();
      this.loadMessages();
      this.startAutoRefresh();
    }
  }

  ngOnDestroy() {
    this.stopAutoRefresh();
  }

  startAutoRefresh() {
    // Refresh messages every 3 seconds
    this.refreshInterval = setInterval(() => {
      this.loadMessagesQuietly();
    }, 3000);
  }

  stopAutoRefresh() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
  }

  loadMessages() {
    this.isLoading = true;
    this.apiService.getMessages(this.roomId).subscribe({
      next: (response) => {
        this.messages = response.data.reverse();
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error loading messages:', error);
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  loadMessagesQuietly() {
    // Load messages without showing loading indicator
    this.apiService.getMessages(this.roomId).subscribe({
      next: (response) => {
        this.messages = response.data.reverse();
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error loading messages:', error);
      }
    });
  }

  deleteMessage(messageId: number) {
    if (confirm('Are you sure you want to delete this message?')) {
      this.apiService.deleteMessage(messageId).subscribe({
        next: () => {
          this.messages = this.messages.filter(m => m.id !== messageId);
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error('Error deleting message:', error);
        }
      });
    }
  }
}
