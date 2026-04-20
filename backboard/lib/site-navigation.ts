export type SiteNavLink = {
  href: string;
  label: string;
};

export const siteNavigation = {
  about: [
    { href: '/about', label: 'About Page' },
    { href: '/about/values', label: 'Values' },
    { href: '/about/mission', label: 'Mission' },
  ] satisfies SiteNavLink[],
  policies: [
    { href: '/policies', label: 'Overview' },
    { href: '/policies/state', label: 'State' },
    { href: '/policies/region-circuit', label: 'Region / Circuit' },
    { href: '/policies/military', label: 'Military' },
  ] satisfies SiteNavLink[],
  legal: [
    { href: '/legal/privacy', label: 'Privacy Policy' },
    { href: '/legal/terms', label: 'Terms of Service' },
    { href: '/legal/ccpa', label: 'CCPA Notice' },
  ] satisfies SiteNavLink[],
  helpOut: [
    { href: '/help-out/region_lead', label: 'Region Lead' },
    { href: '/help-out/volunteer_lead', label: 'Volunteer Lead' },
    { href: '/help-out/event_lead', label: 'Event Lead' },
  ] satisfies SiteNavLink[],
} as const;
