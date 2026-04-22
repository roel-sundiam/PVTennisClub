import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

const APP_ID = 'pvtennisclub';

@Injectable({ providedIn: 'root' })
export class AnalyticsTrackService {
  private readonly endpoint = environment.analyticsTrackUrl;

  trackPageView(page: string, userId?: string): void {
    this.send({ event: 'page_view', appId: APP_ID, page, userId });
  }

  trackLogin(userId: string): void {
    this.send({ event: 'login', appId: APP_ID, userId });
  }

  private send(payload: object): void {
    try {
      const blob = new Blob(
        [JSON.stringify({ ...payload, timestamp: new Date().toISOString() })],
        { type: 'application/json' }
      );
      navigator.sendBeacon(this.endpoint, blob);
    } catch {
      // Tracking must never interrupt the user
    }
  }
}
