import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { FrontDeskActivity, UserSession, StatisticsPeriod } from '../models';

@Injectable({ providedIn: 'root' })
export class SessionService {
  constructor(private api: ApiService) {}

  getFrontDeskActivity(period: StatisticsPeriod): Observable<FrontDeskActivity[]> {
    return this.api.get<FrontDeskActivity[]>('/sessions/front-desk-activity', { period });
  }

  getAllSessions(period: StatisticsPeriod): Observable<UserSession[]> {
    return this.api.get<UserSession[]>('/sessions/all', { period });
  }
}
