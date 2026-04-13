import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { User } from '../models';

@Injectable({ providedIn: 'root' })
export class UserService {
  constructor(private api: ApiService) {}

  getAll(): Observable<User[]> {
    return this.api.get<User[]>('/users');
  }

  getById(id: string): Observable<User> {
    return this.api.get<User>(`/users/${id}`);
  }

  create(data: Partial<User> & { password: string }): Observable<User> {
    return this.api.post<User>('/users', data);
  }

  update(id: string, data: Partial<User>): Observable<User> {
    return this.api.patch<User>(`/users/${id}`, data);
  }

  delete(id: string): Observable<void> {
    return this.api.delete<void>(`/users/${id}`);
  }

  activate(id: string): Observable<User> {
    return this.api.patch<User>(`/users/${id}/activate`);
  }

  deactivate(id: string): Observable<User> {
    return this.api.patch<User>(`/users/${id}/deactivate`);
  }
}
