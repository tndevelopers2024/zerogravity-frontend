import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShoppingCart, Heart, ArrowLeft, Check, Star, Upload, X, Image as ImageIcon, ChevronRight, Shield, Truck, RotateCcw, Share2, ZoomIn, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getProductByIdApi, addToCartApi, uploadImageApi } from '../utils/Api';
import { useAuth } from '../context/AuthContext';
import EAlbumCustomizer from '../components/EAlbumCustomizer';

const ProductDetails = () => {
    const { productId } = useParams();
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);

    const [selectedFormat, setSelectedFormat] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [addingToCart, setAddingToCart] = useState(false);
    const [uploadedImages, setUploadedImages] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [showCustomizer, setShowCustomizer] = useState(false);
    const [ealbumCustomization, setEalbumCustomization] = useState(null);
    const [activeTab, setActiveTab] = useState('description');
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isZoomed, setIsZoomed] = useState(false);

    const handleImageUpload = async (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        const limit = product.customization?.imageCount || 0;
        if (uploadedImages.length + files.length > limit) {
            alert(`You can only upload up to ${limit} images.`);
            return;
        }

        setUploading(true);
        try {
            const newImages = [];
            for (const file of files) {
                const fd = new FormData();
                fd.append("image", file);
                const res = await uploadImageApi(fd);
                newImages.push(res.data.url);
            }
            setUploadedImages(prev => [...prev, ...newImages]);
        } catch (error) {
            console.error("Upload failed:", error);
            alert("Failed to upload image");
        }
        setUploading(false);
    };

    const removeUploadedImage = (index) => {
        setUploadedImages(prev => prev.filter((_, i) => i !== index));
    };

    useEffect(() => {
        fetchProduct();
    }, [productId]);

    const fetchProduct = async () => {
        try {
            const response = await getProductByIdApi(productId);
            const data = response.data;
            setProduct(data);

            if (data.type === 'ealbum' && data.formats?.length > 0) {
                setSelectedFormat(data.formats[0]);
            }
        } catch (error) {
            console.error('Error fetching product:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddToCart = async () => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }

        setAddingToCart(true);
        try {
            const cartItem = {
                productId: product._id,
                quantity,
            };



            if (product.type === 'ealbum' && selectedFormat) {
                cartItem.selectedFormat = selectedFormat;
            }

            if (product.customization?.allowed && uploadedImages.length > 0) {
                cartItem.customizationImages = uploadedImages;
            }

            if (product.type === 'ealbum' && ealbumCustomization) {
                cartItem.ealbumCustomization = ealbumCustomization;
                if (ealbumCustomization.selectedSize) cartItem.selectedSize = ealbumCustomization.selectedSize;
                if (ealbumCustomization.selectedSheetOption) cartItem.selectedSheetOption = ealbumCustomization.selectedSheetOption;
            }

            await addToCartApi(cartItem);
            alert('Added to cart successfully!');
            navigate('/cart');
        } catch (error) {
            console.error('Error adding to cart:', error);
            alert(error.response?.data?.message || 'Failed to add to cart');
        } finally {
            setAddingToCart(false);
        }
    };

    const getCurrentPrice = () => {
        let price = product.price;
        if (ealbumCustomization?.selectedSheetOption?.price) {
            price += ealbumCustomization.selectedSheetOption.price;
        }
        return price;
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-zg-bg flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-zg-accent"></div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="min-h-screen bg-zg-bg flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-zg-primary mb-4">Product not found</h2>
                    <button onClick={() => navigate('/shop')} className="text-zg-accent hover:underline">Back to Shop</button>
                </div>
            </div>
        );
    }

    const allImages = [product.coverImage, ...(product.gallery || [])].filter(Boolean);

    return (
        <>
            <div className="min-h-screen bg-zg-bg text-zg-primary py-8 px-4 md:px-8">
                <div className="custom-container mx-auto">
                    {/* Breadcrumbs */}
                    <nav className="flex items-center gap-2 text-sm text-zg-secondary mb-8">
                        <button onClick={() => navigate('/')} className="hover:text-zg-accent transition">Home</button>
                        <ChevronRight className="w-4 h-4" />
                        <button onClick={() => navigate('/shop')} className="hover:text-zg-accent transition">Shop</button>
                        <ChevronRight className="w-4 h-4" />
                        <span className="text-zg-primary font-medium truncate">{product.name}</span>
                    </nav>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
                        {/* Left Column: Gallery */}
                        <div className="space-y-6">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="relative aspect-square bg-zg-surface/50 rounded-3xl overflow-hidden border border-zg-secondary/10 group"
                            >
                                <img
                                    src={allImages[currentImageIndex]}
                                    alt={product.name}
                                    className={`w-full h-full object-cover transition-transform duration-500 ${isZoomed ? 'scale-150 cursor-zoom-out' : 'cursor-zoom-in'}`}
                                    onClick={() => setIsZoomed(!isZoomed)}
                                />




                                <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button className="p-2 bg-white/10 backdrop-blur-md rounded-full hover:bg-white/20 transition text-white">
                                        <Heart className="w-5 h-5" />
                                    </button>
                                    <button className="p-2 bg-white/10 backdrop-blur-md rounded-full hover:bg-white/20 transition text-white">
                                        <Share2 className="w-5 h-5" />
                                    </button>
                                </div>
                            </motion.div>

                            {/* Thumbnails */}
                            {allImages.length > 1 && (
                                <div className="flex gap-4 overflow-x-auto pb-2 custom-scrollbar">
                                    {allImages.map((img, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => setCurrentImageIndex(idx)}
                                            className={`relative w-24 h-24 flex-shrink-0 rounded-xl overflow-hidden border-2 transition-all ${currentImageIndex === idx ? 'border-zg-accent ring-2 ring-zg-accent/20' : 'border-transparent hover:border-zg-secondary/30'
                                                }`}
                                        >
                                            <img src={img} alt={`View ${idx + 1}`} className="w-full h-full object-cover" />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Right Column: Product Info */}
                        <div className="space-y-8">
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zg-accent/10 text-zg-accent text-xs font-bold uppercase tracking-wider mb-3">
                                            {product.type === 'ealbum' ? 'Digital Album' : 'Album'}
                                        </div>
                                        <h1 className="text-4xl md:text-5xl font-heading font-bold leading-tight mb-2">{product.name}</h1>
                                        <div className="flex items-center gap-4 text-sm text-zg-secondary">
                                            <div className="flex items-center gap-1 text-yellow-400">
                                                <Star className="w-4 h-4 fill-current" />
                                                <span className="font-bold text-white">4.8</span>
                                            </div>
                                            <span>(124 reviews)</span>
                                            <span>•</span>
                                            <span className={product.stock > 0 ? 'text-green-400' : 'text-red-400'}>
                                                {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-3xl font-bold text-zg-accent">₹{getCurrentPrice()}</div>

                                    </div>
                                </div>

                                <p className="text-zg-secondary text-lg leading-relaxed mb-8">
                                    {product.description}
                                </p>

                                {/* Selectors */}
                                {product.type === 'ealbum' && product.formats?.length > 0 && (
                                    <div>
                                        <label className="text-sm font-bold text-zg-primary mb-3 block uppercase tracking-wider">Select Format</label>
                                        <div className="flex flex-wrap gap-3">
                                            {product.formats.map((format) => (
                                                <button
                                                    key={format}
                                                    onClick={() => setSelectedFormat(format)}
                                                    className={`px-4 py-2 rounded-lg border transition-all text-sm font-medium ${selectedFormat === format
                                                        ? 'border-zg-accent bg-zg-accent text-black shadow-lg shadow-zg-accent/20'
                                                        : 'border-zg-secondary/20 hover:border-zg-secondary/50 bg-zg-bg/50'
                                                        }`}
                                                >
                                                    {format}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}


                                {/* Customization Actions */}
                                <div className="space-y-4 mb-8">


                                    {product.type === 'ealbum' && (
                                        <button
                                            onClick={() => setShowCustomizer(true)}
                                            className="w-full py-4 rounded-xl border-2 border-dashed border-zg-accent/50 hover:border-zg-accent hover:bg-zg-accent/5 transition-all flex items-center justify-center gap-3 group"
                                        >
                                            <div className="p-2 bg-zg-accent/10 rounded-lg group-hover:bg-zg-accent group-hover:text-black transition-colors">
                                                <ImageIcon className="w-5 h-5" />
                                            </div>
                                            <div className="text-left">
                                                <div className="font-bold text-zg-primary group-hover:text-zg-accent transition-colors">
                                                    {ealbumCustomization ? 'Edit Album Design' : 'Customize Your Album'}
                                                </div>
                                                <div className="text-xs text-zg-secondary">
                                                    {ealbumCustomization ? 'Design saved' : 'Click to launch design tool'}
                                                </div>
                                            </div>
                                        </button>
                                    )}
                                </div>

                                {/* Action Buttons */}
                                <div className="flex gap-4">
                                    <button
                                        onClick={handleAddToCart}
                                        disabled={addingToCart}
                                        className="flex-1 py-4 bg-zg-accent text-black font-bold rounded-xl hover:bg-zg-accent/90 transition-all shadow-lg shadow-zg-accent/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-lg"
                                    >
                                        <ShoppingCart className="w-5 h-5" />
                                        {addingToCart ? 'Adding...' : 'Add to Cart'}
                                    </button>
                                    <button className="p-4 rounded-xl border border-zg-secondary/20 hover:border-zg-accent/50 hover:text-zg-accent transition-colors">
                                        <Heart className="w-6 h-6" />
                                    </button>
                                </div>

                                {/* Trust Badges */}
                                <div className="grid grid-cols-3 gap-4 pt-8 border-t border-zg-secondary/10">
                                    <div className="text-center">
                                        <div className="w-10 h-10 mx-auto bg-zg-surface rounded-full flex items-center justify-center mb-2">
                                            <Shield className="w-5 h-5 text-zg-accent" />
                                        </div>
                                        <div className="text-xs font-bold">Secure Payment</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="w-10 h-10 mx-auto bg-zg-surface rounded-full flex items-center justify-center mb-2">
                                            <Truck className="w-5 h-5 text-zg-accent" />
                                        </div>
                                        <div className="text-xs font-bold">Fast Delivery</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="w-10 h-10 mx-auto bg-zg-surface rounded-full flex items-center justify-center mb-2">
                                            <RotateCcw className="w-5 h-5 text-zg-accent" />
                                        </div>
                                        <div className="text-xs font-bold">Easy Returns</div>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </div>

                    {/* Tabs Section */}
                    <div className="mt-20">
                        <div className="flex items-center gap-8 border-b border-zg-secondary/10 mb-8 overflow-x-auto">
                            {['description', 'features', 'benefits', 'specifications'].map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`pb-4 text-lg font-bold capitalize transition-all relative ${activeTab === tab ? 'text-zg-accent' : 'text-zg-secondary hover:text-zg-primary'
                                        }`}
                                >
                                    {tab}
                                    {activeTab === tab && (
                                        <motion.div
                                            layoutId="activeTab"
                                            className="absolute bottom-0 left-0 right-0 h-1 bg-zg-accent rounded-t-full"
                                        />
                                    )}
                                </button>
                            ))}
                        </div>

                        <div className="min-h-[200px]">
                            <AnimatePresence mode="wait">
                                {activeTab === 'description' && (
                                    <motion.div
                                        key="desc"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="prose prose-invert max-w-none text-zg-secondary"
                                    >
                                        <p>{product.description}</p>
                                        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
                                    </motion.div>
                                )}
                                {activeTab === 'features' && (
                                    <motion.div
                                        key="feat"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="grid grid-cols-1 md:grid-cols-2 gap-6"
                                    >
                                        {product.features?.map((feature, idx) => (
                                            <div key={idx} className="flex items-start gap-4 p-4 bg-zg-surface/30 rounded-xl border border-zg-secondary/10">
                                                <div className="p-2 bg-zg-accent/10 rounded-lg text-zg-accent">
                                                    <Check className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <h4 className="font-bold mb-1">Feature {idx + 1}</h4>
                                                    <p className="text-sm text-zg-secondary">{feature}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </motion.div>
                                )}
                                {activeTab === 'benefits' && (
                                    <motion.div
                                        key="benefits"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="grid grid-cols-1 md:grid-cols-2 gap-6"
                                    >
                                        {product.benefits && product.benefits.length > 0 ? (
                                            product.benefits.map((benefit, idx) => (
                                                <div key={idx} className="flex items-start gap-4 p-4 bg-zg-surface/30 rounded-xl border border-zg-secondary/10">
                                                    <div className="p-2 bg-zg-accent/10 rounded-lg text-zg-accent">
                                                        <Sparkles className="w-5 h-5" />
                                                    </div>
                                                    <div>
                                                        <h4 className="font-bold mb-1">Benefit {idx + 1}</h4>
                                                        <p className="text-sm text-zg-secondary">{benefit}</p>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="col-span-2 text-center py-8 text-zg-secondary">
                                                No benefits listed for this product.
                                            </div>
                                        )}
                                    </motion.div>
                                )}
                                {activeTab === 'specifications' && (
                                    <motion.div
                                        key="specs"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="bg-zg-surface/30 rounded-2xl overflow-hidden border border-zg-secondary/10"
                                    >
                                        <table className="w-full text-left">
                                            <tbody>
                                                {product.type === 'ealbum' && (
                                                    <>
                                                        <tr className="border-b border-zg-secondary/10">
                                                            <th className="p-4 font-medium text-zg-secondary w-1/3">Author</th>
                                                            <td className="p-4 font-bold">{product.author || 'N/A'}</td>
                                                        </tr>
                                                        <tr className="border-b border-zg-secondary/10">
                                                            <th className="p-4 font-medium text-zg-secondary">Publisher</th>
                                                            <td className="p-4 font-bold">{product.publisher || 'N/A'}</td>
                                                        </tr>
                                                        <tr className="border-b border-zg-secondary/10">
                                                            <th className="p-4 font-medium text-zg-secondary">Pages</th>
                                                            <td className="p-4 font-bold">{product.pageCount || 'N/A'}</td>
                                                        </tr>
                                                    </>
                                                )}
                                                <tr>
                                                    <th className="p-4 font-medium text-zg-secondary">Category</th>
                                                    <td className="p-4 font-bold">{product.category}</td>
                                                </tr>
                                                <tr>
                                                    <th className="p-4 font-medium text-zg-secondary">SKU</th>
                                                    <td className="p-4 font-bold">{product._id.slice(-8).toUpperCase()}</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </div>

            {/* Album Customizer Modal */}
            {
                showCustomizer && product.type === 'ealbum' && (
                    <EAlbumCustomizer
                        product={product}
                        onSave={(customization) => {
                            setEalbumCustomization(customization);
                            setShowCustomizer(false);
                        }}
                        onClose={() => setShowCustomizer(false)}
                    />
                )
            }
        </>
    );
};

export default ProductDetails;
