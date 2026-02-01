import { useState, useEffect } from 'react';
import { reportService } from '../services/businessService';
import { formatCurrency, formatDateInput } from '../utils/formatters';
import Loader from '../components/Loader';
import Alert from '../components/Alert';

const ProfitReport = () => {
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [dateRange, setDateRange] = useState({
        startDate: '',
        endDate: ''
    });

    useEffect(() => {
        loadReport();
    }, []);

    const loadReport = async (start = '', end = '') => {
        setLoading(true);
        setError('');

        try {
            const data = await reportService.getProfitReport(start, end);
            setReport(data);
        } catch (error) {
            setError('রিপোর্ট লোড করতে ব্যর্থ হয়েছে');
        } finally {
            setLoading(false);
        }
    };

    const handleFilter = (e) => {
        e.preventDefault();
        loadReport(dateRange.startDate, dateRange.endDate);
    };

    const handleReset = () => {
        setDateRange({ startDate: '', endDate: '' });
        loadReport();
    };

    const getThisWeek = () => {
        const now = new Date();
        const startOfWeek = new Date(now);
        const day = now.getDay();
        startOfWeek.setDate(now.getDate() - day);
        startOfWeek.setHours(0, 0, 0, 0);
        const endOfWeek = new Date(now);

        setDateRange({ startDate: formatDateInput(startOfWeek), endDate: formatDateInput(endOfWeek) });
        loadReport(formatDateInput(startOfWeek), formatDateInput(endOfWeek));
    };

    const getThisMonth = () => {
        const now = new Date();
        const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
        const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);

        setDateRange({ startDate: formatDateInput(firstDay), endDate: formatDateInput(lastDay) });
        loadReport(formatDateInput(firstDay), formatDateInput(lastDay));
    };

    if (loading && !report) return <Loader />;

    return (
        <div className="max-w-4xl mx-auto font-bangla animate-fade-in pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                <div>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight">ব্যবসায়িক রিপোর্ট</h2>
                    <p className="text-slate-500 font-bold">লাভ ও ক্ষতির সঠিক হিসাব দেখুন।</p>
                </div>
                <div className="flex bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm">
                    <button onClick={handleReset} className={`px-4 py-2 rounded-xl text-sm font-black transition-all ${!dateRange.startDate ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-50'}`}>সব সময়</button>
                    <button onClick={getThisWeek} className={`px-4 py-2 rounded-xl text-sm font-black transition-all ${dateRange.startDate && !dateRange.endDate.includes('-31') ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-50'}`}>এই সপ্তাহ</button>
                    <button onClick={getThisMonth} className={`px-4 py-2 rounded-xl text-sm font-black transition-all ${dateRange.startDate && dateRange.endDate.includes('-') ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-50'}`}>এই মাস</button>
                </div>
            </div>

            {error && <Alert type="error" message={error} onClose={() => setError('')} />}

            {/* Custom Date Filter - More Compact */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 mb-10 shadow-sm">
                <form onSubmit={handleFilter} className="flex flex-col sm:flex-row items-end gap-4">
                    <div className="flex-1 w-full flex gap-4">
                        <div className="flex-1 space-y-1">
                            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-1">শুরু</label>
                            <input type="date" value={dateRange.startDate} onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })} className="w-full py-3 px-4 text-sm font-bold border-slate-200 rounded-xl focus:ring-4 focus:ring-slate-100 outline-none" />
                        </div>
                        <div className="flex-1 space-y-1">
                            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-1">শেষ</label>
                            <input type="date" value={dateRange.endDate} onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })} className="w-full py-3 px-4 text-sm font-bold border-slate-200 rounded-xl focus:ring-4 focus:ring-slate-100 outline-none" />
                        </div>
                    </div>
                    <button type="submit" disabled={loading} className="w-full sm:w-auto px-8 py-3.5 bg-slate-900 text-white rounded-xl font-black text-sm hover:shadow-lg active:scale-95 transition-all">
                        ফিল্টার করুন
                    </button>
                </form>
            </div>

            {report && (
                <div className="space-y-8 animate-fade-in">
                    {/* Main Profit Card */}
                    <div className={`p-10 rounded-[2.5rem] text-white shadow-2xl ${report.totalProfit >= 0 ? 'bg-indigo-600 shadow-indigo-200' : 'bg-red-600 shadow-red-200'} relative overflow-hidden`}>
                        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                            <div className="space-y-2">
                                <p className="text-white/70 font-black uppercase tracking-[0.2em] text-sm">
                                    {report.totalProfit >= 0 ? 'নিট লাভ (NET PROFIT)' : 'নিট ক্ষতি (NET LOSS)'}
                                </p>
                                <h3 className="text-6xl font-black tracking-tighter">৳ {formatCurrency(Math.abs(report.totalProfit))}</h3>
                            </div>
                            <div className="bg-white/20 backdrop-blur-md p-6 rounded-3xl border border-white/10 text-center min-w-[160px]">
                                <p className="text-white/70 text-xs font-black uppercase mb-1">প্রফিট মার্জিন</p>
                                <p className="text-3xl font-black">{report.totalSale > 0 ? ((report.totalProfit / report.totalSale) * 100).toFixed(1) : 0}%</p>
                            </div>
                        </div>
                        <div className="absolute -right-10 -bottom-10 text-[15rem] leading-none opacity-10 pointer-events-none select-none font-black italic">
                            {report.totalProfit >= 0 ? '📈' : '📉'}
                        </div>
                    </div>

                    {/* Simplified Data Breakdown */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm flex flex-col justify-center">
                            <p className="text-slate-400 text-xs font-black uppercase tracking-widest mb-1">মোট বিক্রয়</p>
                            <p className="text-3xl font-black text-slate-900">৳ {formatCurrency(report.totalSale)}</p>
                            <p className="text-[10px] text-emerald-600 font-black mt-2 bg-emerald-50 px-2 py-0.5 rounded-full inline-block w-fit">অর্জিত রাজস্ব</p>
                        </div>
                        <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm flex flex-col justify-center">
                            <p className="text-slate-400 text-xs font-black uppercase tracking-widest mb-1">ক্রয়মূল্য (COGS)</p>
                            <p className="text-3xl font-black text-slate-900">৳ {formatCurrency(report.totalCostOfGoodsSold)}</p>
                            <p className="text-[10px] text-red-500 font-black mt-2 bg-red-50 px-2 py-0.5 rounded-full inline-block w-fit">বিক্রীত পণ্যের কেনা দাম</p>
                        </div>
                        <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm flex flex-col justify-center">
                            <p className="text-slate-400 text-xs font-black uppercase tracking-widest mb-1">অন্যান্য খরচ</p>
                            <p className="text-3xl font-black text-slate-900">৳ {formatCurrency(report.totalOtherExpenses)}</p>
                            <p className="text-[10px] text-amber-600 font-black mt-2 bg-amber-50 px-2 py-0.5 rounded-full inline-block w-fit">পরিবহন ও বিবিধ</p>
                        </div>
                    </div>

                    {/* Compact Info Section */}
                    <div className="flex flex-col sm:flex-row gap-4 items-center justify-between px-8 py-5 bg-slate-50 rounded-2xl border border-slate-100">
                        <div className="flex items-center gap-6">
                            <div className="text-center">
                                <p className="text-[10px] font-black text-slate-400 uppercase">মোট মেমো</p>
                                <p className="font-black text-slate-800">{report.saleCount} টি</p>
                            </div>
                            <div className="w-px h-8 bg-slate-200"></div>
                            <div className="text-center">
                                <p className="text-[10px] font-black text-slate-400 uppercase">গড় বিক্রয়</p>
                                <p className="font-black text-slate-800">৳ {report.saleCount > 0 ? formatCurrency(report.totalSale / report.saleCount) : 0}</p>
                            </div>
                        </div>
                        <p className="text-xs text-slate-400 font-medium italic">
                            রিপোর্ট জেনারেট হয়েছে: {new Date().toLocaleString('bn-BD')}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProfitReport;
