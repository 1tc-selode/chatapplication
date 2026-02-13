import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Api } from '../../../core/api/api';
import { Auth } from '../../../core/auth/auth';

@Component({
  selector: 'app-admin-panel',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './admin-panel.html',
  styleUrl: './admin-panel.css',
})
export class AdminPanel implements OnInit {
  activeTab: 'categories' | 'rooms' | 'users' = 'categories';
  
  categories: any[] = [];
  rooms: any[] = [];
  users: any[] = [];
  selectedUserForRooms: any = null;
  availableRoomsForUser: any[] = [];
  userRooms: any[] = [];
  currentUserId: number = 0;
  
  categoryForm: FormGroup;
  roomForm: FormGroup;
  userForm: FormGroup;
  assignRoomForm: FormGroup;
  
  editingCategory: any = null;
  editingRoom: any = null;
  editingUser: any = null;
  
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private fb: FormBuilder,
    private apiService: Api,
    private authService: Auth,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
    // Check if user is admin
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser?.is_admin) {
      this.router.navigate(['/chat']);
    }
    this.currentUserId = currentUser?.id || 0;

    this.categoryForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      description: [''],
    });

    this.roomForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      description: [''],
      category_id: ['', Validators.required],
      is_private: [false],
    });

    this.userForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: [''],
      is_admin: [false],
    });

    this.assignRoomForm = this.fb.group({
      room_id: ['', Validators.required],
    });
  }

  ngOnInit() {
    this.loadCategories();
    this.loadUsers();
  }

  setActiveTab(tab: 'categories' | 'rooms' | 'users') {
    this.activeTab = tab;
    this.clearMessages();
    this.cdr.detectChanges();
  }

  // Category Methods
  loadCategories() {
    this.isLoading = true;
    this.apiService.getCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
        this.rooms = categories.flatMap((cat: any) => 
          cat.rooms.map((room: any) => ({ ...room, category_name: cat.name }))
        ).sort((a, b) => a.id - b.id); // Sort by ID ascending
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error loading categories:', error);
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  createCategory() {
    if (this.categoryForm.valid) {
      this.isLoading = true;
      this.apiService.createCategory(this.categoryForm.value).subscribe({
        next: () => {
          this.successMessage = 'Category created successfully';
          this.categoryForm.reset();
          this.loadCategories();
          this.isLoading = false;
          this.cdr.detectChanges();
        },
        error: (error) => {
          this.errorMessage = error.error?.message || 'Failed to create category';
          this.isLoading = false;
          this.cdr.detectChanges();
        }
      });
    }
  }

  editCategory(category: any) {
    this.editingCategory = category;
    this.categoryForm.patchValue(category);
    this.cdr.detectChanges();
  }

  updateCategory() {
    if (this.categoryForm.valid && this.editingCategory) {
      this.isLoading = true;
      this.apiService.updateCategory(this.editingCategory.id, this.categoryForm.value).subscribe({
        next: () => {
          this.successMessage = 'Category updated successfully';
          this.editingCategory = null;
          this.categoryForm.reset();
          this.loadCategories();
          this.isLoading = false;
          this.cdr.detectChanges();
        },
        error: (error) => {
          this.errorMessage = error.error?.message || 'Failed to update category';
          this.isLoading = false;
          this.cdr.detectChanges();
        }
      });
    }
  }

  deleteCategory(id: number) {
    if (confirm('Are you sure you want to delete this category?')) {
      this.apiService.deleteCategory(id).subscribe({
        next: () => {
          this.successMessage = 'Category deleted successfully';
          this.loadCategories();
          this.cdr.detectChanges();
        },
        error: (error) => {
          this.errorMessage = error.error?.message || 'Failed to delete category';
          this.cdr.detectChanges();
        }
      });
    }
  }

  cancelEditCategory() {
    this.editingCategory = null;
    this.categoryForm.reset();
    this.cdr.detectChanges();
  }

  // Room Methods
  createRoom() {
    if (this.roomForm.valid) {
      this.isLoading = true;
      this.apiService.createRoom(this.roomForm.value).subscribe({
        next: () => {
          this.successMessage = 'Room created successfully';
          this.roomForm.reset();
          this.loadCategories();
          this.loadUsers(); // Reload users to update room count for admin
          this.isLoading = false;
          this.cdr.detectChanges();
        },
        error: (error) => {
          this.errorMessage = error.error?.message || 'Failed to create room';
          this.isLoading = false;
          this.cdr.detectChanges();
        }
      });
    }
  }

  editRoom(room: any) {
    this.editingRoom = room;
    this.roomForm.patchValue(room);
    this.cdr.detectChanges();
  }

  updateRoom() {
    if (this.roomForm.valid && this.editingRoom) {
      this.isLoading = true;
      this.apiService.updateRoom(this.editingRoom.id, this.roomForm.value).subscribe({
        next: () => {
          this.successMessage = 'Room updated successfully';
          this.editingRoom = null;
          this.roomForm.reset();
          this.loadCategories();
          this.isLoading = false;
          this.cdr.detectChanges();
        },
        error: (error) => {
          this.errorMessage = error.error?.message || 'Failed to update room';
          this.isLoading = false;
          this.cdr.detectChanges();
        }
      });
    }
  }

  deleteRoom(id: number) {
    if (confirm('Are you sure you want to delete this room?')) {
      this.apiService.deleteRoom(id).subscribe({
        next: () => {
          this.successMessage = 'Room deleted successfully';
          this.loadCategories();
          this.cdr.detectChanges();
        },
        error: (error) => {
          this.errorMessage = error.error?.message || 'Failed to delete room';
          this.cdr.detectChanges();
        }
      });
    }
  }

  cancelEditRoom() {
    this.editingRoom = null;
    this.roomForm.reset();
    this.cdr.detectChanges();
  }

  // User Methods
  loadUsers() {
    this.isLoading = true;
    this.apiService.getUsers().subscribe({
      next: (users) => {
        this.users = users;
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

  selectUserForRooms(user: any) {
    this.selectedUserForRooms = user;
    this.userRooms = []; // Reset rooms
    this.availableRoomsForUser = []; // Reset available rooms
    this.assignRoomForm.reset();
    this.loadUserRooms(user.id);
    this.cdr.detectChanges();
  }

  loadUserRooms(userId: number) {
    this.apiService.getUser(userId).subscribe({
      next: (user) => {
        // Only show private rooms that the user has access to
        this.userRooms = (user.rooms || []).filter((room: any) => room.is_private);
        // Only show private rooms for assignment that user doesn't have
        this.availableRoomsForUser = this.rooms.filter(
          room => room.is_private && !this.userRooms.some((ur: any) => ur.id === room.id)
        );
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error loading user rooms:', error);
        this.cdr.detectChanges();
      }
    });
  }

  editUser(user: any) {
    this.editingUser = user;
    this.userForm.patchValue({
      name: user.name,
      email: user.email,
      is_admin: user.is_admin,
    });
    this.cdr.detectChanges();
  }

  updateUser() {
    if (this.userForm.valid && this.editingUser) {
      this.isLoading = true;
      const userData = { ...this.userForm.value };
      if (!userData.password) {
        delete userData.password;
      }
      
      this.apiService.updateUser(this.editingUser.id, userData).subscribe({
        next: () => {
          this.successMessage = 'User updated successfully';
          this.editingUser = null;
          this.userForm.reset();
          this.loadUsers();
          this.isLoading = false;
          this.cdr.detectChanges();
        },
        error: (error) => {
          this.errorMessage = error.error?.message || 'Failed to update user';
          this.isLoading = false;
          this.cdr.detectChanges();
        }
      });
    }
  }

  deleteUser(id: number) {
    if (confirm('Are you sure you want to delete this user?')) {
      this.apiService.deleteUser(id).subscribe({
        next: () => {
          this.successMessage = 'User deleted successfully';
          this.loadUsers();
          this.cdr.detectChanges();
        },
        error: (error) => {
          this.errorMessage = error.error?.message || 'Failed to delete user';
          this.cdr.detectChanges();
        }
      });
    }
  }

  cancelEditUser() {
    this.editingUser = null;
    this.userForm.reset();
    this.cdr.detectChanges();
  }

  assignRoomToUserSubmit() {
    if (this.assignRoomForm.valid && this.selectedUserForRooms) {
      const roomId = this.assignRoomForm.value.room_id;
      this.apiService.assignRoomToUser(this.selectedUserForRooms.id, roomId).subscribe({
        next: () => {
          this.successMessage = 'Room assigned successfully';
          this.loadUserRooms(this.selectedUserForRooms.id);
          this.loadUsers(); // Reload users to update room count
          this.assignRoomForm.reset();
          this.cdr.detectChanges();
        },
        error: (error: any) => {
          this.errorMessage = error.error?.message || 'Failed to assign room';
          this.cdr.detectChanges();
        }
      });
    }
  }

  removeUserRoom(roomId: number) {
    if (this.selectedUserForRooms && confirm('Are you sure you want to remove this room access?')) {
      this.apiService.removeRoomFromUser(this.selectedUserForRooms.id, roomId).subscribe({
        next: () => {
          this.successMessage = 'Room access removed successfully';
          this.loadUserRooms(this.selectedUserForRooms.id);
          this.loadUsers(); // Reload users to update room count
          this.cdr.detectChanges();
        },
        error: (error: any) => {
          this.errorMessage = error.error?.message || 'Failed to remove room access';
          this.cdr.detectChanges();
        }
      });
    }
  }

  closeUserRooms() {
    this.selectedUserForRooms = null;
    this.userRooms = [];
    this.availableRoomsForUser = [];
    this.assignRoomForm.reset();
    this.cdr.detectChanges();
  }

  isCurrentUser(userId: number): boolean {
    return userId === this.currentUserId;
  }

  clearMessages() {
    this.errorMessage = '';
    this.successMessage = '';
  }

  goToChat() {
    this.router.navigate(['/chat']);
  }
}
