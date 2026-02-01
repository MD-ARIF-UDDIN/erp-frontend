import { useState, useEffect } from 'react';
import { productService } from '../services/businessService';
import { formatCurrency } from '../utils/formatters';
import Loader from '../components/Loader';
import Alert from '../components/Alert';

const Products = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        unit: ''
    });

    useEffect(() => {
        loadProducts();
    }, []);

    const loadProducts = async () => {
        try {
            const data = await productService.getAll();
            setProducts(data);
        } catch (error) {
            setError('পণ্য লোড করতে ব্যর্থ হয়েছে');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        try {
            if (editingProduct) {
                await productService.update(editingProduct._id, formData);
                setSuccess('পণ্য আপডেট হয়েছে');
            } else {
                await productService.create(formData);
                setSuccess('পণ্য যুক্ত হয়েছে');
            }

            resetForm();
            loadProducts();
        } catch (err) {
            setError(err.response?.data?.message || 'একটি ত্রুটি ঘটেছে');
        }
    };

    const handleEdit = (product) => {
        setEditingProduct(product);
        setFormData({
            name: product.name,
            unit: product.unit
        });
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('আপনি কি নিশ্চিত যে এই পণ্যটি মুছে ফেলতে চান?')) {
            return;
        }

        try {
            await productService.delete(id);
            setSuccess('পণ্য মুছে ফেলা হয়েছে');
            loadProducts();
        } catch (err) {
            setError(err.response?.data?.message || 'মুছে ফেলতে ব্যর্থ হয়েছে');
        }
    };

    const resetForm = () => {
        setFormData({ name: '', unit: '' });
        setEditingProduct(null);
        setShowForm(false);
    };

    if (loading) return <Loader />;

    return (
        <div className="p-4 max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800">পণ্য তালিকা</h2>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="bg-primary-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-primary-700 transition-colors"
                >
                    {showForm ? 'বাতিল করুন' : '+ নতুন পণ্য'}
                </button>
            </div>

            {error && <Alert type="error" message={error} onClose={() => setError('')} />}
            {success && <Alert type="success" message={success} onClose={() => setSuccess('')} />}

            {/* Add/Edit Form */}
            {showForm && (
                <div className="bg-white rounded-xl shadow-md p-6 mb-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">
                        {editingProduct ? 'পণ্য সম্পাদনা করুন' : 'নতুন পণ্য যুক্ত করুন'}
                    </h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                পণ্যের নাম *
                            </label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                                placeholder="যেমন: চাল, ডাল, তেল"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                একক *
                            </label>
                            <input
                                type="text"
                                value={formData.unit}
                                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                                required
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                                placeholder="যেমন: কেজি, পিস, লিটার"
                            />
                        </div>

                        <div className="flex gap-3">
                            <button
                                type="submit"
                                className="flex-1 bg-primary-600 text-white py-3 rounded-lg font-medium hover:bg-primary-700 transition-colors"
                            >
                                {editingProduct ? 'আপডেট করুন' : 'সংরক্ষণ করুন'}
                            </button>
                            <button
                                type="button"
                                onClick={resetForm}
                                className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                            >
                                বাতিল করুন
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Products List */}
            {products.length === 0 ? (
                <div className="bg-white rounded-xl shadow-md p-12 text-center">
                    <span className="text-6xl block mb-4">📦</span>
                    <p className="text-gray-600">কোনো পণ্য পাওয়া যায়নি</p>
                    <p className="text-sm text-gray-500 mt-2">নতুন পণ্য যুক্ত করতে উপরের বাটনে ক্লিক করুন</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {products.map((product) => (
                        <div key={product._id} className="bg-white rounded-xl shadow-md p-5 hover:shadow-lg transition-shadow">
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex-1">
                                    <h3 className="text-lg font-semibold text-gray-800 mb-1">{product.name}</h3>
                                    <p className="text-sm text-gray-600">একক: {product.unit}</p>
                                </div>
                                <span className="text-2xl">📦</span>
                            </div>

                            <div className="bg-gray-50 rounded-lg p-3 mb-4">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm text-gray-600">বর্তমান স্টক:</span>
                                    <span className="text-lg font-bold text-primary-600">
                                        {product.currentStock} {product.unit}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">গড় ক্রয়মূল্য:</span>
                                    <span className="text-sm font-semibold text-gray-800">
                                        ৳ {formatCurrency(product.averagePurchasePrice)}
                                    </span>
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleEdit(product)}
                                    className="flex-1 bg-blue-500 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors"
                                >
                                    সম্পাদনা
                                </button>
                                <button
                                    onClick={() => handleDelete(product._id)}
                                    className="flex-1 bg-red-500 text-white py-2 rounded-lg text-sm font-medium hover:bg-red-600 transition-colors"
                                >
                                    মুছুন
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Products;
