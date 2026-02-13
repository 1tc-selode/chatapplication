import { Component, Input, OnInit, OnChanges, SimpleChanges, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Api } from '../../../core/api/api';

@Component({
  selector: 'app-user-list',
  imports: [CommonModule],
  templateUrl: './user-list.html',
  styleUrl: './user-list.css',
})
export class UserList implements OnInit, OnChanges {
  @Input() roomId!: number;
  
  users: any[] = [];
  adminUsers: any[] = [];
  regularUsers: any[] = [];
  isLoading = false;

  constructor(
    private apiService: Api,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    if (this.roomId) {
      this.loadUsers();
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['roomId'] && !changes['roomId'].firstChange) {
      this.loadUsers();
    }
  }

  loadUsers() {
    this.isLoading = true;
    this.apiService.getRoomUsers(this.roomId).subscribe({
      next: (users) => {
        this.users = users;
        
        // Separate and sort admins and regular users alphabetically
        this.adminUsers = users
          .filter((user: any) => user.is_admin)
          .sort((a: any, b: any) => a.name.localeCompare(b.name));
        
        this.regularUsers = users
          .filter((user: any) => !user.is_admin)
          .sort((a: any, b: any) => a.name.localeCompare(b.name));
        
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error loading users:', error);
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }
}
