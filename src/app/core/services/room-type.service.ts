import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { RoomType } from '../models';

@Injectable({ providedIn: 'root' })
export class RoomTypeService {
  constructor(private api: ApiService) {}

  getAll(): Observable<RoomType[]> {
    return this.api.get<RoomType[]>('/room-types');
  }

  getActive(): Observable<RoomType[]> {
    return this.api.get<RoomType[]>('/room-types/active');
  }

  create(data: Partial<RoomType>): Observable<RoomType> {
    return this.api.post<RoomType>('/room-types', data);
  }

  update(id: string, data: Partial<RoomType>): Observable<RoomType> {
    return this.api.patch<RoomType>(`/room-types/${id}`, data);
  }

  delete(id: string): Observable<void> {
    return this.api.delete<void>(`/room-types/${id}`);
  }
}
