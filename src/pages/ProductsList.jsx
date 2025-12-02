import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/layouts/DashboardLayout';
import { Plus, Search, Edit, Trash2, Package } from 'lucide-react';
import { motion } from 'framer-motion';
import { getProductsApi, deleteProductApi } from '../utils/Api';

const ProductsList = () => {
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [typeFilter, setTypeFilter] = useState('all');

    useEffect(() => {
        fetchProducts();
    }, []);

    useEffect(() => {
        filterProducts();
    }, [products, searchQuery, typeFilter]);

    const fetchProducts = async () => {
        try {
            const response = await getProductsApi();
            const data = response.data.data || response.data;
            setProducts(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error fetching products:', error);
        } finally {
            setLoading(false);
        }
    };

    const filterProducts = () => {
        let filtered = products;

        if (typeFilter !== 'all') {
            filtered = filtered.filter(p => p.type === typeFilter);
        }

        if (searchQuery) {
            filtered = filtered.filter(p =>
                p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                p.description.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        setFilteredProducts(filtered);
    };

    const handleDelete = async (id, name) => {
        if (!window.confirm(`Are you sure you want to delete "${name}"?`)) return;

        try {
            await deleteProductApi(id);
            await fetchProducts();
        } catch (error) {
            console.error('Error deleting product:', error);
            alert('Failed to delete product');
        }
    };

    return (
        <DashboardLayout title="Products">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zg-secondary/50" />
                    <input
                        type="text"
                        placeholder="Search products..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 rounded-lg bg-zg-surface border border-zg-secondary/10 text-zg-primary focus:outline-none focus:border-zg-accent focus:ring-1 focus:ring-zg-accent transition"
                    />
                </div>

                <div className="flex gap-3">
                    <select
                        value={typeFilter}
                        onChange={(e) => setTypeFilter(e.target.value)}
                        className="px-4 py-3 rounded-lg bg-zg-surface border border-zg-secondary/10 text-zg-primary focus:outline-none focus:border-zg-accent focus:ring-1 focus:ring-zg-accent transition"
                    >
                        <option value="all">All Types</option>
                        <option value="frame">Frames</option>
                        <option value="ealbum">E-Albums</option>
                    </select>

                    <button
                        onClick={() => navigate('/admin/products/new')}
                        className="flex items-center gap-2 px-6 py-3 bg-zg-accent text-black font-bold rounded-lg hover:bg-zg-accent/90 transition-all shadow-lg shadow-zg-accent/20"
                    >
                        <Plus className="w-5 h-5" />
                        Add Product
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-zg-accent"></div>
                </div>
            ) : filteredProducts.length === 0 ? (
                <div className="text-center py-20">
                    <Package className="w-16 h-16 text-zg-secondary/30 mx-auto mb-4" />
                    <h3 className="text-2xl font-heading font-bold mb-2">No products found</h3>
                    <p className="text-zg-secondary mb-6">Try adjusting your search or filters</p>
                    {products.length === 0 && (
                        <button
                            onClick={() => navigate('/admin/products/new')}
                            className="px-6 py-3 bg-zg-accent text-black font-bold rounded-lg hover:bg-zg-accent/90 transition-all"
                        >
                            Add Your First Product
                        </button>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredProducts.map((product, index) => (
                        <motion.div
                            key={product._id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="bg-zg-surface/50 backdrop-blur-xl border border-zg-secondary/10 rounded-2xl overflow-hidden hover:border-zg-accent/50 transition-all group"
                        >
                            <div className="aspect-[4/3] overflow-hidden bg-zg-secondary/5 relative">
                                {product.coverImage ? (
                                    <img
                                        src={product.coverImage}
                                        alt={product.name}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <Package className="w-12 h-12 text-zg-secondary/20" />
                                    </div>
                                )}

                                {/* Type Badge */}
                                <div className="absolute top-4 left-4">
                                    <span className="px-3 py-1 bg-zg-accent/90 text-black text-xs font-bold rounded-full backdrop-blur-sm">
                                        {product.type === 'frame' ? 'Frame' : 'E-Album'}
                                    </span>
                                </div>

                                {/* Status Badge */}
                                {!product.isActive && (
                                    <div className="absolute top-4 right-4">
                                        <span className="px-3 py-1 bg-red-500/90 text-white text-xs font-bold rounded-full backdrop-blur-sm">
                                            Inactive
                                        </span>
                                    </div>
                                )}
                            </div>

                            <div className="p-6">
                                <h3 className="text-lg font-bold mb-2 line-clamp-1">{product.name}</h3>
                                <p className="text-sm text-zg-secondary line-clamp-2 mb-4">{product.description}</p>

                                <div className="flex items-center justify-between mb-4">
                                    <span className="text-xl font-bold text-zg-accent">₹{product.price}</span>
                                    {product.type === 'frame' && (
                                        <span className={`text-sm ${product.stock > 0 ? 'text-green-400' : 'text-red-400'}`}>
                                            Stock: {product.stock}
                                        </span>
                                    )}
                                    {product.type === 'ealbum' && (
                                        <span className="text-sm text-blue-400">Digital</span>
                                    )}
                                </div>

                                <div className="flex gap-2">
                                    <button
                                        onClick={() => navigate(`/admin/products/${product._id}`)}
                                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-zg-surface border border-zg-secondary/10 rounded-lg hover:border-zg-accent transition-colors text-sm font-medium"
                                    >
                                        <Edit className="w-4 h-4" />
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(product._id, product.name)}
                                        className="flex items-center justify-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg hover:bg-red-500/20 transition-colors text-sm font-medium"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </DashboardLayout>
    );
};

export default ProductsList;
