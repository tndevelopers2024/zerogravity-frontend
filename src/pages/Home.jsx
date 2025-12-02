import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, BookOpen, Frame, ArrowRight, Sparkles, Star, Shield, Truck, Heart, Package, RefreshCw, Award, Image as ImageIcon, Gift } from 'lucide-react';
import { motion } from 'framer-motion';
import { getProductsApi } from '../utils/Api';

const Home = () => {
    const navigate = useNavigate();
    const [featuredProducts, setFeaturedProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchFeaturedProducts();
    }, []);

    const fetchFeaturedProducts = async () => {
        try {
            const response = await getProductsApi();
            // Get first 6 products as featured
            setFeaturedProducts(response.data.data.slice(0, 6));

        } catch (error) {
            console.error('Error fetching products:', error);
        } finally {
            setLoading(false);
        }
    };

    const features = [
        {
            icon: Truck,
            title: 'Free Shipping & Return',
            description: 'Free shipping on all orders above ₹500'
        },
        {
            icon: Shield,
            title: 'Money Back Guarantee',
            description: '100% money back guarantee within 30 days'
        },
        {
            icon: Award,
            title: 'Online Support',
            description: '24/7 customer support for your queries'
        }
    ];

    const categories = [
        {
            name: 'Photo Frames',
            icon: Frame,
            description: 'Customizable photo frames in various sizes',
            gradient: 'from-pink-500/20 to-rose-500/20',
            route: '/shop?type=frame',
            sizes: ['6x4"', '8x6"', '10x8"', '12x8"', '18x12"', '24x18"']
        },
        {
            name: 'E-Albums',
            icon: BookOpen,
            description: 'Digital photo albums with custom designs',
            gradient: 'from-purple-500/20 to-indigo-500/20',
            route: '/shop?type=ealbum',
            features: ['Customizable Cover', 'Multiple Pages', 'High Quality Print']
        }
    ];

    const whyChooseUs = [
        {
            icon: Star,
            title: 'High-Quality Materials',
            description: 'Premium wood, acrylic, and canvas materials for lasting memories'
        },
        {
            icon: Sparkles,
            title: 'Endless Customization',
            description: 'Personalize every detail to match your unique style'
        },
        {
            icon: Gift,
            title: 'Perfect for Gifting',
            description: 'Thoughtful gifts for any occasion - weddings, birthdays, anniversaries'
        },
        {
            icon: Package,
            title: 'Fast, Reliable Delivery',
            description: 'Quick processing and secure packaging for safe delivery'
        }
    ];

    return (
        <div className="min-h-screen bg-zg-bg text-zg-primary">
            {/* Hero Section */}
            <section className="relative overflow-hidden py-20 px-4 bg-gradient-to-br from-zg-bg via-zg-surface/30 to-zg-bg">
                {/* Background Effects */}
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute -top-40 -right-40 w-96 h-96 bg-zg-accent/10 rounded-full blur-3xl"></div>
                    <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-zg-accent/5 rounded-full blur-3xl"></div>
                </div>

                <div className="max-w-7xl mx-auto relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="text-center"
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-zg-accent/10 border border-zg-accent/20 rounded-full mb-6">
                            <Sparkles className="w-4 h-4 text-zg-accent" />
                            <span className="text-sm text-zg-accent font-medium">Customizable Photo Frames & E-Albums</span>
                        </div>

                        <h1 className="text-5xl md:text-7xl font-heading font-bold mb-6 bg-gradient-to-r from-zg-primary via-zg-accent to-zg-primary bg-clip-text text-transparent">
                            Preserve Your Memories<br />in Style
                        </h1>

                        <p className="text-xl md:text-2xl text-zg-secondary mb-8 max-w-3xl mx-auto">
                            Discover premium customizable frames and e-albums to capture and cherish your special moments forever
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                            <button
                                onClick={() => navigate('/shop')}
                                className="group px-8 py-4 bg-zg-accent text-white font-bold rounded-xl hover:bg-zg-accent/90 transition-all shadow-lg shadow-zg-accent/30 flex items-center gap-2"
                            >
                                <ShoppingBag className="w-5 h-5" />
                                <span>Shop Now</span>
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </button>

                            <button
                                onClick={() => navigate('/shop')}
                                className="px-8 py-4 bg-zg-surface border border-zg-secondary/10 text-zg-primary font-bold rounded-xl hover:border-zg-accent/50 transition-all"
                            >
                                Explore Products
                            </button>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Features Bar */}
            <section className="py-8 px-4 bg-zg-surface/50 border-y border-zg-secondary/10">
                <div className="max-w-7xl mx-auto">
                    <div className="grid md:grid-cols-3 gap-8">
                        {features.map((feature, index) => (
                            <motion.div
                                key={feature.title}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6, delay: index * 0.1 }}
                                className="flex items-center gap-4"
                            >
                                <div className="w-12 h-12 bg-zg-accent/10 rounded-xl flex items-center justify-center flex-shrink-0">
                                    <feature.icon className="w-6 h-6 text-zg-accent" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-zg-primary">{feature.title}</h3>
                                    <p className="text-sm text-zg-secondary">{feature.description}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Featured Products */}
            <section className="py-20 px-4">
                <div className="max-w-7xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="text-center mb-12"
                    >
                        <h2 className="text-4xl md:text-5xl font-heading font-bold mb-4">
                            Our Best Sellers
                        </h2>
                        <p className="text-zg-secondary text-lg">
                            Handpicked favorites from our collection
                        </p>
                    </motion.div>

                    {loading ? (
                        <div className="grid md:grid-cols-3 gap-8">
                            {[1, 2, 3, 4, 5, 6].map((i) => (
                                <div key={i} className="bg-zg-surface/50 rounded-2xl p-4 animate-pulse">
                                    <div className="aspect-square bg-zg-secondary/10 rounded-xl mb-4"></div>
                                    <div className="h-4 bg-zg-secondary/10 rounded mb-2"></div>
                                    <div className="h-4 bg-zg-secondary/10 rounded w-2/3"></div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="grid md:grid-cols-3 gap-8">
                            {featuredProducts.map((product, index) => (
                                <motion.div
                                    key={product._id}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.6, delay: index * 0.1 }}
                                    onClick={() => navigate(`/product/${product._id}`)}
                                    className="group cursor-pointer bg-zg-surface/50 backdrop-blur-xl border border-zg-secondary/10 rounded-2xl overflow-hidden hover:border-zg-accent/50 transition-all duration-300 hover:shadow-xl hover:shadow-zg-accent/10"
                                >
                                    <div className="aspect-square relative overflow-hidden bg-zg-secondary/5">
                                        {product.coverImage ? (
                                            <img
                                                src={product.coverImage}
                                                alt={product.name}
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <ImageIcon className="w-16 h-16 text-zg-secondary/20" />
                                            </div>
                                        )}
                                        <div className="absolute top-3 right-3">
                                            <div className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-zg-accent/90 hover:text-white transition-colors">
                                                <Heart className="w-5 h-5" />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="p-6">
                                        <div className="text-xs text-zg-accent font-medium mb-2">
                                            {product.type === 'frame' ? 'Photo Frame' : 'E-Album'}
                                        </div>
                                        <h3 className="font-bold text-lg mb-2 line-clamp-1">{product.name}</h3>
                                        <p className="text-sm text-zg-secondary mb-4 line-clamp-2">{product.description}</p>
                                        <div className="flex items-center justify-between">
                                            <span className="text-2xl font-bold text-zg-accent">₹{product.price}</span>
                                            <button className="px-4 py-2 bg-zg-accent/10 text-zg-accent rounded-lg hover:bg-zg-accent hover:text-white transition-colors font-medium">
                                                View Details
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}

                    <div className="text-center mt-12">
                        <button
                            onClick={() => navigate('/shop')}
                            className="px-8 py-4 bg-zg-accent text-white font-bold rounded-xl hover:bg-zg-accent/90 transition-all shadow-lg shadow-zg-accent/30"
                        >
                            View All Products
                        </button>
                    </div>
                </div>
            </section>

            {/* Categories Section */}
            <section className="py-20 px-4 bg-zg-surface/30">
                <div className="max-w-7xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="text-center mb-12"
                    >
                        <h2 className="text-4xl md:text-5xl font-heading font-bold mb-4">
                            Our Collections
                        </h2>
                        <p className="text-zg-secondary text-lg">
                            Choose from our curated collection of frames and albums
                        </p>
                    </motion.div>

                    <div className="grid md:grid-cols-2 gap-8">
                        {categories.map((category, index) => (
                            <motion.div
                                key={category.name}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6, delay: index * 0.1 }}
                                onClick={() => navigate(category.route)}
                                className="group relative overflow-hidden bg-white border border-zg-secondary/10 rounded-2xl p-8 cursor-pointer hover:border-zg-accent/50 transition-all duration-300 hover:shadow-xl"
                            >
                                <div className={`absolute inset-0 bg-gradient-to-br ${category.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>

                                <div className="relative z-10">
                                    <div className="w-16 h-16 bg-zg-accent/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                                        <category.icon className="w-8 h-8 text-zg-accent" />
                                    </div>

                                    <h3 className="text-2xl font-heading font-bold mb-2">
                                        {category.name}
                                    </h3>

                                    <p className="text-zg-secondary mb-6">
                                        {category.description}
                                    </p>

                                    {category.sizes && (
                                        <div className="flex flex-wrap gap-2 mb-6">
                                            {category.sizes.map((size) => (
                                                <span key={size} className="px-3 py-1 bg-zg-surface text-xs font-medium rounded-full">
                                                    {size}
                                                </span>
                                            ))}
                                        </div>
                                    )}

                                    {category.features && (
                                        <div className="space-y-2 mb-6">
                                            {category.features.map((feature) => (
                                                <div key={feature} className="flex items-center gap-2 text-sm text-zg-secondary">
                                                    <div className="w-1.5 h-1.5 bg-zg-accent rounded-full"></div>
                                                    {feature}
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    <div className="flex items-center gap-2 text-zg-accent font-medium">
                                        <span>Explore {category.name}</span>
                                        <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Why Choose Us */}
            <section className="py-20 px-4">
                <div className="max-w-7xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="text-center mb-12"
                    >
                        <h2 className="text-4xl md:text-5xl font-heading font-bold mb-4">
                            Why Choose Zerogravity?
                        </h2>
                        <p className="text-zg-secondary text-lg">
                            We're committed to delivering excellence in every frame
                        </p>
                    </motion.div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {whyChooseUs.map((item, index) => (
                            <motion.div
                                key={item.title}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6, delay: index * 0.1 }}
                                className="text-center p-6 bg-zg-surface/50 rounded-2xl border border-zg-secondary/10 hover:border-zg-accent/50 transition-all"
                            >
                                <div className="w-16 h-16 bg-zg-accent/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                    <item.icon className="w-8 h-8 text-zg-accent" />
                                </div>

                                <h3 className="text-lg font-heading font-bold mb-2">
                                    {item.title}
                                </h3>

                                <p className="text-sm text-zg-secondary">
                                    {item.description}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 px-4">
                <div className="max-w-4xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="relative overflow-hidden bg-gradient-to-r from-zg-accent/10 to-purple-500/10 border border-zg-accent/20 rounded-3xl p-12 text-center"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-zg-accent/5 to-purple-500/5 blur-3xl"></div>

                        <div className="relative z-10">
                            <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">
                                Ready to Create Your Masterpiece?
                            </h2>

                            <p className="text-zg-secondary text-lg mb-8">
                                Start customizing your frames and albums today
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <button
                                    onClick={() => navigate('/shop')}
                                    className="px-8 py-4 bg-zg-accent text-white font-bold rounded-xl hover:bg-zg-accent/90 transition-all shadow-lg shadow-zg-accent/30"
                                >
                                    Start Shopping
                                </button>

                                <button
                                    onClick={() => navigate('/contact')}
                                    className="px-8 py-4 bg-white border border-zg-secondary/10 text-zg-primary font-bold rounded-xl hover:border-zg-accent/50 transition-all"
                                >
                                    Contact Us
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>
        </div>
    );
};

export default Home;
