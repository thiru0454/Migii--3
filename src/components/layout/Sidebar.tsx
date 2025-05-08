import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  Home,
  Menu,
  User,
  Users,
  MessageSquare,
  LogIn,
  UserPlus,
  ShieldAlert,
  X,
  LogOut,
  Building,
  Briefcase,
  Settings as SettingsIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

// Define interface for menu items
interface SidebarLinkItem {
  title: string;
  href: string;
  icon: React.ForwardRefExoticComponent<any>;
  public?: boolean;
  isHighlighted?: boolean;
}

const sidebarLinks: SidebarLinkItem[] = [
  {
    title: "Home",
    href: "/",
    icon: Home,
    public: true
  },
  {
    title: "Available Jobs",
    href: "/jobs",
    icon: Briefcase,
    public: true,
    isHighlighted: true
  }
];

// Admin-only links
const adminLinks: SidebarLinkItem[] = [
  {
    title: "Admin Dashboard",
    href: "/admin-dashboard",
    icon: ShieldAlert,
  },
  {
    title: "Manage Workers",
    href: "/admin-dashboard/workers",
    icon: Users,
  },
  {
    title: "Manage Businesses",
    href: "/admin-dashboard/businesses",
    icon: Building,
  },
  {
    title: "Support Requests",
    href: "/admin-dashboard/support-requests",
    icon: MessageSquare,
  },
];

// Business-only links
const businessLinks: SidebarLinkItem[] = [
  {
    title: "Business Dashboard",
    href: "/business-dashboard",
    icon: Building,
  },
  {
    title: "Manage Workers",
    href: "/business-dashboard/workers",
    icon: Users,
  },
  {
    title: "Projects",
    href: "/business-dashboard/projects",
    icon: Briefcase,
  },
  {
    title: "Post Jobs",
    href: "/business-dashboard/jobs",
    icon: Briefcase,
    isHighlighted: true
  }
];

// Worker-only links
const workerLinks: SidebarLinkItem[] = [
  {
    title: "Worker Portal",
    href: "/worker-dashboard",
    icon: User,
  },
  {
    title: "Available Jobs",
    href: "/jobs",
    icon: Briefcase,
    isHighlighted: true
  }
];

