import '@angular/compiler';
import { describe, it, expect, vi } from 'vitest';
import { ReplaySubject, of } from 'rxjs';
import { ActivityLogService } from './activity-log';

describe('ActivityLogService', () => {
  it('should emit the newest activity to the replay stream', () => {
    const activity = {
      id: 1,
      action: 'create',
      attributeId: 101,
      attributeName: 'Test Attribute',
      timestamp: new Date()
    } as const;

    const http = {
      get: vi.fn().mockReturnValue(of([])),
      post: vi.fn().mockReturnValue(of(activity))
    } as any;

    const service = Object.create(ActivityLogService.prototype) as ActivityLogService & {
      http: any;
      activitySubject: ReplaySubject<any>;
      activity$: any;
      nextId: number;
    };

    service.http = http;
    service.activitySubject = new ReplaySubject(10);
    service.activity$ = service.activitySubject.asObservable();
    service.nextId = 1;

    const seen: any[] = [];
    service.activity$.subscribe((value: any) => seen.push(value));

    service.logActivity('create', {
      attributeId: 101,
      attributeName: 'Test Attribute'
    });

    expect(http.post).toHaveBeenCalled();
    expect(seen.length).toBeGreaterThan(0);
  });
});
