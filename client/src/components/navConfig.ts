import {
  IconAddressBook,
  IconBell,
  IconCalendar,
  IconFiles,
  IconFileText,
  IconHistory,
  IconLayoutDashboard,
  IconReceipt2,
  IconShieldLock,
  IconTrophy,
  IconUsers,
  IconUsersGroup,
  IconCash,
  IconReportMoney,
  type Icon,
} from '@tabler/icons-react'

export interface NavItem {
  label: string
  path: string
  icon: Icon
}

export interface NavSection {
  label: string
  items: NavItem[]
}

/** Keep only the nav items (and non-empty sections) the user's role can open. */
export function filterNavSections(
  sections: NavSection[],
  allowedPaths: ReadonlySet<string>,
): NavSection[] {
  return sections
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => allowedPaths.has(item.path)),
    }))
    .filter((section) => section.items.length > 0)
}

export const primaryNavSections: NavSection[] = [
  {
    label: 'Overview',
    items: [
      { label: 'Dashboard', path: '/dashboard', icon: IconLayoutDashboard },
      { label: 'Schedule', path: '/schedule', icon: IconCalendar },
      { label: 'History', path: '/history', icon: IconHistory },
    ],
  },
]

export const navSections: NavSection[] = [
  {
    label: 'Access',
    items: [
      { label: 'Roles', path: '/roles', icon: IconShieldLock },
      { label: 'Pages', path: '/pages', icon: IconFiles },
      { label: 'Users', path: '/users', icon: IconUsers },
    ],
  },
  {
    label: 'Contacts',
    items: [{ label: 'Contacts', path: '/contacts', icon: IconAddressBook }],
  },
  {
    label: 'Groups',
    items: [
      { label: 'Groups', path: '/groups', icon: IconUsersGroup },
      { label: 'Group members', path: '/group-members', icon: IconUsers },
      { label: 'Group expenses', path: '/group-expenses', icon: IconReceipt2 },
    ],
  },
  {
    label: 'Debts',
    items: [
      { label: 'Debts', path: '/debts', icon: IconReportMoney },
      { label: 'Payments', path: '/payments', icon: IconCash },
    ],
  },
  {
    label: 'Activity',
    items: [
      { label: 'Notifications', path: '/notifications', icon: IconBell },
      { label: 'Achievements', path: '/achievements', icon: IconTrophy },
      { label: 'Logs', path: '/logs', icon: IconFileText },
    ],
  },
]
