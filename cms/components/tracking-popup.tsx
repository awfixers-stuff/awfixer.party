'use client';

import { useSyncExternalStore } from 'react';

const DISMISS_EVENT = 'tracking-popup-dismiss';

function subscribeToDismiss(callback: () => void) {
  const handleStorage = () => callback();
  const handleCustom = () => callback();
  addEventListener('storage', handleStorage);
  addEventListener(DISMISS_EVENT, handleCustom);
  return () => {
    removeEventListener('storage', handleStorage);
    removeEventListener(DISMISS_EVENT, handleCustom);
  };
}

const emptySession = {
  getItem: () => null,
  setItem: () => {},
};

const session = typeof sessionStorage !== 'undefined' ? sessionStorage : emptySession;

function getDismissed(): string | null {
  return session.getItem('tracking-popup-dismissed');
}

function setDismissed(value: string): void {
  session.setItem('tracking-popup-dismissed', value);
  // Dispatch custom event to trigger re-render in the same tab
  dispatchEvent(new Event(DISMISS_EVENT));
}

export function TrackingPopup() {
  const dismissed = useSyncExternalStore(
    subscribeToDismiss,
    () => getDismissed(),
    () => null,
  );

  const handleDismiss = () => {
    setDismissed('true');
  };

  if (dismissed) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-lg border bg-background p-6 shadow-lg">
        <h2 className="mb-4 text-lg font-semibold">Third-Party Tracking</h2>
        <p className="mb-4 text-sm text-muted-foreground">
          We use third-party tracking on this website. You cannot opt out of tracking, but you may
          contact{' '}
          <a
            href="mailto:privacy@awfixer.party"
            className="text-primary underline hover:no-underline"
          >
            privacy@awfixer.party
          </a>{' '}
          for your options regarding data removal.
        </p>
        <button
          onClick={handleDismiss}
          className="w-full rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90"
        >
          I Understand
        </button>
      </div>
    </div>
  );
}
