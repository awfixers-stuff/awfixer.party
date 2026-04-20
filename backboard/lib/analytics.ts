const TRACK_URL = 'https://http.awfixer.party/track';
const SESSION_KEY = 'analytics_sid';

export function getSessionId(): string {
  let sid = sessionStorage.getItem(SESSION_KEY);
  if (!sid) {
    sid = crypto.randomUUID();
    sessionStorage.setItem(SESSION_KEY, sid);
  }
  return sid;
}

export type TrackPayload = {
  type: 'pageview' | 'event';
  path: string;
  sessionId: string;
  referrer?: string;
  name?: string;
  props?: Record<string, unknown>;
};

export function sendTrack(payload: TrackPayload) {
  if (typeof navigator === 'undefined') return;
  const body = JSON.stringify(payload);
  const blob = new Blob([body], { type: 'application/json' });
  if (navigator.sendBeacon(TRACK_URL, blob)) return;
  fetch(TRACK_URL, {
    method: 'POST',
    body,
    headers: { 'Content-Type': 'application/json' },
    keepalive: true,
    credentials: 'omit',
  }).catch(() => {});
}
