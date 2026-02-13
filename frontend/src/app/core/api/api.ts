import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Category, Room, Message } from '../models/chat.model';

@Injectable({
  providedIn: 'root',
})
export class Api {
  // Use relative URL - works both locally and on Netlify
  private apiUrl = '/api';

  constructor(private http: HttpClient) {}

  // Categories
  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.apiUrl}/categories`);
  }

  createCategory(data: Partial<Category>): Observable<Category> {
    return this.http.post<Category>(`${this.apiUrl}/categories`, data);
  }

  updateCategory(id: number, data: Partial<Category>): Observable<Category> {
    return this.http.put<Category>(`${this.apiUrl}/categories/${id}`, data);
  }

  deleteCategory(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/categories/${id}`);
  }

  // Rooms
  getRooms(): Observable<Room[]> {
    return this.http.get<Room[]>(`${this.apiUrl}/rooms`);
  }

  getRoom(id: number): Observable<Room> {
    return this.http.get<Room>(`${this.apiUrl}/rooms/${id}`);
  }

  createRoom(data: Partial<Room>): Observable<Room> {
    return this.http.post<Room>(`${this.apiUrl}/rooms`, data);
  }

  updateRoom(id: number, data: Partial<Room>): Observable<Room> {
    return this.http.put<Room>(`${this.apiUrl}/rooms/${id}`, data);
  }

  deleteRoom(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/rooms/${id}`);
  }

  joinRoom(id: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/rooms/${id}/join`, {});
  }

  leaveRoom(id: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/rooms/${id}/leave`, {});
  }

  getRoomUsers(id: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/rooms/${id}/users`);
  }

  // Messages
  getMessages(roomId: number, page: number = 1, perPage: number = 50): Observable<any> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('per_page', perPage.toString());

    return this.http.get<any>(`${this.apiUrl}/rooms/${roomId}/messages`, { params });
  }

  sendMessage(data: { room_id: number; content: string; file?: File }): Observable<Message> {
    const formData = new FormData();
    formData.append('room_id', data.room_id.toString());
    formData.append('content', data.content);
    
    if (data.file) {
      formData.append('file', data.file);
    }

    return this.http.post<Message>(`${this.apiUrl}/messages`, formData);
  }

  updateMessage(id: number, content: string): Observable<Message> {
    return this.http.put<Message>(`${this.apiUrl}/messages/${id}`, { content });
  }

  deleteMessage(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/messages/${id}`);
  }

  markMessageAsRead(id: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/messages/${id}/read`, {});
  }

  getUnreadCount(roomId: number): Observable<{ count: number }> {
    return this.http.get<{ count: number }>(`${this.apiUrl}/rooms/${roomId}/messages/unread`);
  }

  // Users (Admin only)
  getUsers(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/users`);
  }

  getUser(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/users/${id}`);
  }

  updateUser(id: number, data: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/users/${id}`, data);
  }

  deleteUser(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/users/${id}`);
  }

  assignRoomToUser(userId: number, roomId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/users/${userId}/assign-room`, { room_id: roomId });
  }

  removeRoomFromUser(userId: number, roomId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/users/${userId}/remove-room`, { room_id: roomId });
  }
}
