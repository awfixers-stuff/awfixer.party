import { v } from 'convex/values';

export const MIN_FIELDS = 4;
export const MAX_FIELDS = 50;

export const MAX_FORM_NAME_LENGTH = 200;
export const MAX_SLUG_LENGTH = 80;
export const MAX_FIELD_LABEL_LENGTH = 200;
export const MAX_ANSWER_LENGTH = 5000;
export const MAX_SELECT_OPTION_LENGTH = 200;
export const MAX_SELECT_OPTIONS = 50;
export const SLUG_RE = /^[a-z0-9][a-z0-9-]*[a-z0-9]$|^[a-z0-9]$/;

export const RATE_LIMIT_WINDOW_MS = 60_000;
export const RATE_LIMIT_MAX_PER_WINDOW = 20;

export const fieldType = v.union(
  v.literal('text'),
  v.literal('textarea'),
  v.literal('select'),
  v.literal('checkbox'),
);

export const formKind = v.union(
  v.literal('survey'),
  v.literal('application'),
  v.literal('feedback'),
  v.literal('contact'),
);

export const formField = v.object({
  id: v.string(),
  label: v.string(),
  type: fieldType,
  order: v.number(),
  selectOptions: v.optional(v.array(v.string())),
  required: v.optional(v.boolean()),
});
