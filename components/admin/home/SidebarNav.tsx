"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  HomeIcon,
  UserIcon,
  TicketIcon,
  CalendarDaysIcon,
  ShoppingCartIcon,
  ChatBubbleLeftRightIcon,
} from "@heroicons/react/24/outline";

const navLinks = [
  { href: "/admin", label: "Dashboard", icon: <HomeIcon className="w-5 h-5" /> },
  { href: "/admin/usuarios", label: "Usuarios", icon: <UserIcon className="w-5 h-5" /> },
  { href: "/admin/wildcards", label: "Wildcards", icon: <TicketIcon className="w-5 h-5" /> },
  { href: "/admin/eventos", label: "Eventos", icon: <CalendarDaysIcon className="w-5 h-5" /> },
  { href: "/admin/compras", label: "Compras", icon: <ShoppingCartIcon className="w-5 h-5" /> },
  { href: "/admin/sugerencias", label: "Sugerencias", icon: <ChatBubbleLeftRightIcon className="w-5 h-5" /> },
];

export default function SidebarNav() {
  const pathname = usePathname();
  return (
    <nav className="flex flex-col gap-1 text-[15px] font-medium">
      {navLinks.map(link => (
        <Link
          key={link.href}
          href={link.href}
          className={`flex items-center gap-3 px-4 py-2 rounded transition-colors font-medium
            ${
              pathname === link.href
                ? "bg-indigo-100 text-indigo-700 shadow"
                : "text-gray-700 hover:bg-indigo-50 hover:text-indigo-700"
            }
          `}
          prefetch={link.href === "/admin"}
        >
          {link.icon}
          {link.label}
        </Link>
      ))}
    </nav>
  );
}