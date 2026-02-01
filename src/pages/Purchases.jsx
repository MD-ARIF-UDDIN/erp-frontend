import { useState, useEffect } from 'react';
import { purchaseService, productService } from '../services/businessService';
import { formatCurrency, formatDate, getTodayDate } from '../utils/formatters';
import Loader from '../components/Loader';
import Alert from '../components/Alert';

const Purchases = () => {
    const [purchases, setPurchases] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [formData, setFormData] = useState({
        purchaseDate: getTodayDate(),
        products: [{ product: '', quantity: '', purchasePrice: '' }],
        otherExpenses: []
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [purchasesData, productsData] = await Promise.all([
                purchaseService.getAll(),
                productService.getAll()
            ]);
            setPurchases(purchasesData);
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
            products: [...formData.products, { product: '', quantity: '', purchasePrice: '' }]
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

    const calculateTotal = () => {
        const productTotal = formData.products.reduce((sum, item) => {
            const qty = parseFloat(item.quantity) || 0;
            const price = parseFloat(item.purchasePrice) || 0;
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

        try {
            const submitData = {
                purchaseDate: formData.purchaseDate,
                products: formData.products.map(p => ({
                    product: p.product,
                    quantity: parseFloat(p.quantity),
                    purchasePrice: parseFloat(p.purchasePrice)
                })),
                otherExpenses: formData.otherExpenses
                    .filter(e => e.name && e.amount)
                    .map(e => ({
                        name: e.name,
                        amount: parseFloat(e.amount)
                    }))
            };

            await purchaseService.create(submitData);
            setSuccess('ক্রয় সফলভাবে যুক্ত হয়েছে');
            resetForm();
            loadData();
        } catch (err) {
            setError(err.response?.data?.message || 'একটি ত্রুটি ঘটেছে');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('আপনি কি নিশ্চিত যে এই ক্রয়টি মুছে ফেলতে চান?')) {
            return;
        }

        try {
            await purchaseService.delete(id);
            setSuccess('ক্রয় মুছে ফেলা হয়েছে');
            loadData();
        } catch (err) {
            setError(err.response?.data?.message || 'মুছে ফেলতে ব্যর্থ হয়েছে');
        }
    };

    const resetForm = () => {
        setFormData({
            purchaseDate: getTodayDate(),
            products: [{ product: '', quantity: '', purchasePrice: '' }],
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
                    <h2 className="text-2xl font-black text-slate-800 tracking-tight">ক্রয় ব্যবস্থাপনা</h2>
                    <p className="text-slate-500 font-medium">সমস্ত ক্রয়ের হিসাব এখানে দেখুন।</p>
                </div>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className={`px-6 py-3 rounded-2xl font-bold transition-all shadow-lg active:scale-95 ${showForm
                        ? 'bg-slate-200 text-slate-700 hover:bg-slate-300 shadow-slate-200'
                        : 'bg-primary-600 text-white hover:bg-primary-700 shadow-primary-200'
                        }`}
                >
                    {showForm ? 'বাতিল করুন' : '+ নতুন ক্রয়'}
                </button>
            </div>

            {error && <Alert type="error" message={error} onClose={() => setError('')} />}
            {success && <Alert type="success" message={success} onClose={() => setSuccess('')} />}

            {/* Purchase Form */}
            {showForm && (
                <div className="premium-card p-4 sm:p-6 animate-fade-in border-slate-200 bg-white">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Header & Date Row */}
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                            <h3 className="text-base font-black text-slate-800 flex items-center gap-2">
                                <span className="w-1.5 h-5 bg-primary-600 rounded-full"></span>
                                নতুন ক্রয় এন্ট্রি
                            </h3>
                            <div className="flex items-center gap-3">
                                <label className="text-xs font-bold text-slate-500 whitespace-nowrap">ক্রয়ের তারিখ:</label>
                                <input
                                    type="date"
                                    value={formData.purchaseDate}
                                    onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
                                    required
                                    className="py-1.5 px-3 text-sm bg-slate-50 border-slate-200 rounded-xl focus:bg-white transition-all shadow-sm outline-none"
                                />
                            </div>
                        </div>

                        {/* Products Section */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between px-1">
                                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">পণ্য তালিকা</h4>
                                <button
                                    type="button"
                                    onClick={addProductRow}
                                    className="text-[10px] font-black text-primary-600 hover:bg-primary-50 px-3 py-1 rounded-full transition-colors border border-primary-100"
                                >
                                    + পণ্য যোগ করুন
                                </button>
                            </div>

                            <div className="space-y-2">
                                {formData.products.map((item, index) => (
                                    <div key={index} className="flex flex-col md:flex-row gap-3 bg-slate-50/50 p-3 rounded-2xl border border-slate-100 items-end">
                                        <div className="flex-1 w-full">
                                            <label className="block text-[10px] font-black text-slate-400 uppercase mb-1 px-1">পণ্য</label>
                                            <select
                                                value={item.product}
                                                onChange={(e) => updateProductRow(index, 'product', e.target.value)}
                                                required
                                                className="w-full text-sm py-2 px-3 bg-white border-slate-200 rounded-xl outline-none"
                                            >
                                                <option value="">সিলেক্ট করুন</option>
                                                {products.map(p => (
                                                    <option key={p._id} value={p._id}>{p.name} ({p.unit})</option>
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
                                                className="w-full text-sm py-2 px-3 bg-white border-slate-200 rounded-xl outline-none"
                                                placeholder="0.00"
                                            />
                                        </div>

                                        <div className="w-full md:w-32">
                                            <label className="block text-[10px] font-black text-slate-400 uppercase mb-1 px-1">একক মূল্য</label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                value={item.purchasePrice}
                                                onChange={(e) => updateProductRow(index, 'purchasePrice', e.target.value)}
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
                                ))}
                            </div>
                        </div>

                        {/* Other Expenses Simplified */}
                        <div className="pt-2">
                            <details className="group">
                                <summary className="list-none cursor-pointer flex items-center gap-2 text-xs font-black text-slate-400 hover:text-slate-600 transition-colors">
                                    <span className="group-open:rotate-90 transition-transform">▶</span>
                                    অন্যান্য খরচ (জ্বালানি, লেবার ইত্যাদি)
                                </summary>
                                <div className="mt-3 space-y-2 pl-4 border-l-2 border-slate-100">
                                    {formData.otherExpenses.map((expense, index) => (
                                        <div key={index} className="flex gap-3 items-center">
                                            <input
                                                type="text"
                                                value={expense.name}
                                                onChange={(e) => updateExpenseRow(index, 'name', e.target.value)}
                                                className="flex-1 text-sm py-1.5 px-3 bg-slate-50 border-slate-200 rounded-lg outline-none"
                                                placeholder="খরচের বিবরণ"
                                            />
                                            <input
                                                type="number"
                                                value={expense.amount}
                                                onChange={(e) => updateExpenseRow(index, 'amount', e.target.value)}
                                                className="w-24 text-sm py-1.5 px-3 bg-slate-50 border-slate-200 rounded-lg outline-none"
                                                placeholder="৳ 0.00"
                                            />
                                            <button type="button" onClick={() => removeExpenseRow(index)} className="text-red-400 hover:text-red-600">×</button>
                                        </div>
                                    ))}
                                    <button
                                        type="button"
                                        onClick={addExpenseRow}
                                        className="text-[10px] font-bold text-blue-600 hover:underline"
                                    >
                                        + খরচ যোগ করুন
                                    </button>
                                </div>
                            </details>
                        </div>

                        {/* Summary & Actions */}
                        <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-slate-900 rounded-2xl p-4 text-white">
                            <div className="flex gap-6 text-center md:text-left">
                                <div>
                                    <p className="text-[9px] text-slate-400 font-bold uppercase">পণ্য মূল্য</p>
                                    <p className="font-black text-sm">৳ {formatCurrency(totals.productTotal)}</p>
                                </div>
                                <div>
                                    <p className="text-[9px] text-slate-400 font-bold uppercase">অন্যান্য</p>
                                    <p className="font-black text-sm">৳ {formatCurrency(totals.expenseTotal)}</p>
                                </div>
                                <div className="md:border-l border-slate-700 md:pl-6">
                                    <p className="text-[9px] text-primary-400 font-bold uppercase">মোট দেওড়া</p>
                                    <p className="font-black text-xl text-primary-400">৳ {formatCurrency(totals.grandTotal)}</p>
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
                                    className="flex-3 md:flex-none px-10 py-2.5 text-xs font-black bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-all shadow-lg shadow-primary-900/20"
                                >
                                    সেভ করুন
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            )}

            {/* Purchases List - Table Wise */}
            <div className="premium-card overflow-hidden border-slate-200">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/80 border-b border-slate-100">
                                <th className="px-6 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">তারিখ</th>
                                <th className="px-6 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">পণ্যের বিবরণ</th>
                                <th className="px-6 py-5 text-xs font-black text-slate-400 uppercase tracking-widest text-right">অন্যান্য খরচ</th>
                                <th className="px-6 py-5 text-xs font-black text-slate-400 uppercase tracking-widest text-right">সর্বমোট</th>
                                <th className="px-6 py-5 text-xs font-black text-slate-400 uppercase tracking-widest text-center">অ্যাকশন</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {purchases.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-20 text-center">
                                        <div className="flex flex-col items-center">
                                            <span className="text-5xl mb-4">🛒</span>
                                            <p className="text-slate-400 font-bold">কোনো ক্রয়ের রেকর্ড পাওয়া যায়নি</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                purchases.map((purchase) => (
                                    <tr key={purchase._id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-6 py-5 whitespace-nowrap">
                                            <span className="text-sm font-bold text-slate-700">{formatDate(purchase.purchaseDate)}</span>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex flex-wrap gap-2">
                                                {purchase.products.map((item, idx) => (
                                                    <span key={idx} className="inline-flex items-center px-3 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-600 shadow-sm">
                                                        {item.productName} × {item.quantity} {item.unit}
                                                    </span>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-right">
                                            <span className="text-sm font-bold text-slate-500">
                                                ৳ {formatCurrency(purchase.totalOtherExpenses || 0)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5 text-right">
                                            <span className="text-lg font-black text-primary-600">
                                                ৳ {formatCurrency(purchase.totalPurchaseAmount)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5 text-center">
                                            <button
                                                onClick={() => handleDelete(purchase._id)}
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

export default Purchases;
