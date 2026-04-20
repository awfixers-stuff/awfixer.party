// This file configures the initialization of Sentry on the client.
// The added config here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: 'https://1afb4d8537c590e4d6249b119602aa1c@o4510831268528128.ingest.us.sentry.io/4511245592166400',

  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1,

  enableLogs: true,

  sendDefaultPii: false,
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
