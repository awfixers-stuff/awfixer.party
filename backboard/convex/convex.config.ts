import linkShortener from '@the_shujaa/link-shortener/convex.config.js';
import { defineApp } from 'convex/server';

const app = defineApp();
app.use(linkShortener);

export default app;
