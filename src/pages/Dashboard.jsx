import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { reportService } from '../services/businessService';
import { authService } from '../services/authService';
import { formatCurrency } from '../utils/formatters';
import Loader from '../components/Loader';

const Dashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const user = authService.getCurrentUser();

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        try {
            const data = await reportService.getDashboardStats();
            setStats(data);
        } catch (error) {
            console.error('Error loading stats:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <Loader />;

    return (
        <div className="space-y-12 pb-10">
            {/* Elegant Welcome Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h2 className="text-4xl font-black text-slate-900 tracking-tight font-bangla mb-2">
                        স্বাগতম, <span className="text-indigo-600">নকি ভাই</span>!
                    </h2>
                    <p className="text-slate-600 font-bold text-lg">আপনার ব্যবসার আজকের সারসংক্ষেপ এক নজরে।</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="px-5 py-3 bg-white rounded-2xl border border-slate-200 shadow-sm flex items-center gap-2">
                        <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                        <span className="text-sm font-black text-slate-700 uppercase tracking-widest">Live Updates</span>
                    </div>
                </div>
            </div>



            {/* Performance Grids */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Monthly Tracking */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center gap-3">
                        <div className="w-1.5 h-8 bg-purple-600 rounded-full"></div>
                        <h3 className="text-2xl font-black text-slate-900 font-bangla">মাসিক ট্র্যাকিং</h3>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="premium-card p-8 bg-white border-slate-200 shadow-premium">
                            <div className="flex justify-between items-start mb-6">
                                <p className="text-slate-500 text-xs font-black uppercase tracking-widest">এই মাসের বিক্রয়</p>
                                <span className="text-emerald-600 font-black text-sm">+১২%</span>
                            </div>
                            <h5 className="text-3xl font-black text-slate-900 mb-6 font-main">৳ {formatCurrency(stats?.thisMonth?.sales || 0)}</h5>
                            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                                <div className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full w-[70%] rounded-full"></div>
                            </div>
                        </div>

                        <div className="premium-card p-8 bg-white border-slate-200 shadow-premium">
                            <div className="flex justify-between items-start mb-6">
                                <p className="text-slate-500 text-xs font-black uppercase tracking-widest">এই মাসের ক্রয়</p>
                                <span className="text-slate-500 font-black text-sm">স্থির</span>
                            </div>
                            <h5 className="text-3xl font-black text-slate-900 mb-6 font-main">৳ {formatCurrency(stats?.thisMonth?.purchases || 0)}</h5>
                            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                                <div className="bg-slate-300 h-full w-[45%] rounded-full"></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Shortcuts */}
                <div className="space-y-6">
                    <div className="flex items-center gap-3">
                        <div className="w-1.5 h-8 bg-orange-600 rounded-full"></div>
                        <h3 className="text-2xl font-black text-slate-900 font-bangla">দ্রুত লিঙ্ক</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        {[
                            { to: "/products", label: "পণ্য", icon: "📦", color: "from-orange-500 to-orange-600" },
                            { to: "/purchases", label: "ক্রয়", icon: "🛒", color: "from-blue-500 to-blue-600" },
                            { to: "/sales", label: "বিক্রয়", icon: "💰", color: "from-emerald-500 to-emerald-600" },
                            { to: "/profit", label: "রিপোর্ট", icon: "📈", color: "from-purple-500 to-purple-600" },
                        ].map((action, i) => (
                            <Link
                                key={i}
                                to={action.to}
                                className="premium-card p-6 flex flex-col items-center justify-center gap-3 hover:translate-y-[-5px] active:scale-95 transition-all text-center group bg-white border-slate-200 shadow-md hover:shadow-premium"
                            >
                                <div className={`w-14 h-14 bg-gradient-to-br ${action.color} text-white rounded-[1rem] flex items-center justify-center text-2xl shadow-lg group-hover:rotate-12 transition-transform duration-300`}>
                                    {action.icon}
                                </div>
                                <span className="font-black text-slate-900 font-bangla text-sm">{action.label}</span>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
