import type { LucideIcon } from 'lucide-react';
import { FileEdit, Globe, Home, Layout, LineChart, Link2, Mail, PenTool, Users } from 'lucide-react';

export type AdminNavItem = {
  title: string;
  href: string;
  icon: LucideIcon;
};

export const adminNavItems: AdminNavItem[] = [
  { title: 'Overview', href: '/admin', icon: Home },
  { title: 'Submissions', href: '/admin/submissions', icon: Users },
  { title: 'Forms', href: '/admin/forms', icon: FileEdit },
  { title: 'Newsletter', href: '/admin/newsletter', icon: Mail },
  { title: 'Short links', href: '/admin/links', icon: Link2 },
  { title: 'Navigation', href: '/admin/navigation', icon: Globe },
  { title: 'Footer', href: '/admin/footer', icon: Layout },
  { title: 'Editor', href: '/admin/editor', icon: PenTool },
  { title: 'Analytics', href: '/admin/analytics', icon: LineChart },
];
