import { useState } from 'react';
import { authService } from '../services/authService';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await authService.login(formData.email, formData.password);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || 'লগইন ব্যর্থ হয়েছে');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#f1f5f9] font-main relative overflow-hidden p-6">
            {/* Ultra Modern Background Decorations */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                <div className="absolute top-[-15%] right-[-5%] w-[60%] h-[60%] bg-indigo-200/40 rounded-full blur-[140px] animate-pulse"></div>
                <div className="absolute bottom-[-15%] left-[-5%] w-[60%] h-[60%] bg-purple-200/40 rounded-full blur-[140px] animate-pulse"></div>
            </div>

            <div className="w-full max-w-[480px] relative z-10">
                <div className="glass rounded-[3rem] shadow-premium p-10 md:p-14 border border-white/60 animate-fade-in backdrop-blur-3xl">
                    <div className="text-center mb-12">
                        <div className="w-20 h-20 bg-indigo-600 rounded-[2rem] flex items-center justify-center shadow-premium mx-auto mb-8 transform hover:scale-110 transition-transform duration-500">
                            <span className="text-white text-4xl">📊</span>
                        </div>
                        <h1 className="text-4xl font-black text-slate-900 mb-4 tracking-tight font-bangla">
                            আপনার <span className="text-indigo-600">ব্যবসা</span>
                        </h1>
                        <p className="text-slate-500 font-bold text-lg font-bangla">সহজ ব্যবস্থাপনা ও সঠিক হিসাব</p>
                    </div>

                    {error && (
                        <div className="mb-8 p-5 bg-red-50 text-red-700 rounded-3xl text-sm font-black border border-red-100 flex items-center gap-4 animate-shake">
                            <span className="text-2xl">⚠️</span>
                            <span className="font-bangla">{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-8">
                        <div className="space-y-3">
                            <label className="block text-sm font-black text-slate-800 px-2 uppercase tracking-widest font-main">
                                Email Address
                            </label>
                            <div className="relative group">
                                <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors text-xl">📧</span>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    className="w-full pl-14 pr-6 py-5 bg-white border border-slate-200 rounded-[1.75rem] focus:ring-8 focus:ring-indigo-100 focus:border-indigo-600 outline-none transition-all font-bold text-slate-700 shadow-sm"
                                    placeholder="admin@business.com"
                                />
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="block text-sm font-black text-slate-800 px-2 uppercase tracking-widest font-main">
                                Password
                            </label>
                            <div className="relative group">
                                <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors text-xl">🔒</span>
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                    className="w-full pl-14 pr-6 py-5 bg-white border border-slate-200 rounded-[1.75rem] focus:ring-8 focus:ring-indigo-100 focus:border-indigo-600 outline-none transition-all font-bold text-slate-700 shadow-sm"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-slate-900 text-white py-5 px-6 rounded-[1.75rem] font-black text-xl hover:bg-slate-800 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-2xl shadow-slate-300 flex items-center justify-center gap-4"
                        >
                            {loading ? (
                                <>
                                    <span className="w-6 h-6 border-4 border-white/20 border-t-white rounded-full animate-spin"></span>
                                    <span className="font-bangla">লগইন হচ্ছে...</span>
                                </>
                            ) : (
                                <span className="font-bangla flex items-center gap-3">
                                    লগইন করুন <span className="text-2xl">🚀</span>
                                </span>
                            )}
                        </button>
                    </form>

                    <div className="mt-12 pt-10 border-t border-slate-100/50 text-center">
                        <div className="inline-block px-6 py-2 bg-indigo-50 text-indigo-700 rounded-full text-xs font-black uppercase tracking-widest mb-4">
                            Test Credentials
                        </div>
                        <p className="text-sm text-slate-500 font-bold font-main selection:bg-indigo-100">
                            admin@business.com <span className="text-slate-300 mx-2">|</span> admin123
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
