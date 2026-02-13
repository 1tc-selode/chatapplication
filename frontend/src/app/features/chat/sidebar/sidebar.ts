import { Component, Input, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Category, Room } from '../../../core/models/chat.model';

@Component({
  selector: 'app-sidebar',
  imports: [CommonModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class Sidebar {
  @Input() categories: Category[] = [];
  @Input() selectedRoom: Room | null = null;
  @Input() currentUser: any = null;
  @Output() roomSelected = new EventEmitter<Room>();
  @Output() categoriesChanged = new EventEmitter<void>();

  expandedCategories: Set<number> = new Set();

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    // Expand all categories by default
    this.categories.forEach(cat => this.expandedCategories.add(cat.id));
    this.cdr.detectChanges();
  }

  toggleCategory(categoryId: number) {
    if (this.expandedCategories.has(categoryId)) {
      this.expandedCategories.delete(categoryId);
    } else {
      this.expandedCategories.add(categoryId);
    }
    this.cdr.detectChanges();
  }

  isCategoryExpanded(categoryId: number): boolean {
    return this.expandedCategories.has(categoryId);
  }

  selectRoom(room: Room) {
    this.roomSelected.emit(room);
    this.cdr.detectChanges();
  }

  isRoomSelected(room: Room): boolean {
    return this.selectedRoom?.id === room.id;
  }
}
