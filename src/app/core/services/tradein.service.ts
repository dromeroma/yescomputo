import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { APP_CONFIG } from '../config/app-config';

export interface TradeinPayload {
  name: string;
  phone: string;
  deviceType?: string;
  brand?: string;
  model?: string;
  specs?: string;
  condition?: string;
  notes?: string;
}

/** Submits public trade-in / buyback requests. Gated server-side by `tradein`. */
@Injectable({ providedIn: 'root' })
export class TradeinService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(APP_CONFIG);

  submit(payload: TradeinPayload): Observable<{ ok: boolean; id: string }> {
    return this.http.post<{ ok: boolean; id: string }>(
      `${this.config.apiBaseUrl}/tradein`,
      payload,
    );
  }
}
