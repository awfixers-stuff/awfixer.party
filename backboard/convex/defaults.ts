/** Default site chrome + picklists — used for seeding and query fallbacks. */

export const DEFAULT_SITE_CHROME = {
  key: 'main' as const,
  brandLabel: 'AWFixer Party',
  navGroups: [
    {
      id: 'about',
      triggerLabel: 'About',
      overviewHref: '/about',
      overviewTitle: 'About',
      overviewDescription: 'Learn more about who we are and what we stand for.',
      links: [
        { href: '/about', label: 'About Page' },
        { href: '/about/values', label: 'Values' },
        { href: '/about/mission', label: 'Mission' },
      ],
    },
    {
      id: 'help-out',
      triggerLabel: 'Help Out',
      overviewHref: '/help-out',
      overviewTitle: 'Help Out',
      overviewDescription: 'Apply to lead a region, coordinate volunteers, or run events.',
      links: [
        { href: '/help-out/region_lead', label: 'Region Lead' },
        { href: '/help-out/volunteer_lead', label: 'Volunteer Lead' },
        { href: '/help-out/event_lead', label: 'Event Lead' },
      ],
    },
    {
      id: 'policies',
      triggerLabel: 'Policies',
      overviewHref: '/policies',
      overviewTitle: 'Policies',
      overviewDescription: 'Guidelines and standards for how we operate and collaborate.',
      links: [
        { href: '/policies', label: 'Overview' },
        { href: '/policies/state', label: 'State' },
        { href: '/policies/region-circuit', label: 'Region / Circuit' },
        { href: '/policies/military', label: 'Military' },
      ],
    },
    {
      id: 'legal',
      triggerLabel: 'Legal',
      overviewHref: '/legal/privacy',
      overviewTitle: 'Legal',
      overviewDescription: 'Policies and notices that govern use of this site.',
      links: [
        { href: '/legal/privacy', label: 'Privacy Policy' },
        { href: '/legal/terms', label: 'Terms of Service' },
        { href: '/legal/ccpa', label: 'CCPA Notice' },
      ],
    },
  ],
  footerBrandName: 'AWFixer Party',
  footerTagline: 'Independent. Transparent. Community-driven.',
  footerColumns: [
    {
      id: 'about',
      heading: 'About',
      links: [
        { href: '/about', label: 'About Page' },
        { href: '/about/values', label: 'Values' },
        { href: '/about/mission', label: 'Mission' },
      ],
    },
    {
      id: 'policies',
      heading: 'Policies',
      links: [
        { href: '/policies', label: 'Overview' },
        { href: '/policies/state', label: 'State' },
        { href: '/policies/region-circuit', label: 'Region / Circuit' },
        { href: '/policies/military', label: 'Military' },
      ],
    },
    {
      id: 'legal',
      heading: 'Legal',
      links: [
        { href: '/legal/privacy', label: 'Privacy Policy' },
        { href: '/legal/terms', label: 'Terms of Service' },
        { href: '/legal/ccpa', label: 'CCPA Notice' },
      ],
    },
  ],
  copyrightText: 'AWFixer Party. All rights reserved.',
};

export const DEFAULT_REGIONS = [
  'Northeast',
  'Southeast',
  'Midwest',
  'Southwest',
  'West',
  'Pacific',
];

export const DEFAULT_STATES = [
  'AL',
  'AK',
  'AZ',
  'AR',
  'CA',
  'CO',
  'CT',
  'DE',
  'FL',
  'GA',
  'HI',
  'ID',
  'IL',
  'IN',
  'IA',
  'KS',
  'KY',
  'LA',
  'ME',
  'MD',
  'MA',
  'MI',
  'MN',
  'MS',
  'MO',
  'MT',
  'NE',
  'NV',
  'NH',
  'NJ',
  'NM',
  'NY',
  'NC',
  'ND',
  'OH',
  'OK',
  'OR',
  'PA',
  'RI',
  'SC',
  'SD',
  'TN',
  'TX',
  'UT',
  'VT',
  'VA',
  'WA',
  'WV',
  'WI',
  'WY',
];

