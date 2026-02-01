import { Link, useLocation, useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';

const Layout = ({ children }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const user = authService.getCurrentUser();

    const handleLogout = () => {
        authService.logout();
        navigate('/login');
    };

    const navItems = [
        { path: '/', label: 'ড্যাশবোর্ড', icon: '🏠' },
        { path: '/products', label: 'পণ্য', icon: '📦' },
        { path: '/purchases', label: 'ক্রয়', icon: '🛒' },
        { path: '/sales', label: 'বিক্রয়', icon: '💰' },
        { path: '/profit', label: 'লাভ', icon: '📊' },
        { path: '/profile', label: 'প্রোফাইল', icon: '👤' }
    ];

    return (
        <div className="min-h-screen bg-[#f1f5f9] font-main text-slate-900">
            {/* Top Header - Desktop & Mobile */}
            <header className="glass sticky top-0 z-50 border-b border-slate-200/50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-20">
                        <div className="flex items-center gap-5">
                            <div className="w-12 h-12 bg-indigo-600 rounded-[1.25rem] flex items-center justify-center shadow-premium transform hover:rotate-6 transition-transform">
                                <span className="text-white text-2xl">📊</span>
                            </div>
                            <Link to="/" className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 font-main tracking-tight uppercase">
                                OM DEALERSHIP
                            </Link>
                        </div>

                        <div className="flex items-center gap-4">
                            <Link
                                to="/profile"
                                className="hidden sm:flex items-center gap-3 px-5 py-2.5 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-800 hover:shadow-premium transition-all active:scale-95"
                            >
                                <span className="text-indigo-500 text-lg">👤</span>
                                <span className="font-bangla">{user?.name}</span>
                            </Link>
                            <button
                                onClick={handleLogout}
                                className="px-5 py-3 bg-slate-900 text-white rounded-2xl text-sm font-black hover:bg-slate-800 active:scale-95 shadow-premium transition-all font-bangla"
                            >
                                লগআউট
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <div className="flex flex-col md:flex-row gap-10">
                    {/* Sidebar Navigation - Desktop */}
                    <aside className="hidden md:block w-72 shrink-0">
                        <nav className="sticky top-28 space-y-3">
                            {navItems.map((item) => {
                                const isActive = location.pathname === item.path;
                                return (
                                    <Link
                                        key={item.path}
                                        to={item.path}
                                        className={`flex items-center gap-4 px-6 py-4 rounded-[1.5rem] font-bold transition-all group border-2 ${isActive
                                            ? 'bg-white border-indigo-600 text-indigo-700 shadow-premium translate-x-1'
                                            : 'bg-transparent border-transparent text-slate-600 hover:bg-white hover:text-indigo-600 hover:border-slate-200 hover:shadow-md'
                                            }`}
                                    >
                                        <span className={`text-2xl transition-transform group-hover:scale-125 duration-300 ${isActive ? 'scale-110' : ''}`}>
                                            {item.icon}
                                        </span>
                                        <span className="font-bangla tracking-wide">{item.label}</span>
                                        {isActive && (
                                            <div className="ml-auto w-2 h-2 bg-indigo-600 rounded-full" />
                                        )}
                                    </Link>
                                );
                            })}
                        </nav>

                    </aside>

                    {/* Main Content */}
                    <main className="flex-1 pb-24 md:pb-8">
                        <div className="animate-fade-in">
                            {children}
                        </div>
                    </main>
                </div>
            </div>

            {/* Bottom Navigation - Mobile */}
            <nav className="fixed bottom-0 left-0 right-0 glass border-t border-slate-200/50 md:hidden z-50 px-6 pb-6">
                <div className="flex justify-between items-center h-20">
                    {navItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`flex flex-col items-center justify-center relative px-3 py-2 rounded-2xl transition-all ${isActive
                                    ? 'text-indigo-600'
                                    : 'text-slate-600'
                                    }`}
                            >
                                <span className={`text-2xl mb-1.5 transition-all ${isActive ? '-translate-y-2 scale-125' : ''}`}>
                                    {item.icon}
                                </span>
                                <span className="text-[10px] font-black uppercase tracking-widest font-bangla">{item.label}</span>
                                {isActive && (
                                    <span className="absolute -top-1 w-12 h-1.5 bg-indigo-600 rounded-full shadow-[0_0_10px_rgba(79,70,229,0.5)]" />
                                )}
                            </Link>
                        );
                    })}
                </div>
            </nav>
        </div>
    );
};

export default Layout;
