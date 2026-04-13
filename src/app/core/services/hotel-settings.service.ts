import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { HotelSettings, PolicyTemplate } from '../models';

@Injectable({ providedIn: 'root' })
export class HotelSettingsService {
  constructor(private api: ApiService) {}

  getSettings(): Observable<HotelSettings> {
    return this.api.get<HotelSettings>('/hotel-settings');
  }

  updateSettings(data: Partial<HotelSettings>): Observable<HotelSettings> {
    return this.api.patch<HotelSettings>('/hotel-settings', data);
  }

  getPolicies(): Observable<PolicyTemplate[]> {
    return this.api.get<PolicyTemplate[]>('/hotel-settings/policies');
  }

  getActivePolicies(): Observable<PolicyTemplate[]> {
    return this.api.get<PolicyTemplate[]>('/hotel-settings/policies/active');
  }

  createPolicy(data: Partial<PolicyTemplate>): Observable<PolicyTemplate> {
    return this.api.post<PolicyTemplate>('/hotel-settings/policies', data);
  }

  updatePolicy(id: string, data: Partial<PolicyTemplate>): Observable<PolicyTemplate> {
    return this.api.patch<PolicyTemplate>(`/hotel-settings/policies/${id}`, data);
  }

  deletePolicy(id: string): Observable<void> {
    return this.api.delete<void>(`/hotel-settings/policies/${id}`);
  }
}