export const DEFAULT_NEWSLETTER = {
  key: 'default' as const,
  enabled: true,
  provider: 'substack_embed' as const,
  embedHtml: undefined as string | undefined,
  subscribeUrl: undefined as string | undefined,
  heading: 'Newsletter',
  subheading: 'Subscribe for updates. Embed can be added from the admin when ready.',
};

export const DEFAULT_HELP_OUT_ROLES: Array<{
  roleSlug: string;
  title: string;
  description: string;
  requirements: string[];
  sortOrder: number;
}> = [
  {
    roleSlug: 'region_lead',
    title: 'Region Lead',
    description: 'Lead our organization in your region, coordinating volunteers and events.',
    requirements: [
      'Must be located in the region you wish to lead',
      'Must be available for weekly meetings',
      'Must have social media presence',
    ],
    sortOrder: 0,
  },
  {
    roleSlug: 'volunteer_lead',
    title: 'Volunteer Lead',
    description: 'Recruit, train, and manage volunteers for our cause.',
    requirements: [
      'Must have experience managing teams',
      'Must be available on weekends',
      'Must have excellent communication skills',
    ],
    sortOrder: 1,
  },
  {
    roleSlug: 'event_lead',
    title: 'Event Lead',
    description: 'Plan and execute events, rallies, and community gatherings.',
    requirements: [
      'Must have event planning experience',
      'Must be available for event days',
      'Must be comfortable public speaking',
    ],
    sortOrder: 2,
  },
];

/** Fallback TOC for routes with static JSX (until fully migrated to TipTap bodies). */
export const DEFAULT_TOC_ENTRIES: Array<{
  path: string;
  items: Array<{ id: string; title: string; level: number }>;
}> = [
  {
    path: '/about',
    items: [
      { id: 'what-we-stand-for', title: 'What We Stand For', level: 2 },
      { id: 'get-involved', title: 'Get Involved', level: 2 },
    ],
  },
  {
    path: '/about/mission',
    items: [
      {
        id: 'what-were-working-toward',
        title: "What We're Working Toward",
        level: 2,
      },
      { id: 'how-we-get-there', title: 'How We Get There', level: 2 },
      { id: 'join-us', title: 'Join Us', level: 2 },
    ],
  },
  {
    path: '/about/values',
    items: [
      { id: 'transparency', title: 'Transparency', level: 2 },
      { id: 'community-first', title: 'Community First', level: 2 },
      { id: 'privacy', title: 'Privacy', level: 2 },
      { id: 'independence', title: 'Independence', level: 2 },
      { id: 'accountability', title: 'Accountability', level: 2 },
    ],
  },
  {
    path: '/policies',
    items: [
      { id: 'state', title: 'State', level: 2 },
      { id: 'region-circuit', title: 'Region / Circuit', level: 2 },
      { id: 'military', title: 'Military', level: 2 },
      {
        id: 'how-to-read-these-documents',
        title: 'How to Read These Documents',
        level: 2,
      },
      { id: 'updates', title: 'Updates', level: 2 },
    ],
  },
  {
    path: '/policies/state',
    items: [
      { id: 'topic-areas', title: 'Topic areas', level: 2 },
      { id: 'related', title: 'Related', level: 2 },
    ],
  },
  {
    path: '/policies/region-circuit',
    items: [
      { id: 'topic-areas', title: 'Topic areas', level: 2 },
      { id: 'related', title: 'Related', level: 2 },
    ],
  },
  {
    path: '/policies/military',
    items: [{ id: 'subsections', title: 'Subsections', level: 2 }],
  },
  {
    path: '/legal/privacy',
    items: [
      { id: 'third-party-tracking', title: 'Third-Party Tracking', level: 2 },
      { id: 'data-collection', title: 'Data Collection', level: 2 },
      { id: 'how-we-use-your-data', title: 'How We Use Your Data', level: 2 },
      { id: 'contact', title: 'Contact', level: 2 },
    ],
  },
  {
    path: '/legal/terms',
    items: [
      { id: 'acceptance', title: 'Acceptance', level: 2 },
      { id: 'use-of-service', title: 'Use of Service', level: 2 },
      { id: 'contact', title: 'Contact', level: 2 },
    ],
  },
  {
    path: '/legal/ccpa',
    items: [
      { id: 'your-rights', title: 'Your Rights', level: 2 },
      { id: 'contact', title: 'Contact', level: 2 },
    ],
  },
];
