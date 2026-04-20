'use client';

import {
  OrganizationSwitcher,
  SignInButton,
  UserButton,
  useOrganizationList,
  useUser,
} from '@clerk/nextjs';
import { Menu } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import * as React from 'react';

import { useAdminAllowlist } from '@/components/admin/admin-allowlist-provider';
import { Button } from '@/components/ui/button';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { useAnalytics } from '@/hooks/use-analytics';
import { adminNavItems } from '@/lib/admin/nav';
import type { SiteChromePayload } from '@/lib/convex-server';
import { cn } from '@/lib/utils';

function NavLink({
  href,
  children,
  isActive,
  section,
}: {
  href: string;
  children: React.ReactNode;
  isActive: boolean;
  section?: string;
}) {
  const { track } = useAnalytics();
  return (
    <Link
      href={href}
      className={cn(
        navigationMenuTriggerStyle(),
        'bg-transparent data-active:bg-muted',
        isActive && 'text-primary font-semibold',
      )}
      onClick={() =>
        track('nav_click', {
          href,
          label: typeof children === 'string' ? children : href,
          section: section ?? 'desktop',
        })
      }
    >
      {children}
    </Link>
  );
}

function AdminNav() {
  const pathname = usePathname();
  return (
    <div className="flex items-center gap-1 flex-row-reverse mr-2">
      {adminNavItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors',
              isActive
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground',
            )}
          >
            <Icon className="size-4 shrink-0" aria-hidden />
            <span className="hidden lg:inline">{item.title}</span>
          </Link>
        );
      })}
    </div>
  );
}

type NavGroupItem = SiteChromePayload['navGroups'][number];

function NavGroupDropdownItem({
  group,
  pathname,
}: {
  group: NavGroupItem;
  pathname: string;
}) {
  const { track } = useAnalytics();
  return (
    <NavigationMenuItem key={group.id}>
      <NavigationMenuTrigger>{group.triggerLabel}</NavigationMenuTrigger>
      <NavigationMenuContent>
        <ul className="grid gap-3 p-6 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
          <li className="row-span-3">
            <NavigationMenuLink asChild>
              <Link
                href={group.overviewHref}
                className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md"
                onClick={() =>
                  track('nav_click', {
                    href: group.overviewHref,
                    label: group.overviewTitle,
                    section: group.triggerLabel,
                  })
                }
              >
                <div className="mb-2 mt-4 text-lg font-medium">{group.overviewTitle}</div>
                <p className="text-sm leading-tight text-muted-foreground">
                  {group.overviewDescription}
                </p>
              </Link>
            </NavigationMenuLink>
          </li>
          {group.links.map((item) => (
            <li key={item.href}>
              <NavigationMenuLink asChild>
                <NavLink
                  href={item.href}
                  isActive={pathname === item.href}
                  section={group.triggerLabel}
                >
                  {item.label}
                </NavLink>
              </NavigationMenuLink>
            </li>
          ))}
        </ul>
      </NavigationMenuContent>
    </NavigationMenuItem>
  );
}

function DesktopNav({ chrome }: { chrome: SiteChromePayload }) {
  const pathname = usePathname();

  return (
    <NavigationMenu>
      <NavigationMenuList>
        {chrome.navGroups.map((group) => (
          <NavGroupDropdownItem key={group.id} group={group} pathname={pathname} />
        ))}
        {chrome.communityNavGroup && (
          <NavGroupDropdownItem
            key="community"
            group={chrome.communityNavGroup}
            pathname={pathname}
          />
        )}
        {chrome.resourceNavGroup && (
          <NavGroupDropdownItem
            key="resources"
            group={chrome.resourceNavGroup}
            pathname={pathname}
          />
        )}
      </NavigationMenuList>
    </NavigationMenu>
  );
}

function MobileNavLink({
  href,
  children,
  isActive,
  section,
}: {
  href: string;
  children: React.ReactNode;
  isActive: boolean;
  section?: string;
}) {
  const { track } = useAnalytics();
  return (
    <Link
      href={href}
      className={cn(
        'block rounded-md px-3 py-2.5 text-sm font-medium transition-colors',
        'hover:bg-background/80 hover:text-foreground',
        isActive ? 'bg-background text-primary shadow-sm' : 'text-foreground/90',
      )}
      onClick={() =>
        track('nav_click', {
          href,
          label: typeof children === 'string' ? children : href,
          section: section ?? 'mobile',
        })
      }
    >
      {children}
    </Link>
  );
}

function MobileNavSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-lg border border-border/80 bg-muted/40 p-4">
      <h2 className="mb-3 text-sm font-semibold tracking-tight text-foreground">{title}</h2>
      <ul className="flex flex-col gap-1">{children}</ul>
    </section>
  );
}

