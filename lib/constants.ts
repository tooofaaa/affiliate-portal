import { StoreIcon, WalletIcon, ActivityIcon, OrdersIcon, ProductsIcon, CheckCircleIcon } from "./icons";

export const MAIN_NAV_LINKS = [
  { href: "/dashboard", label: "Dashboard", icon: StoreIcon },
  { href: "/links", label: "My Links", icon: ActivityIcon },
  { href: "/codes", label: "Discount Codes", icon: ProductsIcon },
  { href: "/wallet", label: "Wallet", icon: WalletIcon },
  { href: "/performance", label: "Performance", icon: OrdersIcon },
  { href: "/support", label: "Support", icon: CheckCircleIcon },
];

export const FOOTER_NAV_LINKS = [
  { href: "/profile", label: "Profile", icon: StoreIcon },
  { href: "/settings", label: "Settings", icon: StoreIcon },
];
