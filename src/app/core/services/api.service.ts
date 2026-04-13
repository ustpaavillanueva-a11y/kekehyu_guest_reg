import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

const API_URL = environment.apiUrl;

@Injectable({ providedIn: 'root' })
export class ApiService {
  constructor(private http: HttpClient) {}

  get<T>(path: string, params?: Record<string, string>): Observable<T> {
    return this.http.get<T>(`${API_URL}${path}`, { params });
  }

  post<T>(path: string, body: unknown = {}): Observable<T> {
    return this.http.post<T>(`${API_URL}${path}`, body);
  }

  patch<T>(path: string, body: unknown = {}): Observable<T> {
    return this.http.patch<T>(`${API_URL}${path}`, body);
  }

  delete<T>(path: string): Observable<T> {
    return this.http.delete<T>(`${API_URL}${path}`);
  }
}
