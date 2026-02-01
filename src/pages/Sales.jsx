import { useState, useEffect } from 'react';
import { saleService, productService } from '../services/businessService';
import { formatCurrency, formatDate, getTodayDate } from '../utils/formatters';
import Loader from '../components/Loader';
import Alert from '../components/Alert';

const Sales = () => {
    const [sales, setSales] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [actionLoading, setActionLoading] = useState(false);

    const [formData, setFormData] = useState({
        saleDate: getTodayDate(),
        products: [{ product: '', quantity: '', salePrice: '' }],
        otherExpenses: []
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [salesData, productsData] = await Promise.all([
                saleService.getAll(),
                productService.getAll()
            ]);
            setSales(salesData);
            setProducts(productsData);
        } catch (error) {
            setError('ডেটা লোড করতে ব্যর্থ হয়েছে');
        } finally {
            setLoading(false);
        }
    };

    const addProductRow = () => {
        setFormData({
            ...formData,
            products: [...formData.products, { product: '', quantity: '', salePrice: '' }]
        });
    };

    const removeProductRow = (index) => {
        const newProducts = formData.products.filter((_, i) => i !== index);
        setFormData({ ...formData, products: newProducts });
    };

    const updateProductRow = (index, field, value) => {
        const newProducts = [...formData.products];
        newProducts[index][field] = value;
        setFormData({ ...formData, products: newProducts });
    };

    const addExpenseRow = () => {
        setFormData({
            ...formData,
            otherExpenses: [...formData.otherExpenses, { name: '', amount: '' }]
        });
    };

    const removeExpenseRow = (index) => {
        const newExpenses = formData.otherExpenses.filter((_, i) => i !== index);
        setFormData({ ...formData, otherExpenses: newExpenses });
    };

    const updateExpenseRow = (index, field, value) => {
        const newExpenses = [...formData.otherExpenses];
        newExpenses[index][field] = value;
        setFormData({ ...formData, otherExpenses: newExpenses });
    };

    const getProductStock = (productId) => {
        const product = products.find(p => p._id === productId);
        return product ? product.currentStock : 0;
    };

    const calculateTotal = () => {
        const productTotal = formData.products.reduce((sum, item) => {
            const qty = parseFloat(item.quantity) || 0;
            const price = parseFloat(item.salePrice) || 0;
            return sum + (qty * price);
        }, 0);

        const expenseTotal = formData.otherExpenses.reduce((sum, exp) => {
            return sum + (parseFloat(exp.amount) || 0);
        }, 0);

        return { productTotal, expenseTotal, grandTotal: productTotal + expenseTotal };
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (formData.products.length === 0 || !formData.products[0].product) {
            setError('অন্তত একটি পণ্য যুক্ত করুন');
            return;
        }

        for (const item of formData.products) {
            const stock = getProductStock(item.product);
            const qty = parseFloat(item.quantity);
            if (qty > stock) {
                const product = products.find(p => p._id === item.product);
                setError(`${product.name} এর পর্যাপ্ত স্টক নেই। বর্তমান স্টক: ${stock}`);
                return;
            }
        }

        setActionLoading(true);
        try {
            const submitData = {
                saleDate: formData.saleDate,
                products: formData.products.map(p => ({
                    product: p.product,
                    quantity: parseFloat(p.quantity),
                    salePrice: parseFloat(p.salePrice)
                })),
                otherExpenses: formData.otherExpenses
                    .filter(e => e.name && e.amount)
                    .map(e => ({
                        name: e.name,
                        amount: parseFloat(e.amount)
                    }))
            };

            await saleService.create(submitData);
            setSuccess('বিক্রয় সফলভাবে যুক্ত হয়েছে');
            resetForm();
            loadData();
        } catch (err) {
            setError(err.response?.data?.message || 'একটি ত্রুটি ঘটেছে');
        } finally {
            setActionLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('আপনি কি নিশ্চিত যে এই বিক্রয়টি মুছে ফেলতে চান?')) {
            return;
        }

        setActionLoading(true);
        try {
            await saleService.delete(id);
            setSuccess('বিক্রয় মুছে ফেলা হয়েছে');
            loadData();
        } catch (err) {
            setError(err.response?.data?.message || 'মুছে ফেলতে ব্যর্থ হয়েছে');
        } finally {
            setActionLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({
            saleDate: getTodayDate(),
            products: [{ product: '', quantity: '', salePrice: '' }],
            otherExpenses: []
        });
        setShowForm(false);
    };

    if (loading) return <Loader />;

    const totals = calculateTotal();

    return (
        <div className="space-y-6 font-bangla">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-black text-slate-800 tracking-tight">বিক্রয় ব্যবস্থাপনা</h2>
                    <p className="text-slate-500 font-medium">প্রতিদিনের বিক্রয়ের হিসাব এখানে সংরক্ষণ করুন।</p>
                </div>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className={`px-6 py-3 rounded-2xl font-bold transition-all shadow-lg active:scale-95 ${showForm
                        ? 'bg-slate-200 text-slate-700 hover:bg-slate-300 shadow-slate-200'
                        : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-200'
                        }`}
                >
                    {showForm ? 'বাতিল করুন' : '+ নতুন বিক্রয়'}
                </button>
            </div>

            {error && <Alert type="error" message={error} onClose={() => setError('')} />}
            {success && <Alert type="success" message={success} onClose={() => setSuccess('')} />}

            {/* Sale Form */}
            {showForm && (
                <div className="premium-card p-4 sm:p-6 animate-fade-in border-slate-200 bg-white">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Header & Date Row */}
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                            <h3 className="text-base font-black text-slate-800 flex items-center gap-2">
                                <span className="w-1.5 h-5 bg-emerald-600 rounded-full"></span>
                                নতুন মেমো তৈরি করুন
                            </h3>
                            <div className="flex items-center gap-3">
                                <label className="text-xs font-bold text-slate-500 whitespace-nowrap">বিক্রয়ের তারিখ:</label>
                                <input
                                    type="date"
                                    value={formData.saleDate}
                                    onChange={(e) => setFormData({ ...formData, saleDate: e.target.value })}
                                    required
                                    className="py-1.5 px-3 text-sm bg-slate-50 border-slate-200 rounded-xl focus:bg-white transition-all shadow-sm outline-none"
                                />
                            </div>
                        </div>

                        {/* Products Section */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between px-1">
                                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">পণ্য নির্বাচন করুন</h4>
                                <button
                                    type="button"
                                    onClick={addProductRow}
                                    className="text-[10px] font-black text-emerald-600 hover:bg-emerald-50 px-3 py-1 rounded-full transition-colors border border-emerald-100"
                                >
                                    + পণ্য যোগ করুন
                                </button>
                            </div>

                            <div className="space-y-2">
                                {formData.products.map((item, index) => {
                                    const selectedProduct = products.find(p => p._id === item.product);
                                    const availableStock = selectedProduct ? selectedProduct.currentStock : 0;

                                    return (
                                        <div key={index} className="flex flex-col md:flex-row gap-3 bg-slate-50/50 p-3 rounded-2xl border border-slate-100 items-end transition-all hover:bg-slate-50">
                                            <div className="flex-1 w-full">
                                                <label className="block text-[10px] font-black text-slate-400 uppercase mb-1 px-1">
                                                    পণ্য {selectedProduct && <span className="text-emerald-500 lowercase">(স্টক: {availableStock} {selectedProduct.unit})</span>}
                                                </label>
                                                <select
                                                    value={item.product}
                                                    onChange={(e) => updateProductRow(index, 'product', e.target.value)}
                                                    required
                                                    className="w-full text-sm py-2 px-3 bg-white border-slate-200 rounded-xl outline-none"
                                                >
                                                    <option value="">সিলেক্ট করুন</option>
                                                    {products.map(p => (
                                                        <option key={p._id} value={p._id}>
                                                            {p.name} — ({p.currentStock} {p.unit})
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>

                                            <div className="w-full md:w-32">
                                                <label className="block text-[10px] font-black text-slate-400 uppercase mb-1 px-1">পরিমাণ</label>
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    value={item.quantity}
                                                    onChange={(e) => updateProductRow(index, 'quantity', e.target.value)}
                                                    required
                                                    max={availableStock}
                                                    className="w-full text-sm py-2 px-3 bg-white border-slate-200 rounded-xl outline-none"
                                                    placeholder="0.00"
                                                />
                                            </div>

                                            <div className="w-full md:w-32">
                                                <label className="block text-[10px] font-black text-slate-400 uppercase mb-1 px-1">বিক্রয়মূল্য</label>
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    value={item.salePrice}
                                                    onChange={(e) => updateProductRow(index, 'salePrice', e.target.value)}
                                                    required
                                                    className="w-full text-sm py-2 px-3 bg-white border-slate-200 rounded-xl outline-none"
                                                    placeholder="0.00"
                                                />
                                            </div>

                                            <div className="flex-shrink-0">
                                                {formData.products.length > 1 && (
                                                    <button
                                                        type="button"
                                                        onClick={() => removeProductRow(index)}
                                                        className="w-9 h-9 flex items-center justify-center text-red-400 hover:bg-red-50 rounded-xl transition-colors"
                                                    >
                                                        🗑️
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Other Expenses Visible */}
                        <div className="pt-2 space-y-3">
                            <div className="flex items-center justify-between px-1">
                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">অতিরিক্ত খরচ (প্যাকিং, ডেলিভারি ইত্যাদি)</h4>
                                <button
                                    type="button"
                                    onClick={addExpenseRow}
                                    className="text-[10px] font-bold text-blue-600 hover:bg-blue-50 px-2 py-0.5 rounded-lg transition-colors"
                                >
                                    + খরচ যোগ করুন
                                </button>
                            </div>

                            <div className="space-y-2">
                                {formData.otherExpenses.map((expense, index) => (
                                    <div key={index} className="flex gap-3 items-center bg-slate-50/30 p-2 rounded-xl border border-slate-100">
                                        <input
                                            type="text"
                                            value={expense.name}
                                            onChange={(e) => updateExpenseRow(index, 'name', e.target.value)}
                                            className="flex-1 text-sm py-1.5 px-3 bg-white border-slate-200 rounded-lg outline-none"
                                            placeholder="বিবরণ"
                                        />
                                        <input
                                            type="number"
                                            value={expense.amount}
                                            onChange={(e) => updateExpenseRow(index, 'amount', e.target.value)}
                                            className="w-24 text-sm py-1.5 px-3 bg-white border-slate-200 rounded-lg outline-none"
                                            placeholder="৳ 0"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => removeExpenseRow(index)}
                                            className="w-8 h-8 flex items-center justify-center text-red-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                        >
                                            ×
                                        </button>
                                    </div>
                                ))}
                                {formData.otherExpenses.length === 0 && (
                                    <p className="text-[10px] text-slate-300 italic px-2">অতিরিক্ত কোনো খরচ নেই।</p>
                                )}
                            </div>
                        </div>

                        {/* Summary & Actions */}
                        <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-slate-900 rounded-2xl p-4 text-white">
                            <div className="flex gap-6 text-center md:text-left">
                                <div>
                                    <p className="text-[9px] text-slate-400 font-bold uppercase">পণ্যের মূল্য</p>
                                    <p className="font-black text-sm">৳ {formatCurrency(totals.productTotal)}</p>
                                </div>
                                <div>
                                    <p className="text-[9px] text-slate-400 font-bold uppercase">অন্যান্য</p>
                                    <p className="font-black text-sm">৳ {formatCurrency(totals.expenseTotal)}</p>
                                </div>
                                <div className="md:border-l border-slate-700 md:pl-6">
                                    <p className="text-[9px] text-emerald-400 font-bold uppercase">সর্বমোট বিল</p>
                                    <p className="font-black text-xl text-emerald-400">৳ {formatCurrency(totals.grandTotal)}</p>
                                </div>
                            </div>
                            <div className="flex gap-2 w-full md:w-auto">
                                <button
                                    type="button"
                                    onClick={resetForm}
                                    className="flex-1 md:flex-none px-6 py-2.5 text-xs font-black bg-slate-800 text-slate-300 rounded-xl hover:bg-slate-700 transition-all border border-slate-700"
                                >
                                    বাতিল
                                </button>
                                <button
                                    type="submit"
                                    disabled={actionLoading}
                                    className="flex-3 md:flex-none px-10 py-2.5 text-xs font-black bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-900/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {actionLoading ? (
                                        <>
                                            <span className="w-3 h-3 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
                                            <span>সেভ হচ্ছে...</span>
                                        </>
                                    ) : (
                                        'মেমো সেভ করুন'
                                    )}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            )}

            {/* Sales List - Responsive */}
            <div className="space-y-4">
                {/* Mobile View: Card List */}
                <div className="grid grid-cols-1 gap-4 sm:hidden">
                    {sales.length === 0 ? (
                        <div className="premium-card p-10 text-center bg-white">
                            <span className="text-4xl mb-3 block">💰</span>
                            <p className="text-slate-400 font-bold">কোনো বিক্রয়ের রেকর্ড নেই</p>
                        </div>
                    ) : (
                        sales.map((sale) => (
                            <div key={sale._id} className="premium-card p-4 bg-white border-slate-100 shadow-sm relative overflow-hidden group">
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">তারিখ</p>
                                        <p className="text-sm font-bold text-slate-700">{formatDate(sale.saleDate)}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-1">মোট বিল</p>
                                        <p className="text-lg font-black text-emerald-600">৳ {formatCurrency(sale.totalSaleAmount)}</p>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">বিক্রীত পণ্য</p>
                                        <div className="flex flex-wrap gap-1.5">
                                            {sale.products.map((item, idx) => (
                                                <span key={idx} className="inline-flex items-center px-2.5 py-1 bg-slate-50 border border-slate-100 rounded-lg text-[11px] font-bold text-slate-600">
                                                    {item.productName} × {item.quantity} {item.unit}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="flex justify-between items-center pt-3 border-t border-slate-50">
                                        <div>
                                            <span className="text-[10px] font-bold text-slate-400">অন্যান্য খরচ: </span>
                                            <span className="text-xs font-bold text-slate-600">৳ {formatCurrency(sale.totalOtherExpenses || 0)}</span>
                                        </div>
                                        <button
                                            onClick={() => handleDelete(sale._id)}
                                            disabled={actionLoading}
                                            className="px-3 py-1.5 rounded-lg bg-accent-50 text-accent-600 text-xs font-bold flex items-center gap-1.5 active:scale-95 transition-transform disabled:opacity-50"
                                        >
                                            {actionLoading ? '⏳' : '🗑️'} মুছুন
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Desktop View: Table */}
                <div className="hidden sm:block premium-card overflow-hidden border-slate-200 bg-white">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/80 border-b border-slate-100">
                                    <th className="px-6 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">তারিখ</th>
                                    <th className="px-6 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">বিক্রীত পণ্য</th>
                                    <th className="px-6 py-5 text-xs font-black text-slate-400 uppercase tracking-widest text-right">অন্যান্য খরচ</th>
                                    <th className="px-6 py-5 text-xs font-black text-slate-400 uppercase tracking-widest text-right">মোট বিল</th>
                                    <th className="px-6 py-5 text-xs font-black text-slate-400 uppercase tracking-widest text-center">অ্যাকশন</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {sales.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-20 text-center">
                                            <div className="flex flex-col items-center">
                                                <span className="text-5xl mb-4">💰</span>
                                                <p className="text-slate-400 font-bold">কোনো বিক্রয়ের রেকর্ড পাওয়া যায়নি</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    sales.map((sale) => (
                                        <tr key={sale._id} className="hover:bg-slate-50/50 transition-colors group">
                                            <td className="px-6 py-5 whitespace-nowrap">
                                                <span className="text-sm font-bold text-slate-700">{formatDate(sale.saleDate)}</span>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="flex flex-wrap gap-2">
                                                    {sale.products.map((item, idx) => (
                                                        <span key={idx} className="inline-flex items-center px-3 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-600 shadow-sm">
                                                            {item.productName} × {item.quantity} {item.unit}
                                                        </span>
                                                    ))}
                                                </div>
                                            </td>
                                            <td className="px-6 py-5 text-right">
                                                <span className="text-sm font-bold text-slate-500">
                                                    ৳ {formatCurrency(sale.totalOtherExpenses || 0)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-5 text-right">
                                                <span className="text-xl font-black text-emerald-600">
                                                    ৳ {formatCurrency(sale.totalSaleAmount)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-5 text-center">
                                                <button
                                                    onClick={() => handleDelete(sale._id)}
                                                    disabled={actionLoading}
                                                    className="w-10 h-10 rounded-xl bg-accent-50 text-accent-600 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-accent-100 active:scale-95 mx-auto disabled:opacity-50"
                                                    title="মুছে ফেলুন"
                                                >
                                                    {actionLoading ? '⏳' : '🗑️'}
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Sales;
