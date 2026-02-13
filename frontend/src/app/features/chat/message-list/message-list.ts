import { Component, Input, OnInit, OnChanges, SimpleChanges, OnDestroy, ChangeDetectorRef, ElementRef, ViewChild, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Api } from '../../../core/api/api';
import { Message } from '../../../core/models/chat.model';

@Component({
  selector: 'app-message-list',
  imports: [CommonModule],
  templateUrl: './message-list.html',
  styleUrl: './message-list.css',
})
export class MessageList implements OnInit, OnChanges, OnDestroy, AfterViewChecked {
  @Input() roomId!: number;
  @Input() currentUser: any = null;
  @ViewChild('messageContainer') private messageContainer?: ElementRef;
  
  messages: Message[] = [];
  isLoading = false;
  private refreshInterval: any;
  private shouldScrollToBottom = false;

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

  ngAfterViewChecked() {
    if (this.shouldScrollToBottom) {
      this.scrollToBottom();
      this.shouldScrollToBottom = false;
    }
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
        this.shouldScrollToBottom = true;
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
        const oldLength = this.messages.length;
        this.messages = response.data.reverse();
        
        // Only scroll if new messages arrived
        if (this.messages.length > oldLength) {
          this.shouldScrollToBottom = true;
        }
        
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error loading messages:', error);
      }
    });
  }

  scrollToBottom(): void {
    try {
      if (this.messageContainer) {
        this.messageContainer.nativeElement.scrollTop = this.messageContainer.nativeElement.scrollHeight;
      }
    } catch(err) {
      console.error('Scroll error:', err);
    }
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
