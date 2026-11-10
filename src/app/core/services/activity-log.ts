
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ReplaySubject, tap } from 'rxjs';

import { environment } from '../../../environments/environment';

export type ActivityAction = 'create' | 'edit' | 'delete';

export interface ActivityLog {
  id: number;
  action: ActivityAction;
  attributeId: number;
  attributeName: string;
  timestamp: Date;
}

@Injectable({
  providedIn: 'root'
})
export class ActivityLogService {
  private http = inject(HttpClient);
  private activitySubject = new ReplaySubject<ActivityLog>(10);
  activity$ = this.activitySubject.asObservable();

  private apiUrl = `${environment.apiBaseUrl}/activity-log`;
  private nextId = 1;

  constructor() {
    this.loadRecentActivities();
  }

  private loadRecentActivities(): void {
    this.http.get<ActivityLog[]>(this.apiUrl).pipe(
      tap(activities => {
        const recentActivities = [...activities]
          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
          .slice(0, 10);

        if (recentActivities.length > 0) {
          this.nextId = recentActivities.reduce(
            (maxId, activity) => Math.max(maxId, activity.id),
            0
          ) + 1;
        }

        recentActivities.forEach(activity => {
          this.activitySubject.next(activity);
        });
      })
    ).subscribe();
  }

  logActivity(
    action: ActivityAction,
    attribute: Pick<ActivityLog, 'attributeId' | 'attributeName'>
  ): void {
    const activity: ActivityLog = {
      id: this.nextId++,
      action,
      attributeId: attribute.attributeId,
      attributeName: attribute.attributeName,
      timestamp: new Date()
    };

    this.http.post<ActivityLog>(this.apiUrl, activity).pipe(
      tap(savedActivity => {
        console.log('Activity persisted:', savedActivity);
        this.activitySubject.next(savedActivity);
      })
    ).subscribe({
      error: error => {
        console.error('Failed to persist activity:', error);
      }
    });
  }
}
