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
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('আপনি কি নিশ্চিত যে এই বিক্রয়টি মুছে ফেলতে চান?')) {
            return;
        }

        try {
            await saleService.delete(id);
            setSuccess('বিক্রয় মুছে ফেলা হয়েছে');
            loadData();
        } catch (err) {
            setError(err.response?.data?.message || 'মুছে ফেলতে ব্যর্থ হয়েছে');
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
                <div className="premium-card p-8 animate-fade-in border-slate-200">
                    <h3 className="text-lg font-black text-slate-800 mb-8 flex items-center gap-2">
                        <span className="w-1.5 h-6 bg-emerald-600 rounded-full"></span>
                        নতুন মেমো তৈরি করুন
                    </h3>

                    <form onSubmit={handleSubmit} className="space-y-10">
                        {/* Date */}
                        <div className="max-w-xs">
                            <label className="block text-sm font-bold text-slate-700 mb-2 px-1">
                                বিক্রয়ের তারিখ
                            </label>
                            <input
                                type="date"
                                value={formData.saleDate}
                                onChange={(e) => setFormData({ ...formData, saleDate: e.target.value })}
                                required
                                className="w-full bg-slate-50 border-slate-200 focus:bg-white transition-all shadow-sm"
                            />
                        </div>

                        {/* Products */}
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <h4 className="font-bold text-slate-800">পণ্য নির্বাচন করুন</h4>
                                <button
                                    type="button"
                                    onClick={addProductRow}
                                    className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 px-3 py-1.5 bg-emerald-50 rounded-full transition-colors"
                                >
                                    + পণ্য যুক্ত করুন
                                </button>
                            </div>

                            <div className="space-y-4">
                                {formData.products.map((item, index) => {
                                    const selectedProduct = products.find(p => p._id === item.product);
                                    const availableStock = selectedProduct ? selectedProduct.currentStock : 0;

                                    return (
                                        <div key={index} className="grid grid-cols-1 md:grid-cols-12 gap-4 bg-slate-50/50 p-6 rounded-3xl border border-slate-100 relative group transition-all hover:bg-slate-50">
                                            <div className="md:col-span-12 lg:col-span-5">
                                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1 px-1">পণ্য (বর্তমান স্টক দেখুন)</label>
                                                <select
                                                    value={item.product}
                                                    onChange={(e) => updateProductRow(index, 'product', e.target.value)}
                                                    required
                                                    className="w-full bg-white border-slate-200"
                                                >
                                                    <option value="">সিলেক্ট করুন</option>
                                                    {products.map(p => (
                                                        <option key={p._id} value={p._id}>
                                                            {p.name} ({p.unit}) — স্টক: {p.currentStock}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>

                                            <div className="md:col-span-6 lg:col-span-3">
                                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1 px-1">পরিমাণ (সর্বোচ্চ: {availableStock})</label>
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    value={item.quantity}
                                                    onChange={(e) => updateProductRow(index, 'quantity', e.target.value)}
                                                    required
                                                    max={availableStock}
                                                    className="w-full bg-white border-slate-200"
                                                    placeholder="0.00"
                                                />
                                            </div>

                                            <div className="md:col-span-6 lg:col-span-3">
                                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1 px-1">বিক্রয়মূল্য (৳)</label>
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    value={item.salePrice}
                                                    onChange={(e) => updateProductRow(index, 'salePrice', e.target.value)}
                                                    required
                                                    className="w-full bg-white border-slate-200"
                                                    placeholder="0.00"
                                                />
                                            </div>

                                            <div className="md:col-span-12 lg:col-span-1 flex items-end justify-center pb-2">
                                                {formData.products.length > 1 && (
                                                    <button
                                                        type="button"
                                                        onClick={() => removeProductRow(index)}
                                                        className="w-10 h-10 rounded-xl flex items-center justify-center text-accent-500 hover:bg-accent-50 hover:text-accent-600 transition-colors"
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

                        {/* Other Expenses */}
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <h4 className="font-bold text-slate-800">অতিরিক্ত খরচ (যদি থাকে)</h4>
                                <button
                                    type="button"
                                    onClick={addExpenseRow}
                                    className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 px-3 py-1.5 bg-blue-50 rounded-full transition-colors"
                                >
                                    + খরচ যুক্ত করুন
                                </button>
                            </div>

                            {formData.otherExpenses.length > 0 && (
                                <div className="space-y-3">
                                    {formData.otherExpenses.map((expense, index) => (
                                        <div key={index} className="grid grid-cols-1 md:grid-cols-12 gap-4 bg-slate-50/50 p-6 rounded-3xl border border-slate-100 items-end">
                                            <div className="md:col-span-7">
                                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1 px-1">বিবরণ (যেমন: প্যাকিং, লেবার)</label>
                                                <input
                                                    type="text"
                                                    value={expense.name}
                                                    onChange={(e) => updateExpenseRow(index, 'name', e.target.value)}
                                                    className="w-full bg-white border-slate-200"
                                                    placeholder="খরচের নাম"
                                                />
                                            </div>

                                            <div className="md:col-span-4">
                                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1 px-1">পরিমাণ (৳)</label>
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    value={expense.amount}
                                                    onChange={(e) => updateExpenseRow(index, 'amount', e.target.value)}
                                                    className="w-full bg-white border-slate-200"
                                                    placeholder="0.00"
                                                />
                                            </div>

                                            <div className="md:col-span-1 flex justify-center pb-2">
                                                <button
                                                    type="button"
                                                    onClick={() => removeExpenseRow(index)}
                                                    className="w-10 h-10 rounded-xl flex items-center justify-center text-accent-500 hover:bg-accent-50 hover:text-accent-600 transition-colors"
                                                >
                                                    🗑️
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Total Summary */}
                        <div className="bg-slate-900 rounded-[2rem] p-8 text-white shadow-2xl shadow-slate-200">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
                                <div className="space-y-1">
                                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">পণ্যের মোট মূল্য</p>
                                    <p className="text-2xl font-black">৳ {formatCurrency(totals.productTotal)}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">অন্যান্য খরচ</p>
                                    <p className="text-2xl font-black">৳ {formatCurrency(totals.expenseTotal)}</p>
                                </div>
                                <div className="space-y-1 border-slate-800 md:border-l md:pl-8">
                                    <p className="text-emerald-400 text-xs font-bold uppercase tracking-widest">সর্বমোট বিল</p>
                                    <p className="text-4xl font-black text-emerald-400">৳ {formatCurrency(totals.grandTotal)}</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-4 pt-4">
                            <button
                                type="submit"
                                className="flex-1 bg-slate-900 text-white py-4 rounded-2xl font-bold hover:bg-slate-800 active:scale-[0.98] transition-all shadow-xl shadow-slate-200"
                            >
                                মেমো তৈরি করুন
                            </button>
                            <button
                                type="button"
                                onClick={resetForm}
                                className="px-8 bg-slate-100 text-slate-600 py-4 rounded-2xl font-bold hover:bg-slate-200 transition-all"
                            >
                                বাতিল
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Sales List - Table Wise */}
            <div className="premium-card overflow-hidden border-slate-200">
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
                                            <span className="text-lg font-black text-emerald-600">
                                                ৳ {formatCurrency(sale.totalSaleAmount)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5 text-center">
                                            <button
                                                onClick={() => handleDelete(sale._id)}
                                                className="w-10 h-10 rounded-xl bg-accent-50 text-accent-600 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-accent-100 active:scale-95 mx-auto"
                                                title="মুছে ফেলুন"
                                            >
                                                🗑️
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
    );
};

export default Sales;