export function Sidebar() {
  const [expanded, setExpanded] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const checkMobile = () => {
      const isMobileView = window.innerWidth < 768;
      setIsMobile(isMobileView);
      if (!isMobileView) {
        setMobileMenuOpen(false);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const isWorkerRegistrationOrLoginOrHome = location.pathname === "/worker-registration" || location.pathname === "/login" || location.pathname === "/";

  const getRelevantLinks = () => {
    let links = [...sidebarLinks];

    // Remove 'Available Jobs' if on worker registration, login, or home page
    if (isWorkerRegistrationOrLoginOrHome) {
      links = links.filter(link => link.title !== "Available Jobs");
    }

    if (!currentUser) {
      links.push(
        {
          title: "Worker Registration",
          href: "/worker-registration",
          icon: UserPlus,
          public: true
        }
      );
      return links;
    }
    
    switch (currentUser.userType) {
      case "admin":
        return [...links, ...adminLinks];
      case "business":
        return [...links, ...businessLinks];
      case "worker":
        return [...links, ...workerLinks];
      default:
        return links;
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isLoginPath = location.pathname === "/login" || 
                     location.pathname === "/admin-login" || 
                     location.pathname === "/business-login" ||
                     location.pathname === "/worker-login";

  const isLinkActive = (href: string) => {
    if (href === "/") {
      return location.pathname === "/";
    }
    if (href === "/worker-registration") {
      return location.pathname === "/worker-registration";
    }
    return location.pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile Menu Button - Fixed Position */}
      <button
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className={cn(
          "fixed top-4 left-4 z-50 md:hidden",
          "p-2 rounded-md transition-colors",
          "bg-background/90 hover:bg-accent",
          "focus:outline-none focus:ring-2 focus:ring-accent",
          "shadow-md"
        )}
      >
        {mobileMenuOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <Menu className="h-6 w-6" />
        )}
      </button>

      {/* Mobile Menu Overlay */}
      {/* Overlay removed for visibility troubleshooting */}
      {/* {isMobile && mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
          onClick={() => setMobileMenuOpen(false)}
        />
      )} */}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-45",
          "flex h-full flex-col",
          "bg-black text-white border-r",
          "transition-transform duration-300 ease-in-out",
          "w-64",
          isMobile && !mobileMenuOpen && "-translate-x-full",
          isMobile && mobileMenuOpen && "translate-x-0"
        )}
      >
        <div className="flex items-center justify-between p-4">
          <Link
            to="/"
            className="flex items-center gap-2 font-semibold text-xl text-white"
            onClick={() => setMobileMenuOpen(false)}
          >
            <img src="/migii-icon.svg" alt="Migii Logo" className="h-8 w-8" />
            <span>MIGII</span>
          </Link>
        </div>

        <nav className="flex-1 space-y-1 px-2 py-2 overflow-y-auto">
          {getRelevantLinks().map((link) => {
            const active = isLinkActive(link.href);
            return (
              <Link
                key={link.href}
                to={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-bold drop-shadow !text-white !opacity-100",
                  "hover:bg-gray-800",
                  active && "bg-primary !text-white font-bold !opacity-100"
                )}
                style={{ color: '#fff', opacity: 1 }}
              >
                <link.icon size={20} className="shrink-0 !text-white !opacity-100 drop-shadow" style={{ color: '#fff', opacity: 1 }} />
                <span className="!opacity-100 !text-white drop-shadow" style={{ color: '#fff', opacity: 1 }}>{link.title}</span>
                {link.isHighlighted && !active && (
                  <span className="ml-auto text-xs font-medium bg-primary/20 text-primary px-1.5 py-0.5 rounded">New</span>
                )}
              </Link>
            );
          })}

          {/* Settings Link */}
          <Link
            to="/settings"
            onClick={() => setMobileMenuOpen(false)}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm mt-2 font-bold drop-shadow !text-white !opacity-100",
              "hover:bg-gray-800",
              isLinkActive("/settings") && "bg-primary !text-white font-bold !opacity-100"
            )}
            style={{ color: '#fff', opacity: 1 }}
          >
            <SettingsIcon size={20} className="shrink-0 !text-white !opacity-100 drop-shadow" style={{ color: '#fff', opacity: 1 }} />
            <span className="!opacity-100 !text-white drop-shadow" style={{ color: '#fff', opacity: 1 }}>Settings</span>
          </Link>

          {currentUser ? (
            <div className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm mt-4",
              "text-white"
            )}>
              <div className="flex w-full justify-between items-center">
                <div className="flex items-center gap-2">
                  <User size={20} className="shrink-0" />
                  <span className="font-medium opacity-100">{currentUser.name || currentUser.email || "User"}</span>
                </div>
                <button
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="p-1.5 rounded-md hover:bg-accent/50 hover:text-accent-foreground transition-colors"
                >
                  <LogOut size={18} />
                </button>
              </div>
            </div>
          ) : (
            <Link
              to="/login"
              onClick={() => setMobileMenuOpen(false)}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm mt-4",
                "text-white",
                "hover:bg-gray-800",
                isLoginPath && "bg-primary text-white font-medium"
              )}
            >
              <LogIn size={20} className="shrink-0" />
              <span className="opacity-100">Migii Login</span>
            </Link>
          )}
        </nav>

        <div className="p-4 border-t border-border/50">
          <div className="flex flex-col gap-1">
            <p className="text-xs font-bold drop-shadow !text-white !opacity-100" style={{ color: '#fff', opacity: 1 }}>
              Worker Management System
            </p>
            <p className="text-xs font-bold drop-shadow !text-white !opacity-100" style={{ color: '#fff', opacity: 1 }}>
              migii v1.0.0
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}
