import { useState, useEffect } from 'react';
import { authService } from '../services/authService';
import Alert from '../components/Alert';
import Loader from '../components/Loader';

const Profile = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        name: '',
        password: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [updating, setUpdating] = useState(false);

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        try {
            const data = await authService.getProfile();
            setUser(data);
            setFormData({
                name: data.name,
                password: '',
                confirmPassword: ''
            });
        } catch (err) {
            setError('প্রোফাইল লোড করতে ব্যর্থ হয়েছে');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (formData.password) {
            if (formData.password.length < 6) {
                setError('পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে');
                return;
            }
            if (formData.password !== formData.confirmPassword) {
                setError('পাসওয়ার্ড মিলছে না');
                return;
            }
        }

        setUpdating(true);
        try {
            const updateData = { name: formData.name };
            if (formData.password) {
                updateData.password = formData.password;
            }

            await authService.updateProfile(updateData);
            setSuccess('প্রোফাইল সফলভাবে আপডেট হয়েছে');
            setFormData({ ...formData, password: '', confirmPassword: '' });
            loadProfile();
        } catch (err) {
            setError(err.response?.data?.message || 'আপডেট করতে ব্যর্থ হয়েছে');
        } finally {
            setUpdating(false);
        }
    };

    if (loading) return <Loader />;

    return (
        <div className="max-w-2xl mx-auto font-bangla animate-fade-in pb-10">
            <div className="flex flex-col items-center text-center mb-12">
                <div className="w-24 h-24 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-[2rem] flex items-center justify-center text-5xl text-white shadow-premium mb-6 transform hover:rotate-6 transition-transform duration-500">
                    {user?.name?.charAt(0)}
                </div>
                <h2 className="text-4xl font-black text-slate-900 tracking-tight mb-2">প্রোফাইল সেটিংস</h2>
                <p className="text-slate-600 font-bold text-lg">আপনার এ্যাকাউন্টের তথ্য আপডেট করুন</p>
            </div>

            {error && <Alert type="error" message={error} onClose={() => setError('')} />}
            {success && <Alert type="success" message={success} onClose={() => setSuccess('')} />}

            <div className="premium-card p-10 md:p-14 border-slate-200 shadow-premium">
                <form onSubmit={handleSubmit} className="space-y-10">
                    {/* Name Section */}
                    <div className="space-y-4">
                        <label className="block text-sm font-black text-slate-900 px-2 uppercase tracking-widest font-main">
                            Full Name
                        </label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            className="w-full bg-white border-2 border-slate-200 rounded-[1.5rem] focus:ring-8 focus:ring-indigo-50 focus:border-indigo-600 focus:bg-white transition-all py-5 px-8 text-xl font-bold text-slate-900"
                            placeholder="আপনার নাম লিখুন"
                        />
                    </div>

                    <div className="space-y-4">
                        <label className="block text-sm font-black text-slate-500 px-2 uppercase tracking-widest font-main">
                            Email Address
                        </label>
                        <div className="relative">
                            <span className="absolute left-6 top-1/2 -translate-y-1/2 text-2xl">📧</span>
                            <input
                                type="email"
                                value={user?.email}
                                disabled
                                className="w-full pl-16 pr-8 py-5 bg-slate-50 border-2 border-slate-100 text-slate-600 cursor-not-allowed font-main font-bold rounded-[1.5rem]"
                            />
                        </div>
                    </div>

                    <div className="h-px bg-slate-200 w-full"></div>

                    {/* Password Section */}
                    <div className="space-y-8 bg-slate-50 p-8 rounded-[2rem] border border-slate-200">
                        <h3 className="text-xl font-black text-slate-900 flex items-center gap-3">
                            <span className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center text-2xl">🔐</span>
                            পাসওয়ার্ড পরিবর্তন
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-3">
                                <label className="block text-xs font-black text-slate-700 px-2 uppercase tracking-widest font-main">New Password</label>
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="w-full bg-white border-2 border-slate-200 rounded-2xl focus:border-indigo-600 outline-none transition-all py-4 px-6 font-bold text-slate-900"
                                    placeholder="••••••••"
                                />
                            </div>
                            <div className="space-y-3">
                                <label className="block text-xs font-black text-slate-700 px-2 uppercase tracking-widest font-main">Confirm New</label>
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    className="w-full bg-white border-2 border-slate-200 rounded-2xl focus:border-indigo-600 outline-none transition-all py-4 px-6 font-bold text-slate-900"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>
                        <p className="text-xs text-slate-500 font-bold italic px-2">※ পরিবর্তন করতে না চাইলে ঘরগুলো খালি রাখুন।</p>
                    </div>

                    {/* Action Button */}
                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={updating}
                            className="w-full bg-slate-900 text-white py-5 rounded-[2rem] font-black text-xl hover:bg-slate-800 active:scale-[0.98] transition-all shadow-2xl shadow-indigo-100 flex items-center justify-center gap-4 group"
                        >
                            {updating ? (
                                <>
                                    <span className="w-6 h-6 border-4 border-white/20 border-t-white rounded-full animate-spin"></span>
                                    <span>আপডেট হচ্ছে...</span>
                                </>
                            ) : (
                                <>
                                    সংরক্ষণ করুন <span className="text-2xl group-hover:translate-x-1 transition-transform">💾</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>

            <div className="mt-12 text-center">
                <div className="inline-flex items-center gap-3 px-6 py-2 bg-white rounded-full border border-slate-200 text-slate-600 text-xs font-black uppercase tracking-[0.2em] shadow-sm">
                    <span className="w-2 h-2 bg-indigo-500 rounded-full"></span>
                    Registration Date: {new Date(user?.createdAt).toLocaleDateString('bn-BD')}
                </div>
            </div>
        </div>
    );
};

export default Profile;
