import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Home, 
  Users, 
  Briefcase, 
  Calendar, 
  LogOut, 
  Bell, 
  Search,
  Moon,
  Sun,
  ChevronRight,
  Settings,
  Users2,
  CheckCircle2,
  Megaphone,
  Blocks
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTheme } from "./theme-provider";
import { usePropertyStore } from '@/modules/properties/store';
import { useLeadStore } from '@/modules/leads/store';
import { useDealStore } from '@/modules/deals/store';
import { useNotificationStore } from '@/modules/notifications/store';
import { useUserStore } from '@/store/userStore';
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { formatDistanceToNow } from 'date-fns';
import { Toaster } from 'sonner';

const Layout: React.FC = () => {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const [searchTerm, setSearchTerm] = React.useState("");
  const [showResults, setShowResults] = React.useState(false);

  const { user, fetchUser, clearUser } = useUserStore();
  const { data: properties, fetchAll: fetchProperties } = usePropertyStore();
  const { data: leads, fetchAll: fetchLeads } = useLeadStore();
  const { data: deals, fetchAll: fetchDeals } = useDealStore();
  const { notifications, unreadCount, fetchAll: fetchNotifications, markAsRead, markAllAsRead } = useNotificationStore();

  React.useEffect(() => {
    fetchUser();
    fetchNotifications();
    fetchProperties();
    fetchLeads();
    fetchDeals();
  }, [fetchUser, fetchNotifications, fetchProperties, fetchLeads, fetchDeals]);

  const searchResults = React.useMemo(() => {
    if (!searchTerm.trim()) return { properties: [], leads: [], deals: [] };
    const term = searchTerm.toLowerCase();
    return {
      properties: properties.filter(p => p.title.toLowerCase().includes(term) || p.city.toLowerCase().includes(term)).slice(0, 3),
      leads: leads.filter(l => l.name.toLowerCase().includes(term) || l.email?.toLowerCase().includes(term)).slice(0, 3),
      deals: deals.filter(d => d.title.toLowerCase().includes(term)).slice(0, 3),
    };
  }, [searchTerm, properties, leads, deals]);

  const hasResults = searchResults.properties.length > 0 || searchResults.leads.length > 0 || searchResults.deals.length > 0;

  const handleLogout = () => {
    localStorage.removeItem('token');
    clearUser();
    navigate('/login');
  };

  const navItems = [
    { to: "/", icon: LayoutDashboard, label: "Dashboard" },
    { to: "/properties", icon: Home, label: "Properties" },
    { to: "/leads", icon: Users, label: "Leads" },
    { to: "/pipeline", icon: Briefcase, label: "Pipeline" },
    { to: "/visits", icon: Calendar, label: "Site Visits" },
    { to: "/tasks", icon: CheckCircle2, label: "Tasks" },
    { to: "/marketing", icon: Megaphone, label: "Marketing" },
    ...(user?.role === 'BROKER' ? [
      { to: "/integrations", icon: Blocks, label: "Integrations" },
      { to: "/team", icon: Users2, label: "Team" }
    ] : []),
  ];

  return (
    <div className="flex min-h-screen bg-background text-foreground transition-colors duration-300">
      {/* Sidebar — reduced from w-72 to w-56 */}
      <aside className="w-56 bg-card border-r border-border fixed h-full z-20 flex flex-col shadow-xl">
        {/* Logo — reduced padding and icon/text size */}
        <div className="px-4 py-4 flex items-center gap-2">
          <div className="bg-primary p-1.5 rounded-xl shadow-lg shadow-primary/20 rotate-3">
            <Home className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="text-xl font-display italic tracking-tighter text-foreground">
            Estate<span className="text-primary">Sync</span>
          </span>
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto">
          <div className="text-[10px] uppercase tracking-widest font-black text-muted-foreground px-3 mb-3 opacity-40 font-display">Main Menu</div>
          {navItems.map((item) => (
            <NavLink 
              key={item.to}
              to={item.to} 
              end={item.to === "/"}
              className={({ isActive }) => `
                group flex items-center justify-between px-3 py-2 rounded-xl transition-all duration-300 text-sm font-semibold
                ${isActive 
                  ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-[1.02]' 
                  : 'text-muted-foreground hover:bg-secondary hover:text-foreground'}
              `}
            >
              {({ isActive }) => (
                <>
                  <div className="flex items-center gap-2.5">
                    <item.icon className={`w-4 h-4 transition-transform duration-300 group-hover:scale-110`} />
                    <span>{item.label}</span>
                  </div>
                  <ChevronRight className={`w-3 h-3 opacity-0 transition-all duration-300 group-hover:opacity-100 ${isActive ? 'hidden' : ''}`} />
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Bottom Section — compact */}
        <div className="p-3 mt-auto space-y-2 border-t border-border/50 bg-secondary/30">
          {/* Dark Mode Toggle — compact */}
          <div className="flex items-center justify-between bg-card p-1 rounded-xl border border-border/50 shadow-sm">
             <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setTheme("light")}
                className={`flex-1 rounded-lg h-7 text-xs px-2 ${theme === "light" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground"}`}
              >
                <Sun className="w-3 h-3 mr-1" /> Light
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setTheme("dark")}
                className={`flex-1 rounded-lg h-7 text-xs px-2 ${theme === "dark" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground"}`}
              >
                <Moon className="w-3 h-3 mr-1" /> Dark
              </Button>
          </div>

          {/* Profile Section — compact */}
          <NavLink to="/profile" className="block px-2 py-2 bg-card rounded-xl border border-border shadow-sm hover:shadow-md transition-all duration-300 hover:scale-[1.01] active:scale-[0.99]">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-primary to-blue-400 flex items-center justify-center text-primary-foreground text-xs font-black shadow-md border border-white/20 dark:border-slate-700 flex-shrink-0 overflow-hidden">
                {user?.avatarUrl ? (
                  <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  user?.name?.split(' ').map((n: string) => n[0]).join('') || 'U'
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-black truncate leading-none mb-0.5 text-foreground">{user?.name || 'Loading...'}</p>
                <p className="text-[9px] uppercase tracking-tighter font-black text-primary truncate opacity-80">
                  {user?.role === 'BROKER' ? 'Broker Admin' : 'Property Agent'}
                </p>
              </div>
              <div className="h-6 w-6 rounded-full text-muted-foreground flex items-center justify-center hover:bg-secondary flex-shrink-0">
                <Settings className="w-3 h-3" />
              </div>
            </div>
          </NavLink>

          {/* Logout — compact */}
          <Button 
            variant="ghost" 
            onClick={handleLogout} 
            className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 gap-2 px-3 h-8 rounded-xl text-xs font-bold transition-all duration-200"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-56 min-h-screen flex flex-col">
        <header className="h-16 bg-background/60 backdrop-blur-2xl border-b border-border/50 flex items-center justify-between px-8 sticky top-0 z-10">
          <div className="relative w-80 group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <Input 
              placeholder="Search leads, properties, deals..." 
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setShowResults(true);
              }}
              onFocus={() => setShowResults(true)}
              className="pl-10 h-9 border-border/50 bg-secondary/50 focus-visible:bg-card focus-visible:ring-2 focus-visible:ring-primary/20 rounded-xl transition-all duration-300 shadow-sm text-sm" 
            />

            {showResults && searchTerm && (
              <div className="absolute top-full left-0 w-full mt-2 bg-card border border-border shadow-2xl rounded-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
                <div className="max-h-96 overflow-y-auto p-2">
                  {!hasResults && <div className="p-4 text-sm text-muted-foreground text-center font-bold">No matches found</div>}
                  
                  {searchResults.properties.length > 0 && (
                    <div className="mb-2">
                      <div className="px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-50">Properties</div>
                      {searchResults.properties.map(p => (
                        <button key={p.id} onClick={() => { navigate(`/properties/${p.id}`); setShowResults(false); setSearchTerm(""); }} className="w-full flex items-center gap-3 p-2 hover:bg-secondary rounded-xl transition-colors text-left group">
                          <div className="h-8 w-8 rounded-lg bg-orange-500/10 text-orange-500 flex items-center justify-center"><Home className="h-4 w-4" /></div>
                          <div>
                            <div className="text-xs font-bold">{p.title}</div>
                            <div className="text-[10px] text-muted-foreground">{p.city}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  {searchResults.leads.length > 0 && (
                    <div className="mb-2">
                      <div className="px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-50">Leads</div>
                      {searchResults.leads.map(l => (
                        <button key={l.id} onClick={() => { navigate(`/leads`); setShowResults(false); setSearchTerm(""); }} className="w-full flex items-center gap-3 p-2 hover:bg-secondary rounded-xl transition-colors text-left">
                          <div className="h-8 w-8 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center"><Users className="h-4 w-4" /></div>
                          <div>
                            <div className="text-xs font-bold">{l.name}</div>
                            <div className="text-[10px] text-muted-foreground">{l.email}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  {searchResults.deals.length > 0 && (
                    <div>
                      <div className="px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-50">Deals</div>
                      {searchResults.deals.map(d => (
                        <button key={d.id} onClick={() => { navigate(`/pipeline`); setShowResults(false); setSearchTerm(""); }} className="w-full flex items-center gap-3 p-2 hover:bg-secondary rounded-xl transition-colors text-left">
                          <div className="h-8 w-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center"><Briefcase className="h-4 w-4" /></div>
                          <div>
                            <div className="text-xs font-bold">{d.title}</div>
                            <div className="text-[10px] text-muted-foreground">₹{parseFloat(d.value).toLocaleString()}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
            {showResults && (
              <div className="fixed inset-0 z-40" onClick={() => setShowResults(false)}></div>
            )}
          </div>
          
          <div className="flex items-center gap-3">

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="icon" className="relative rounded-xl h-9 w-9 border-border/50 bg-card hover:bg-secondary transition-all duration-300">
                  <Bell className="w-4 h-4 text-foreground/70" />
                  {unreadCount > 0 && (
                    <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-red-500 rounded-full border border-card ring-1 ring-red-500/20 animate-pulse"></span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-0 border-border bg-card shadow-2xl rounded-2xl overflow-hidden z-[100]" align="end">
                <div className="p-4 border-b border-border flex items-center justify-between bg-secondary/30">
                  <h3 className="text-sm font-black uppercase tracking-widest">Notifications</h3>
                  {unreadCount > 0 && (
                    <button 
                      onClick={() => markAllAsRead()}
                      className="text-[10px] font-bold text-primary hover:underline"
                    >
                      Mark all as read
                    </button>
                  )}
                </div>
                <div className="max-h-[400px] overflow-y-auto">
                  {notifications.length > 0 ? (
                    notifications.map((n) => (
                      <div 
                        key={n.id} 
                        onClick={() => !n.isRead && markAsRead(n.id)}
                        className={`p-4 border-b border-border/50 hover:bg-secondary/50 transition-colors cursor-pointer relative ${!n.isRead ? 'bg-primary/5' : ''}`}
                      >
                        {!n.isRead && <div className="absolute left-1 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-full"></div>}
                        <p className="text-xs font-black mb-1 text-foreground">{n.title}</p>
                        <p className="text-[11px] text-muted-foreground font-medium mb-2">{n.message}</p>
                        <p className="text-[9px] font-black uppercase tracking-tighter opacity-50">
                          {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="p-8 text-center">
                      <Bell className="w-8 h-8 text-muted-foreground/20 mx-auto mb-3" />
                      <p className="text-xs font-bold text-muted-foreground">All caught up!</p>
                    </div>
                  )}
                </div>
                {notifications.length > 0 && (
                  <div className="p-3 bg-secondary/30 border-t border-border text-center">
                    <button className="text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors">
                      View all notifications
                    </button>
                  </div>
                )}
              </PopoverContent>
            </Popover>
          </div>
        </header>
        
        <div className="flex-1 p-6">
          <Outlet />
        </div>
      </main>

      <Toaster richColors position="top-center" />

      <style>{`
        .active {
          transform: scale(1.02);
        }
      `}</style>
    </div>
  );
};

export default Layout;
