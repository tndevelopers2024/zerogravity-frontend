import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ShoppingBag, Search, Frame, BookOpen, Filter } from 'lucide-react';
import { motion } from 'framer-motion';
import { getProductsApi } from '../utils/Api';

const Shop = () => {
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedType, setSelectedType] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    useEffect(() => {
        fetchProducts();
        // Get type from URL if present
        const typeParam = searchParams.get('type');
        if (typeParam) {
            setSelectedType(typeParam);
        }
    }, [searchParams]);

    useEffect(() => {
        filterProducts();
    }, [products, selectedType, searchQuery]);

    const fetchProducts = async () => {
        try {
            const response = await getProductsApi();
            // Handle both array response and paginated response
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

        // Filter by type
        if (selectedType !== 'all') {
            filtered = filtered.filter(p => p.type === selectedType);
        }

        // Filter by search query
        if (searchQuery) {
            filtered = filtered.filter(p =>
                p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                p.description.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        setFilteredProducts(filtered);
    };

    const types = [
        { id: 'all', name: 'All Products', icon: ShoppingBag },
        { id: 'frame', name: 'Frames', icon: Frame },
        { id: 'ealbum', name: 'Albums', icon: BookOpen }
    ];

    return (
        <div className="min-h-screen bg-zg-bg text-zg-primary p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <header className="mb-12">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-8">
                        <div>
                            <h1 className="text-4xl font-heading font-bold mb-2">Shop</h1>
                            <p className="text-zg-secondary">Discover our collection of frames and albums</p>
                        </div>
                        <button
                            onClick={() => navigate('/my-orders')}
                            className="flex items-center gap-2 px-6 py-3 bg-zg-surface border border-zg-secondary/10 rounded-xl hover:border-zg-accent transition-colors w-fit"
                        >
                            <ShoppingBag className="w-5 h-5" />
                            <span>My Orders</span>
                        </button>
                    </div>

                    {/* Search Bar */}
                    <div className="relative mb-6">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zg-secondary/50" />
                        <input
                            type="text"
                            placeholder="Search products..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-4 bg-zg-surface border border-zg-secondary/10 rounded-xl text-zg-primary focus:outline-none focus:border-zg-accent focus:ring-1 focus:ring-zg-accent transition"
                        />
                    </div>

                    {/* Type Filters */}
                    <div className="flex flex-wrap gap-3">
                        {types.map((type) => (
                            <button
                                key={type.id}
                                onClick={() => setSelectedType(type.id)}
                                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${selectedType === type.id
                                    ? 'bg-zg-accent text-black shadow-lg shadow-zg-accent/30'
                                    : 'bg-zg-surface border border-zg-secondary/10 text-zg-secondary hover:border-zg-accent/50'
                                    }`}
                            >
                                <type.icon className="w-5 h-5" />
                                <span>{type.name}</span>
                            </button>
                        ))}
                    </div>
                </header>

                {/* Products Grid */}
                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-zg-accent"></div>
                    </div>
                ) : filteredProducts.length === 0 ? (
                    <div className="text-center py-20">
                        <Filter className="w-16 h-16 text-zg-secondary/30 mx-auto mb-4" />
                        <h3 className="text-2xl font-heading font-bold mb-2">No products found</h3>
                        <p className="text-zg-secondary">Try adjusting your filters or search query</p>
                    </div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                    >
                        {filteredProducts.map((product, index) => (
                            <motion.div
                                key={product._id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3, delay: index * 0.05 }}
                                className="bg-zg-surface/50 backdrop-blur-xl border border-zg-secondary/10 rounded-2xl overflow-hidden group hover:border-zg-accent/50 transition-all duration-300 hover:shadow-xl hover:shadow-zg-accent/10"
                            >
                                <div className="aspect-[4/3] overflow-hidden bg-zg-secondary/5 relative">
                                    {product.coverImage ? (
                                        <img
                                            src={product.coverImage}
                                            alt={product.name}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-zg-secondary">
                                            {product.type === 'frame' ? (
                                                <Frame className="w-12 h-12 opacity-20" />
                                            ) : (
                                                <BookOpen className="w-12 h-12 opacity-20" />
                                            )}
                                        </div>
                                    )}

                                    {/* Type Badge */}
                                    <div className="absolute top-4 left-4">
                                        <span className="px-3 py-1 bg-zg-accent/90 text-black text-xs font-bold rounded-full backdrop-blur-sm">
                                            {product.type === 'frame' ? 'Frame' : 'Album'}
                                        </span>
                                    </div>

                                    {/* Hover Overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                                        <button
                                            onClick={() => navigate(`/shop/${product._id}`)}
                                            className="w-full py-3 bg-zg-accent text-black font-bold rounded-lg transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300"
                                        >
                                            View Details
                                        </button>
                                    </div>
                                </div>

                                <div className="p-6">
                                    <h3 className="text-xl font-heading font-bold mb-2">{product.name}</h3>
                                    <p className="text-zg-secondary text-sm line-clamp-2 mb-4">{product.description}</p>

                                    {/* Price */}
                                    {product.price > 0 && (
                                        <div className="flex items-center justify-between">
                                            <span className="text-2xl font-bold text-zg-accent">
                                                ₹{product.price}
                                            </span>
                                            {product.type === 'frame' && product.stock > 0 ? (
                                                <span className="text-xs text-green-400">In Stock</span>
                                            ) : product.type === 'frame' && product.stock === 0 ? (
                                                <span className="text-xs text-red-400">Out of Stock</span>
                                            ) : (
                                                <span className="text-xs text-blue-400">Digital</span>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default Shop;
