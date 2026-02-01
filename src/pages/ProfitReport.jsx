import { useState, useEffect } from 'react';
import { reportService, productService } from '../services/businessService';
import { formatCurrency, formatDateInput } from '../utils/formatters';
import Loader from '../components/Loader';
import Alert from '../components/Alert';

const ProfitReport = () => {
    const [report, setReport] = useState(null);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [dateRange, setDateRange] = useState({
        startDate: '',
        endDate: '',
        productId: ''
    });
    const [activeTab, setActiveTab] = useState('all');

    useEffect(() => {
        loadInitialData();
    }, []);

    const loadInitialData = async () => {
        setLoading(true);
        try {
            const [reportData, productsData] = await Promise.all([
                reportService.getProfitReport(),
                productService.getAll()
            ]);
            setReport(reportData);
            setProducts(productsData);
        } catch (error) {
            setError('ডেটা লোড করতে ব্যর্থ হয়েছে');
        } finally {
            setLoading(false);
        }
    };

    const loadReport = async (start = '', end = '', product = '') => {
        setLoading(true);
        setError('');
        try {
            const data = await reportService.getProfitReport(start, end, product);
            setReport(data);
        } catch (error) {
            setError('রিপোর্ট লোড করতে ব্যর্থ হয়েছে');
        } finally {
            setLoading(false);
        }
    };

    const handleFilter = (e) => {
        if (e) e.preventDefault();
        loadReport(dateRange.startDate, dateRange.endDate, dateRange.productId);
    };

    const handleReset = () => {
        const resetRange = { startDate: '', endDate: '', productId: '' };
        setDateRange(resetRange);
        setActiveTab('all');
        loadReport('', '', ''); // This will trigger a full report
    };

    const getToday = () => {
        const now = new Date();
        const start = formatDateInput(now);
        const end = formatDateInput(now);
        setDateRange(prev => ({ ...prev, startDate: start, endDate: end }));
        setActiveTab('today');
        loadReport(start, end, dateRange.productId);
    };

    const getThisWeek = () => {
        const now = new Date();
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());
        startOfWeek.setHours(0, 0, 0, 0);
        const start = formatDateInput(startOfWeek);
        const end = formatDateInput(now);
        setDateRange(prev => ({ ...prev, startDate: start, endDate: end }));
        setActiveTab('week');
        loadReport(start, end, dateRange.productId);
    };

    const getThisMonth = () => {
        const now = new Date();
        const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
        const start = formatDateInput(firstDay);
        const end = formatDateInput(now);
        setDateRange(prev => ({ ...prev, startDate: start, endDate: end }));
        setActiveTab('thisMonth');
        loadReport(start, end, dateRange.productId);
    };

    const getLastMonth = () => {
        const now = new Date();
        const firstDayLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const lastDayLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
        const start = formatDateInput(firstDayLastMonth);
        const end = formatDateInput(lastDayLastMonth);
        setDateRange(prev => ({ ...prev, startDate: start, endDate: end }));
        setActiveTab('lastMonth');
        loadReport(start, end, dateRange.productId);
    };

    if (loading && !report) return <Loader />;

    return (
        <div className="max-w-5xl mx-auto font-bangla animate-fade-in pb-10 px-2 lg:px-0">
            {/* Header Area */}
            <div className="flex flex-col sm:flex-row items-baseline justify-between gap-2 mb-4">
                <h2 className="text-xl font-black text-slate-900 tracking-tight">📊 লাভ-ক্ষতি রিপোর্ট</h2>
                <div className="flex bg-white p-0.5 rounded-lg border border-slate-200 shadow-sm">
                    {[
                        { label: 'সব সময়', key: 'all', action: handleReset },
                        { label: 'আজ', key: 'today', action: getToday },
                        { label: 'সপ্তাহ', key: 'week', action: getThisWeek },
                        { label: 'এই মাস', key: 'thisMonth', action: getThisMonth },
                        { label: 'গত মাস', key: 'lastMonth', action: getLastMonth },
                    ].map((btn) => (
                        <button
                            key={btn.key}
                            onClick={btn.action}
                            className={`px-3 py-1 rounded-md text-[10px] font-black transition-all ${activeTab === btn.key
                                ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:bg-slate-50'
                                }`}
                        >
                            {btn.label}
                        </button>
                    ))}
                </div>
            </div>

            {error && <Alert type="error" message={error} onClose={() => setError('')} />}

            {/* micro filters - Simplified and Robust */}
            <div className="bg-white rounded-xl p-3 border border-slate-200 mb-6 shadow-sm">
                <form onSubmit={handleFilter} className="grid grid-cols-2 md:grid-cols-4 gap-2 items-end">
                    <div className="space-y-1">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">শুরু</label>
                        <input type="date" value={dateRange.startDate} onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })} className="w-full py-1.5 px-2 text-[11px] font-bold border-slate-200 rounded-lg outline-none bg-slate-50" />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">শেষ</label>
                        <input type="date" value={dateRange.endDate} onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })} className="w-full py-1.5 px-2 text-[11px] font-bold border-slate-200 rounded-lg outline-none bg-slate-50" />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">পণ্য বা আইটেম</label>
                        <select
                            value={dateRange.productId}
                            onChange={(e) => setDateRange({ ...dateRange, productId: e.target.value })}
                            className="w-full py-1.5 px-2 text-[11px] font-bold border-slate-200 rounded-lg outline-none bg-slate-50"
                        >
                            <option value="">সকল পণ্য দেখুন</option>
                            {products.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                        </select>
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        onClick={() => setActiveTab('custom')}
                        className="w-full py-2 bg-slate-900 text-white rounded-lg font-black text-[11px] hover:bg-slate-800 transition-all shadow-md"
                    >
                        {loading ? 'লোড হচ্ছে...' : 'রিপোর্ট দেখুন'}
                    </button>
                </form>
            </div>

            {report && (
                <div className="space-y-4 animate-fade-in">
                    {/* Main Stats Row */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div className={`col-span-2 p-5 rounded-xl text-white shadow-lg flex flex-col justify-center min-h-[110px] ${report.totalProfit >= 0 ? 'bg-indigo-600' : 'bg-red-600'} transition-all duration-500`}>
                            <p className="text-white/70 font-black uppercase text-[9px] mb-1 tracking-[0.15em]">
                                {report.isProductFiltered
                                    ? `আইটেম ফলাফল: ${products.find(p => p._id === dateRange.productId)?.name || 'পণ্য'}`
                                    : 'ব্যবসায়িক নিট লাভ (NET PROFIT)'}
                            </p>
                            <h3 className="text-4xl font-black tracking-tighter">৳ {formatCurrency(Math.abs(report.totalProfit))}</h3>
                            {report.totalSale > 0 && (
                                <div className="mt-1 flex items-center gap-2">
                                    <span className="text-[10px] font-bold bg-white/20 px-2 py-0.5 rounded-full">
                                        {((report.totalProfit / report.totalSale) * 100).toFixed(1)}% লাভ হার
                                    </span>
                                </div>
                            )}
                        </div>

                        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex flex-col justify-center">
                            <p className="text-slate-400 text-[9px] font-black uppercase mb-1">মোট বিক্রয়</p>
                            <p className="text-2xl font-black text-slate-900">৳ {formatCurrency(report.totalSale)}</p>
                            <p className="text-[9px] text-slate-500 font-bold">{report.saleCount} টি রশিদ</p>
                        </div>

                        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex flex-col justify-center">
                            <p className="text-slate-400 text-[9px] font-black uppercase mb-1">মোট কেনা দাম (COGS)</p>
                            <p className="text-2xl font-black text-slate-900">৳ {formatCurrency(report.totalCostOfGoodsSold)}</p>
                            <p className="text-[9px] text-red-400 font-bold">বিক্রীত পণ্যের খরচ</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* account summary */}
                        <div className="md:col-span-1 bg-white rounded-xl border border-slate-200 shadow-sm p-5">
                            <h3 className="text-xs font-black text-slate-800 mb-4 border-b pb-2">আর্থিক বিবরণী</h3>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center text-[10px] font-bold">
                                    <span className="text-slate-500">মোট আয় (বিক্রয়)</span>
                                    <span className="text-emerald-600">৳ {formatCurrency(report.totalSale)}</span>
                                </div>
                                <div className="flex justify-between items-center text-[10px] font-bold">
                                    <span className="text-slate-500">পণ্যের খরচ (কেনা দাম)</span>
                                    <span className="text-red-500">- ৳ {formatCurrency(report.totalCostOfGoodsSold)}</span>
                                </div>
                                {!report.isProductFiltered && (
                                    <div className="flex justify-between items-center text-[10px] font-bold">
                                        <span className="text-slate-500">অন্যান্য খরচ</span>
                                        <span className="text-slate-400">- ৳ {formatCurrency(report.totalOtherExpenses)}</span>
                                    </div>
                                )}
                                <div className="h-px bg-slate-100 my-2"></div>
                                <div className={`flex justify-between items-center text-sm font-black py-2 px-3 rounded-lg ${report.totalProfit >= 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                                    <span>চূড়ান্ত ফলাফল</span>
                                    <span>৳ {formatCurrency(Math.abs(report.totalProfit))}</span>
                                </div>
                            </div>
                        </div>

                        {/* High Density Table */}
                        <div className="md:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                            <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                                <div>
                                    <h3 className="text-sm font-black text-slate-800">📦 পণ্য-ভিক্তিক বিস্তারিত তথ্য</h3>
                                    <p className="text-[10px] text-slate-400 font-bold mt-0.5">সবগুলো পণ্যের আলাদা আলাদা লাভ-ক্ষতি ও স্টক।</p>
                                </div>
                                <span className="text-[9px] bg-white px-2 py-0.5 rounded border border-slate-200 text-indigo-600 font-black uppercase tracking-tight shadow-sm">
                                    Total: {report.productBreakdown?.length || 0} Items
                                </span>
                            </div>
                            <div className="max-h-[500px] overflow-y-auto">
                                <table className="w-full text-left text-[11px] border-collapse">
                                    <thead className="sticky top-0 bg-white border-b border-slate-200 z-10 shadow-sm">
                                        <tr className="text-[9px] text-slate-400 uppercase font-black tracking-widest bg-white">
                                            <th className="px-5 py-4">পণ্যের নাম ও স্টক</th>
                                            <th className="px-4 py-4 text-right">কেনা (Qty)</th>
                                            <th className="px-4 py-4 text-right">বিক্রী (Qty)</th>
                                            <th className="px-4 py-4 text-right">বিক্রয় মূল্য</th>
                                            <th className="px-5 py-4 text-right">লাভ/ক্ষতি</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {report.productBreakdown?.length > 0 ? (
                                            report.productBreakdown.map((item, idx) => (
                                                <tr key={idx} className="hover:bg-slate-50/80 transition-colors group">
                                                    <td className="px-5 py-4 font-bold text-slate-700 group-hover:text-indigo-600">
                                                        <div className="flex flex-col">
                                                            <span>{item.name}</span>
                                                            <span className={`text-[9px] font-black mt-1 px-1.5 py-0.5 rounded-sm w-fit ${item.currentStock > 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                                                                স্টক: {item.currentStock} {item.unit || ''}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-4 text-right">
                                                        <div className="flex flex-col">
                                                            <span className="text-slate-500 font-bold">{item.purchaseQty} {item.unit || ''}</span>
                                                            <span className="text-[9px] text-slate-400 font-bold italic">Avg: ৳{formatCurrency(item.avgPurchase || 0)}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-4 text-right">
                                                        <div className="flex flex-col">
                                                            <span className="text-indigo-600 font-black">{item.quantity} {item.unit || ''}</span>
                                                            <span className="text-[9px] text-indigo-300 font-bold px-1.5 bg-indigo-50 rounded-full w-fit ml-auto">বিক্রীত</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-4 text-right">
                                                        <div className="flex flex-col">
                                                            <span className="font-black text-slate-900 tracking-tight">৳{formatCurrency(item.sales)}</span>
                                                            <span className="text-[9px] text-slate-400 font-bold italic">Avg: ৳{formatCurrency(item.avgSale || 0)}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-5 py-4 text-right">
                                                        <div className="flex flex-col items-end">
                                                            <span className={`font-black ${item.profit >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                                                                {item.profit >= 0 ? '+' : ''}৳{formatCurrency(Math.abs(item.profit))}
                                                            </span>
                                                            {item.sales > 0 && (
                                                                <span className="text-[9px] text-slate-400 font-bold">
                                                                    {((item.profit / item.sales) * 100).toFixed(1)}% মার্জিন
                                                                </span>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="5" className="px-4 py-16 text-center text-slate-400 font-black italic space-y-4">
                                                    <div className="text-5xl">📦</div>
                                                    <div className="text-lg">কোনো পণ্যের বিবরণ পাওয়া যায়নি</div>
                                                    <p className="text-sm font-bold opacity-60">ফেল্টার পরিবর্তন করে আবার চেষ্টা করুন।</p>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                            {report.productBreakdown?.length > 0 && (
                                <div className="p-3 border-t border-slate-100 bg-slate-50/30 text-[9px] text-slate-400 font-bold text-center italic">
                                    ※ এই তালিকায় শুধুমাত্র কেনা অথবা বিক্রি হওয়া এবং স্টকে থাকা পণ্যগুলো দেখানো হচ্ছে।
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProfitReport;
