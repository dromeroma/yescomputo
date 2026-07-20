import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { APP_CONFIG } from '../config/app-config';

export interface TrackStatus {
  key: string;
  label: string;
  publicLabel: string;
  tone: string;
}

export interface TrackEvent {
  status: TrackStatus;
  note: string | null;
  at: string | null;
}

export interface TrackResult {
  code: string;
  customerName: string;
  customerPhoneMasked: string | null;
  device: { type: string | null; brand: string | null; model: string | null };
  reportedIssue: string;
  status: TrackStatus;
  estimatedReadyAt: string | null;
  pickupNotes: string | null;
  receivedAt: string | null;
  deliveredAt: string | null;
  timeline: TrackEvent[];
}

/** Public service-order tracking (by guide code). */
@Injectable({ providedIn: 'root' })
export class ServiceTrackingService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(APP_CONFIG);

  track(code: string): Observable<TrackResult> {
    return this.http.get<TrackResult>(`${this.config.apiBaseUrl}/service/track`, {
      params: { code: code.trim() },
    });
  }
}
