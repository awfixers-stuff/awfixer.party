import { exposeApi } from '@the_shujaa/link-shortener';
import { ConvexError } from 'convex/values';

import { components } from './_generated/api';
import { orgIdFromIdentity, requireAdminIdentity } from './lib/adminAuth';

export const {
  initConfig,
  getConfig,
  createLink,
  getLink,
  listMyLinks,
  revokeLink,
  updateLink,
  deleteLink,
  getLinkStats,
  getClicksOverTime,
  getTopReferrers,
  getGeoBreakdown,
  checkPassword,
} = exposeApi(components.linkShortener, {
  auth: async (ctx, _operation) => {
    const identity = await requireAdminIdentity(ctx.auth);
    const orgId = orgIdFromIdentity(identity);
    if (!orgId) {
      throw new ConvexError('Missing organization in session.');
    }
    return orgId;
  },
});
