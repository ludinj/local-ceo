import {
  ArrowLeft,
  BarChart3,
  Briefcase,
  Building2,
  ChevronDown,
  CreditCard,
  DollarSign,
  FileText,
  Home,
  LayoutDashboard,
  LogOut,
  Megaphone,
  Package,
  Settings,
  Shield,
  ShoppingBag,
  User,
  Users,
  type LucideIcon,
} from "lucide-react";

const icons = {
  home: Home,
  building: Building2,
  "log-out": LogOut,
  "arrow-left": ArrowLeft,
  "chevron-down": ChevronDown,
  dashboard: LayoutDashboard,
  briefcase: Briefcase,
  sales: DollarSign,
  customers: Users,
  inventory: Package,
  billing: CreditCard,
  expenses: ShoppingBag,
  marketing: Megaphone,
  analytics: BarChart3,
  reports: FileText,
  employees: User,
  agents: Shield,
  members: Users,
  settings: Settings,
} satisfies Record<string, LucideIcon>;

const iconSizes = {
  xs: 12,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32,
} as const;

export type AppIconName = keyof typeof icons;
export type AppIconSize = keyof typeof iconSizes | number;

interface AppIconProps {
  name: AppIconName;
  size?: AppIconSize;
  className?: string;
  strokeWidth?: number;
  "aria-hidden"?: boolean;
}

export function AppIcon({
  name,
  size = "sm",
  className,
  strokeWidth = 2,
  "aria-hidden": ariaHidden = true,
}: AppIconProps) {
  const IconComponent = icons[name];

  const resolvedSize = typeof size === "number" ? size : iconSizes[size];

  return (
    <IconComponent
      size={resolvedSize}
      strokeWidth={strokeWidth}
      className={className}
      aria-hidden={ariaHidden}
    />
  );
}