function MobileNavGroup({ group, pathname }: { group: NavGroupItem; pathname: string }) {
  return (
    <MobileNavSection title={group.triggerLabel}>
      <li>
        <MobileNavLink href={group.overviewHref} isActive={pathname === group.overviewHref}>
          Overview
        </MobileNavLink>
      </li>
      {group.links.map((item) => (
        <li key={item.href}>
          <MobileNavLink href={item.href} isActive={pathname === item.href}>
            {item.label}
          </MobileNavLink>
        </li>
      ))}
    </MobileNavSection>
  );
}

function MobileNav({ chrome }: { chrome: SiteChromePayload }) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-5" aria-label="Main">
      {chrome.navGroups.map((group) => (
        <MobileNavGroup key={group.id} group={group} pathname={pathname} />
      ))}
      {chrome.communityNavGroup && (
        <MobileNavGroup key="community" group={chrome.communityNavGroup} pathname={pathname} />
      )}
      {chrome.resourceNavGroup && (
        <MobileNavGroup key="resources" group={chrome.resourceNavGroup} pathname={pathname} />
      )}
    </nav>
  );
}

export function NavigationBar({ chrome }: { chrome: SiteChromePayload }) {
  const [open, setOpen] = React.useState(false);
  const { user, isLoaded: userLoaded, isSignedIn } = useUser();
  const { userMemberships, isLoaded: orgListLoaded } = useOrganizationList({
    userMemberships: { pageSize: 100 },
  });
  const pathname = usePathname();
  const isAdminSection = pathname.startsWith('/admin');

  const allowedAdminOrganizationIds = useAdminAllowlist();
  const allowedAdminSet = React.useMemo(
    () => new Set(allowedAdminOrganizationIds),
    [allowedAdminOrganizationIds],
  );

  const hasAdminAccess = React.useMemo(() => {
    if (!userLoaded || !orgListLoaded || !isSignedIn) return false;
    const fromList = userMemberships.data ?? [];
    if (fromList.length > 0) {
      return fromList.some((m) => allowedAdminSet.has(m.organization.id));
    }
    return (user?.organizationMemberships ?? []).some((m) =>
      allowedAdminSet.has(m.organization.id),
    );
  }, [
    userLoaded,
    orgListLoaded,
    isSignedIn,
    userMemberships.data,
    user?.organizationMemberships,
    allowedAdminSet,
  ]);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-14 w-full max-w-7xl items-center px-6 sm:px-8 lg:px-10 xl:px-12">
        <Link href="/" className="mr-6 flex items-center space-x-2 font-semibold shrink-0">
          <span>{chrome.brandLabel}</span>
        </Link>

        {!isAdminSection && (
          <nav className="hidden md:flex md:flex-1">
            <DesktopNav chrome={chrome} />
          </nav>
        )}

        <div className="flex flex-1 items-center justify-end gap-2">
          {isAdminSection ? (
            <>
              <div className="hidden md:block">
                <AdminNav />
              </div>
              <OrganizationSwitcher
                afterSelectOrganizationUrl="/admin"
                appearance={{
                  elements: {
                    rootBox: 'max-w-[min(100%,18rem)]',
                  },
                }}
              />
            </>
          ) : (
            hasAdminAccess && (
              <Link
                href="/admin"
                className="hidden md:inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
              >
                Admin
              </Link>
            )
          )}

          {user ? (
            <UserButton />
          ) : (
            <SignInButton mode="modal">
              <Button variant="secondary" size="sm">
                Sign In
              </Button>
            </SignInButton>
          )}

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="size-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="w-[min(100%,20rem)] border-l border-border bg-background sm:max-w-sm"
            >
              <SheetHeader className="border-b border-border px-6 pb-4 pr-12 pt-3 text-left sm:px-8">
                <SheetTitle className="text-base font-semibold">Menu</SheetTitle>
              </SheetHeader>
              <div className="overflow-y-auto px-6 pb-8 pt-6 sm:px-8">
                {isAdminSection ? (
                  <nav className="flex flex-col gap-4">
                    <section className="rounded-lg border border-border/80 bg-muted/40 p-4">
                      <h2 className="mb-3 text-sm font-semibold tracking-tight text-foreground">
                        Admin Controls
                      </h2>
                      <ul className="flex flex-col gap-1">
                        {adminNavItems.map((item) => {
                          const Icon = item.icon;
                          return (
                            <li key={item.href}>
                              <MobileNavLink
                                href={item.href}
                                isActive={pathname === item.href}
                                section="admin"
                              >
                                <div className="flex items-center gap-2">
                                  <Icon className="size-4" />
                                  {item.title}
                                </div>
                              </MobileNavLink>
                            </li>
                          );
                        })}
                      </ul>
                    </section>
                  </nav>
                ) : (
                  <>
                    {hasAdminAccess && (
                      <div className="mb-6">
                        <MobileNavLink href="/admin" isActive={false} section="mobile-admin">
                          Go to Admin
                        </MobileNavLink>
                      </div>
                    )}
                    <MobileNav chrome={chrome} />
                  </>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
