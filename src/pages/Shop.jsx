import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search, Filter, X, ChevronDown, ChevronUp, Menu } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getProductsApi } from '../utils/Api';

const Shop = () => {
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [priceRange, setPriceRange] = useState([0, 10000]);
    const [sortBy, setSortBy] = useState('popularity');
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [categoryExpanded, setCategoryExpanded] = useState(true);
    const [priceExpanded, setPriceExpanded] = useState(true);
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    useEffect(() => {
        fetchProducts();
    }, [searchParams]);

    useEffect(() => {
        filterProducts();
    }, [products, selectedCategory, searchQuery, priceRange, sortBy]);

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

        if (selectedCategory !== 'all') {
            filtered = filtered.filter(p => p.category === selectedCategory);
        }

        if (searchQuery) {
            filtered = filtered.filter(p =>
                p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                p.description.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        filtered = filtered.filter(p => p.price >= priceRange[0] && p.price <= priceRange[1]);

        switch (sortBy) {
            case 'price-low':
                filtered.sort((a, b) => a.price - b.price);
                break;
            case 'price-high':
                filtered.sort((a, b) => b.price - a.price);
                break;
            case 'name':
                filtered.sort((a, b) => a.name.localeCompare(b.name));
                break;
            default:
                break;
        }

        setFilteredProducts(filtered);
    };

    const categories = ['all', ...new Set(products.map(p => p.category).filter(Boolean))];
    const maxPrice = Math.max(...products.map(p => p.price), 10000);

    const getAppliedFilters = () => {
        const filters = [];
        if (selectedCategory !== 'all') {
            filters.push({ type: 'category', value: selectedCategory, label: selectedCategory.toUpperCase() });
        }
        if (priceRange[1] < maxPrice) {
            filters.push({ type: 'price', value: priceRange, label: `₹${priceRange[0]} - ₹${priceRange[1]}` });
        }
        return filters;
    };

    const removeFilter = (filterType) => {
        if (filterType === 'category') {
            setSelectedCategory('all');
        } else if (filterType === 'price') {
            setPriceRange([0, maxPrice]);
        }
    };

    const clearAllFilters = () => {
        setSelectedCategory('all');
        setSearchQuery('');
        setPriceRange([0, maxPrice]);
    };

    const appliedFilters = getAppliedFilters();

    return (
        <div className="min-h-screen bg-white">
            {/* Promotional Banner */}
            <div className="relative bg-gradient-to-r from-gray-100 to-gray-200 overflow-hidden">
                <div className="custom-container mx-auto px-4 md:px-8 py-12 md:py-16">
                    <div className="flex flex-col md:flex-row items-center justify-between">
                        <div className="max-w-xl mb-6 md:mb-0">
                            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">
                                20% OFF ONLY TODAY AND<br />GET SPECIAL GIFT!
                            </h2>
                            <p className="text-gray-700 text-sm md:text-base">
                                Today only, enjoy a stylish 20% off and receive an exclusive gift!<br />
                                Elevate your wardrobe now!
                            </p>
                        </div>
                        <div className="w-64 h-64 bg-gray-300 rounded-full opacity-20 absolute -right-20 -top-10"></div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="custom-container mx-auto px-4 md:px-8 py-8">
                <div className="flex gap-8">
                    {/* Mobile Filter Toggle */}
                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="lg:hidden fixed bottom-6 right-6 z-50 p-4 bg-black text-white rounded-full shadow-2xl hover:scale-110 transition-transform"
                    >
                        <Menu className="w-6 h-6" />
                    </button>

                    {/* Sidebar */}
                    <AnimatePresence>
                        {(sidebarOpen || window.innerWidth >= 1024) && (
                            <motion.aside
                                initial={{ x: -300, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                exit={{ x: -300, opacity: 0 }}
                                className="fixed lg:static top-0 left-0 h-screen lg:h-auto w-72 bg-white border-r border-gray-200 lg:border-none p-6 overflow-y-auto z-50 shadow-2xl lg:shadow-none"
                            >
                                {/* Sidebar Header */}
                                <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
                                    <h2 className="text-xl font-bold text-gray-900">Filter Products</h2>
                                    <button
                                        onClick={() => setSidebarOpen(false)}
                                        className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>

                                {/* Category Filter */}
                                <div className="mb-6 pb-6 border-b border-gray-200">
                                    <button
                                        onClick={() => setCategoryExpanded(!categoryExpanded)}
                                        className="flex items-center justify-between w-full mb-4"
                                    >
                                        <h3 className="font-bold text-gray-900">Category</h3>
                                        {categoryExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                    </button>

                                    {categoryExpanded && (
                                        <div className="space-y-3">
                                            {categories.map((category) => (
                                                <label key={category} className="flex items-center cursor-pointer group">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedCategory === category}
                                                        onChange={() => setSelectedCategory(category)}
                                                        className="w-4 h-4 rounded border-gray-300 text-black focus:ring-black cursor-pointer"
                                                    />
                                                    <span className="ml-3 text-sm text-gray-700 group-hover:text-black capitalize">
                                                        {category === 'all' ? 'All Albums' : category}
                                                    </span>
                                                    <span className="ml-auto text-xs text-gray-400">
                                                        {category === 'all' ? products.length : products.filter(p => p.category === category).length}
                                                    </span>
                                                </label>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Price Filter */}
                                <div className="mb-6">
                                    <button
                                        onClick={() => setPriceExpanded(!priceExpanded)}
                                        className="flex items-center justify-between w-full mb-4"
                                    >
                                        <h3 className="font-bold text-gray-900">Price</h3>
                                        {priceExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                    </button>

                                    {priceExpanded && (
                                        <div className="space-y-4">
                                            <input
                                                type="range"
                                                min="0"
                                                max={maxPrice}
                                                value={priceRange[1]}
                                                onChange={(e) => setPriceRange([0, parseInt(e.target.value)])}
                                                className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-black"
                                            />
                                            <div className="flex items-center justify-between gap-2">
                                                <div className="flex-1">
                                                    <label className="text-xs text-gray-500 mb-1 block">From</label>
                                                    <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded text-sm text-gray-900">
                                                        ₹{priceRange[0]}
                                                    </div>
                                                </div>
                                                <div className="text-gray-400 mt-5">—</div>
                                                <div className="flex-1">
                                                    <label className="text-xs text-gray-500 mb-1 block">To</label>
                                                    <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded text-sm text-gray-900">
                                                        ₹{priceRange[1]}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </motion.aside>
                        )}
                    </AnimatePresence>

                    {/* Main Content */}
                    <main className="flex-1">
                        {/* Results Info & Filters */}
                        <div className="mb-6">
                            <div className="flex items-center justify-between mb-4">
                                <p className="text-sm text-gray-600">
                                    Showing <span className="font-semibold">{filteredProducts.length}</span> results from total{' '}
                                    <span className="font-semibold">{products.length}</span> for{' '}
                                    <span className="font-semibold">"{selectedCategory === 'all' ? 'All Albums' : selectedCategory}"</span>
                                </p>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-gray-600">Sort by</span>
                                    <select
                                        value={sortBy}
                                        onChange={(e) => setSortBy(e.target.value)}
                                        className="px-4 py-2 bg-white border border-gray-300 rounded-full text-sm text-gray-900 focus:outline-none focus:border-black cursor-pointer"
                                    >
                                        <option value="popularity">Popularity</option>
                                        <option value="price-low">Price: Low to High</option>
                                        <option value="price-high">Price: High to Low</option>
                                        <option value="name">Name: A to Z</option>
                                    </select>
                                </div>
                            </div>

                            {/* Applied Filters */}
                            {appliedFilters.length > 0 && (
                                <div className="flex items-center gap-2 flex-wrap">
                                    <span className="text-sm text-gray-600">Applied Filters:</span>
                                    {appliedFilters.map((filter, index) => (
                                        <span
                                            key={index}
                                            className="inline-flex items-center gap-2 px-3 py-1 bg-gray-100 border border-gray-300 rounded-full text-sm"
                                        >
                                            {filter.label}
                                            <button
                                                onClick={() => removeFilter(filter.type)}
                                                className="hover:bg-gray-200 rounded-full p-0.5 transition-colors"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Products Grid */}
                        {loading ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {[1, 2, 3, 4, 5, 6].map((n) => (
                                    <div key={n} className="aspect-[3/4] bg-gray-100 rounded-lg animate-pulse"></div>
                                ))}
                            </div>
                        ) : filteredProducts.length === 0 ? (
                            <div className="text-center py-20">
                                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Filter className="w-8 h-8 text-gray-400" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">No products found</h3>
                                <p className="text-gray-600 mb-6">Try adjusting your filters</p>
                                <button
                                    onClick={clearAllFilters}
                                    className="px-6 py-2 bg-black text-white rounded-full hover:bg-gray-800 transition-colors"
                                >
                                    Clear All Filters
                                </button>
                            </div>
                        ) : (
                            <motion.div
                                layout
                                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                            >
                                <AnimatePresence>
                                    {filteredProducts.map((product, index) => (
                                        <motion.div
                                            layout
                                            key={product._id}
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            transition={{ duration: 0.2, delay: index * 0.02 }}
                                            onClick={() => navigate(`/shop/${product._id}`)}
                                            className="group cursor-pointer"
                                        >
                                            {/* Product Image */}
                                            <div className="aspect-[3/4] bg-gray-100 rounded-2xl overflow-hidden mb-4 relative">
                                                {product.coverImage ? (
                                                    <img
                                                        src={product.coverImage}
                                                        alt={product.name}
                                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center bg-gray-200">
                                                        <span className="text-gray-400 text-sm">No Image</span>
                                                    </div>
                                                )}
                                                {product.category && (
                                                    <span className="absolute top-3 left-3 px-3 py-1 bg-white text-xs font-medium rounded-full">
                                                        {product.category}
                                                    </span>
                                                )}
                                            </div>

                                            {/* Product Info */}
                                            <div>
                                                <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-gray-600 transition-colors">
                                                    {product.name}
                                                </h3>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-lg font-bold text-gray-900">₹{product.price}</span>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </motion.div>
                        )}
                    </main>
                </div>
            </div>

            {/* Mobile Overlay */}
            {sidebarOpen && (
                <div
                    onClick={() => setSidebarOpen(false)}
                    className="lg:hidden fixed inset-0 bg-black/50 z-40"
                />
            )}
        </div>
    );
};

export default Shop;
