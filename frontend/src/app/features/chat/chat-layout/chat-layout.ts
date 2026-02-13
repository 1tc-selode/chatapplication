import { Component, OnInit, OnDestroy, ChangeDetectorRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Sidebar } from '../sidebar/sidebar';
import { MessageList } from '../message-list/message-list';
import { MessageInput } from '../message-input/message-input';
import { UserList } from '../user-list/user-list';
import { Api } from '../../../core/api/api';
import { Auth } from '../../../core/auth/auth';
import { Category, Room } from '../../../core/models/chat.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-chat-layout',
  imports: [CommonModule, RouterModule, Sidebar, MessageList, MessageInput, UserList],
  templateUrl: './chat-layout.html',
  styleUrl: './chat-layout.css',
})
export class ChatLayout implements OnInit, OnDestroy {
  @ViewChild('messageList') messageListComponent?: MessageList;
  
  categories: Category[] = [];
  selectedRoom: Room | null = null;
  currentUser: any = null;
  darkMode = false;

  constructor(
    private apiService: Api,
    private authService: Auth,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.currentUser = this.authService.getCurrentUser();
    this.loadCategories();
    
    // Update online status when entering chat
    this.authService.updateOnlineStatus(true).subscribe();
    
    // Load dark mode preference
    const savedDarkMode = localStorage.getItem('darkMode');
    if (savedDarkMode === 'true') {
      this.darkMode = true;
      document.body.classList.add('dark-mode');
    }
    this.cdr.detectChanges();
  }

  ngOnDestroy() {
    // Update online status when leaving
    this.authService.updateOnlineStatus(false).subscribe();
  }

  loadCategories() {
    this.apiService.getCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
        
        // Auto-select first room if available
        if (categories.length > 0 && categories[0].rooms && categories[0].rooms.length > 0) {
          this.onRoomSelected(categories[0].rooms[0]);
        }
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error loading categories:', error);
      }
    });
  }

  onRoomSelected(room: Room) {
    this.selectedRoom = room;
    this.cdr.detectChanges();
  }

  onMessageSent() {
    if (this.messageListComponent) {
      this.messageListComponent.loadMessages();
    }
  }

  onLogout() {
    this.authService.logout().subscribe({
      next: () => {
        this.router.navigate(['/login']);
      },
      error: (error) => {
        console.error('Logout error:', error);
        // Even if there's an error, navigate to login
        this.router.navigate(['/login']);
      }
    });
  }

  toggleDarkMode() {
    this.darkMode = !this.darkMode;
    document.body.classList.toggle('dark-mode');
    localStorage.setItem('darkMode', this.darkMode.toString());
    this.cdr.detectChanges();
  }
}
