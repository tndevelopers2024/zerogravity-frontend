import React, { useState, useRef } from 'react';
import { X, ChevronLeft, ChevronRight, Upload, Trash2, Eye, Palette, Type, Calendar as CalendarIcon, Sparkles, Image as ImageIcon, Grid, Layout, Layers, Maximize2, Minimize2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import HTMLFlipBook from 'react-pageflip';
import { uploadImageApi } from '../utils/Api';

const EAlbumCustomizer = ({ product, onSave, onClose }) => {
    const [showPreview, setShowPreview] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [isGridView, setIsGridView] = useState(true);
    const flipBookRef = useRef();
    const totalPages = product.pageCount || 20;

    const [customization, setCustomization] = useState({
        coverDesign: {
            title: '',
            template: 'template1',
            font: 'whimsical',
            date: new Date().toISOString().split('T')[0],
            color: 'blue'
        },
        pages: Array.from({ length: totalPages }, (_, i) => ({
            pageNumber: i + 1,
            images: [],
            layout: 'single'
        }))
    });

    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0 });
    const [dragActive, setDragActive] = useState(false);
    const [draggedImage, setDraggedImage] = useState(null);

    // Enhanced color palette with gradients
    const colors = [
        { id: 'blue', name: 'Ocean Blue', gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
        { id: 'pink', name: 'Sunset Pink', gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
        { id: 'purple', name: 'Royal Purple', gradient: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)' },
        { id: 'green', name: 'Forest Green', gradient: 'linear-gradient(135deg, #d299c2 0%, #fef9d7 100%)' },
        { id: 'orange', name: 'Warm Orange', gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' },
        { id: 'teal', name: 'Ocean Teal', gradient: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)' },
        { id: 'gold', name: 'Golden Hour', gradient: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)' },
        { id: 'lavender', name: 'Lavender Dream', gradient: 'linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)' },
    ];

    const fonts = [
        { id: 'whimsical', name: 'Whimsical', style: { fontFamily: 'cursive', fontWeight: '400' }, preview: 'Aa' },
        { id: 'vintage', name: 'Vintage', style: { fontFamily: 'serif', fontWeight: '600' }, preview: 'Aa' },
        { id: 'enchanted', name: 'Enchanted', style: { fontFamily: 'fantasy', fontWeight: '500' }, preview: 'Aa' },
        { id: 'modern', name: 'Modern', style: { fontFamily: 'system-ui', fontWeight: '700' }, preview: 'Aa' },
        { id: 'elegant', name: 'Elegant', style: { fontFamily: 'Georgia', fontWeight: '300', fontStyle: 'italic' }, preview: 'Aa' },
    ];

    const pageLayouts = [
        { id: 'single', name: 'Single', icon: '□', description: 'One large photo' },
        { id: 'double', name: 'Double', icon: '▭▭', description: 'Two photos side by side' },
        { id: 'grid', name: 'Grid', icon: '⊞', description: 'Multiple photos in grid' },
        { id: 'collage', name: 'Collage', icon: '⊡', description: 'Artistic arrangement' },
    ];

    const handleBulkUpload = async (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        setUploading(true);
        setUploadProgress({ current: 0, total: files.length });
        try {
            const uploadedUrls = [];
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                const formData = new FormData();
                formData.append('image', file);
                const res = await uploadImageApi(formData);
                uploadedUrls.push(res.data.url);
                setUploadProgress({ current: i + 1, total: files.length });
            }

            // Distribute images across pages
            setCustomization(prev => {
                const newPages = [...prev.pages];
                let currentImageIndex = 0;

                const getMaxImages = (layout) => {
                    if (layout === 'single') return 1;
                    if (layout === 'double') return 2;
                    if (layout === 'grid') return 4;
                    return 6;
                };

                for (let i = 0; i < newPages.length; i++) {
                    if (currentImageIndex >= uploadedUrls.length) break;

                    const page = newPages[i];
                    const maxImages = getMaxImages(page.layout);
                    const remainingSlots = maxImages - page.images.length;

                    if (remainingSlots > 0) {
                        const imagesToAdd = uploadedUrls.slice(currentImageIndex, currentImageIndex + remainingSlots);
                        page.images = [...page.images, ...imagesToAdd];
                        currentImageIndex += imagesToAdd.length;
                    }
                }

                return { ...prev, pages: newPages };
            });

        } catch (error) {
            console.error('Upload error:', error);
            alert('Failed to upload images');
        } finally {
            setUploading(false);
            setUploadProgress({ current: 0, total: 0 });
        }
    };

    const handleDragStart = (e, pageIndex, imageIndex, imageUrl) => {
        setDraggedImage({ pageIndex, imageIndex, imageUrl });
        // Required for Firefox
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', JSON.stringify({ pageIndex, imageIndex, imageUrl }));
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
        e.dataTransfer.dropEffect = 'move';
        setDragActive(true);
    };

    const handleDropOnPage = async (e, targetPageIndex) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        // Handle internal drag (move image)
        if (draggedImage) {
            const { pageIndex: sourcePageIndex, imageIndex: sourceImageIndex, imageUrl } = draggedImage;

            if (sourcePageIndex === targetPageIndex) {
                setDraggedImage(null);
                return;
            }

            setCustomization(prev => {
                const newPages = [...prev.pages];

                // Remove from source
                newPages[sourcePageIndex].images = newPages[sourcePageIndex].images.filter((_, i) => i !== sourceImageIndex);

                // Add to target
                newPages[targetPageIndex].images = [...newPages[targetPageIndex].images, imageUrl];

                return { ...prev, pages: newPages };
            });

            setDraggedImage(null);
            return;
        }

        // Handle file drop (upload)
        const files = Array.from(e.dataTransfer.files).filter(file => file.type.startsWith('image/'));
        if (files.length > 0) {
            setUploading(true);
            setUploadProgress({ current: 0, total: files.length });
            try {
                const uploadedUrls = [];
                for (let i = 0; i < files.length; i++) {
                    const file = files[i];
                    const formData = new FormData();
                    formData.append('image', file);
                    const res = await uploadImageApi(formData);
                    uploadedUrls.push(res.data.url);
                    setUploadProgress({ current: i + 1, total: files.length });
                }

                setCustomization(prev => ({
                    ...prev,
                    pages: prev.pages.map((page, idx) =>
                        idx === targetPageIndex
                            ? { ...page, images: [...page.images, ...uploadedUrls] }
                            : page
                    )
                }));
            } catch (error) {
                console.error('Upload error:', error);
            } finally {
                setUploading(false);
                setUploadProgress({ current: 0, total: 0 });
            }
        }
    };

    const removePageImage = (pageNumber, imageIndex) => {
        setCustomization(prev => ({
            ...prev,
            pages: prev.pages.map(page =>
                page.pageNumber === pageNumber
                    ? { ...page, images: page.images.filter((_, idx) => idx !== imageIndex) }
                    : page
            )
        }));
    };

    const setPageLayout = (pageNumber, layout) => {
        setCustomization(prev => ({
            ...prev,
            pages: prev.pages.map(page =>
                page.pageNumber === pageNumber
                    ? { ...page, layout }
                    : page
            )
        }));
    };

    const setGlobalLayout = (layout) => {
        if (window.confirm(`Apply ${layout} layout to all pages?`)) {
            setCustomization(prev => ({
                ...prev,
                pages: prev.pages.map(page => ({ ...page, layout }))
            }));
        }
    };

    const handleSave = async () => {
        if (!customization.coverDesign.title.trim()) {
            alert('Please enter a title for your e-album');
            return;
        }

        setUploading(true);
        try {
            // Create a JSON file of the customization
            const jsonString = JSON.stringify(customization, null, 2);
            const blob = new Blob([jsonString], { type: 'application/json' });
            const file = new File([blob], `ealbum-preview-${Date.now()}.json`, { type: 'application/json' });

            const formData = new FormData();
            formData.append('image', file); // Using existing upload endpoint which likely handles files generally

            const res = await uploadImageApi(formData);
            const previewFileUrl = res.data.url;

            onSave({
                ...customization,
                previewFileUrl
            });
            onClose();
        } catch (error) {
            console.error('Error saving preview file:', error);
            alert('Failed to save album configuration. Please try again.');
        } finally {
            setUploading(false);
        }
    };

    const PageComponent = React.forwardRef(({ children, pageNumber }, ref) => (
        <div ref={ref} className="bg-white shadow-lg w-full h-full overflow-hidden border-r border-gray-200">
            {children}
        </div>
    ));

    const renderCoverPage = () => {
        const selectedColor = colors.find(c => c.id === customization.coverDesign.color);
        const selectedFont = fonts.find(f => f.id === customization.coverDesign.font);

        return (
            <div
                className="w-full h-full flex flex-col items-center justify-center p-8 text-center relative overflow-hidden"
                style={{ background: selectedColor?.gradient }}
            >
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full -translate-x-1/2 -translate-y-1/2"></div>
                    <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full translate-x-1/2 translate-y-1/2"></div>
                </div>
                <div className="relative z-10">
                    <h1
                        className="text-5xl font-bold mb-6 text-white drop-shadow-lg"
                        style={selectedFont?.style}
                    >
                        {customization.coverDesign.title || 'Your E-Album'}
                    </h1>
                    {customization.coverDesign.date && (
                        <p className="text-white/90 text-xl font-light">
                            {new Date(customization.coverDesign.date).toLocaleDateString('en-US', {
                                month: 'long',
                                day: 'numeric',
                                year: 'numeric'
                            })}
                        </p>
                    )}
                </div>
            </div>
        );
    };

    const renderPage = (page, isPreview = false) => {
        if (page.images.length === 0) {
            return (
                <div
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDropOnPage(e, page.pageNumber - 1)}
                    className={`w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 ${!isPreview ? 'border-2 border-dashed border-gray-200 hover:border-zg-accent/50 transition-colors' : ''}`}
                >
                    <div className="text-center">
                        <ImageIcon className="w-16 h-16 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-400 text-sm">Page {page.pageNumber}</p>
                        {!isPreview && <p className="text-gray-300 text-xs">Drop photos here</p>}
                    </div>
                </div>
            );
        }

        const layoutClass = page.layout === 'single' ? 'grid-cols-1' :
            page.layout === 'double' ? 'grid-cols-2' :
                page.layout === 'grid' ? 'grid-cols-2 grid-rows-2' :
                    'grid-cols-3';

        return (
            <div
                onDragOver={handleDragOver}
                onDrop={(e) => handleDropOnPage(e, page.pageNumber - 1)}
                className="w-full h-full p-6 bg-white"
            >
                <div className={`grid gap-3 h-full ${layoutClass}`}>
                    {page.images.slice(0, page.layout === 'single' ? 1 : page.layout === 'double' ? 2 : 6).map((img, idx) => (
                        <div
                            key={idx}
                            draggable={!isPreview}
                            onDragStart={(e) => handleDragStart(e, page.pageNumber - 1, idx, img)}
                            className="relative overflow-hidden rounded-lg shadow-md group cursor-move"
                        >
                            <img src={img} className="w-full h-full object-cover transition-transform group-hover:scale-105" alt={`Page ${page.pageNumber} Photo ${idx + 1}`} />
                            {!isPreview && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        removePageImage(page.pageNumber, idx);
                                    }}
                                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition shadow-lg"
                                >
                                    <Trash2 className="w-3 h-3" />
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    const selectedColor = colors.find(c => c.id === customization.coverDesign.color);
    const currentPageData = customization.pages[currentPage - 1];

    return (
        <>
            <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-gradient-to-br from-zg-bg to-zg-surface rounded-3xl max-w-7xl w-full max-h-[95vh] overflow-hidden flex flex-col shadow-2xl border border-zg-accent/20"
                >
                    {/* Header */}
                    <div className="relative p-6 border-b border-zg-secondary/10" style={{ background: selectedColor?.gradient }}>
                        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>
                        <div className="relative flex items-center justify-between text-white">
                            <div>
                                <h2 className="text-3xl font-heading font-bold mb-1">Design Your E-Album</h2>
                                <p className="text-white/80 text-sm">Create a beautiful memory book</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <label className="flex items-center gap-2 px-6 py-3 bg-white text-zg-accent font-bold rounded-xl hover:bg-white/90 transition cursor-pointer shadow-lg">
                                    <Upload className="w-5 h-5" />
                                    {uploading ? `Uploading ${uploadProgress.current}/${uploadProgress.total}` : 'Bulk Upload Photos'}
                                    <input
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        className="hidden"
                                        onChange={handleBulkUpload}
                                        disabled={uploading}
                                    />
                                </label>
                                <button
                                    onClick={() => setShowPreview(true)}
                                    className="flex items-center gap-2 px-6 py-3 bg-white/20 backdrop-blur-md text-white rounded-xl hover:bg-white/30 transition border border-white/30"
                                >
                                    <Eye className="w-5 h-5" />
                                    Preview
                                </button>
                                <button onClick={onClose} className="text-white/80 hover:text-white transition p-2">
                                    <X className="w-7 h-7" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-8">
                        <div className="max-w-6xl mx-auto space-y-8">
                            {/* Cover Design Section */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-zg-surface/50 backdrop-blur-xl border border-zg-secondary/10 rounded-2xl p-6"
                            >
                                {/* ... (Keep existing cover design UI) ... */}
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="p-3 bg-zg-accent/10 rounded-xl">
                                        <Palette className="w-6 h-6 text-zg-accent" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-zg-primary">Cover Design</h3>
                                        <p className="text-sm text-zg-secondary">Make a stunning first impression</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    {/* Live Preview */}
                                    <div className="order-2 lg:order-1">
                                        <label className="text-sm font-medium text-zg-secondary mb-3 block">Live Preview</label>
                                        <div className="aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl">
                                            {renderCoverPage()}
                                        </div>
                                    </div>

                                    {/* Settings */}
                                    <div className="order-1 lg:order-2 space-y-5">
                                        {/* Title */}
                                        <div>
                                            <label className="text-sm font-medium text-zg-secondary mb-2 flex items-center gap-2">
                                                <Type className="w-4 h-4" />
                                                Album Title <span className="text-xs text-zg-secondary/50">({customization.coverDesign.title.length}/30)</span>
                                            </label>
                                            <input
                                                type="text"
                                                maxLength={30}
                                                value={customization.coverDesign.title}
                                                onChange={(e) => setCustomization(prev => ({
                                                    ...prev,
                                                    coverDesign: { ...prev.coverDesign, title: e.target.value }
                                                }))}
                                                className="w-full px-4 py-3 rounded-xl bg-zg-bg border-2 border-zg-secondary/10 text-zg-primary focus:outline-none focus:border-zg-accent transition text-lg"
                                                placeholder="e.g., Our Wedding Day"
                                            />
                                        </div>

                                        {/* Font */}
                                        <div>
                                            <label className="text-sm font-medium text-zg-secondary mb-3 block">Font Style</label>
                                            <div className="grid grid-cols-3 gap-2">
                                                {fonts.map(font => (
                                                    <button
                                                        key={font.id}
                                                        onClick={() => setCustomization(prev => ({
                                                            ...prev,
                                                            coverDesign: { ...prev.coverDesign, font: font.id }
                                                        }))}
                                                        className={`p-4 rounded-xl border-2 transition-all ${customization.coverDesign.font === font.id
                                                            ? 'border-zg-accent bg-zg-accent/10 scale-105'
                                                            : 'border-zg-secondary/20 hover:border-zg-accent/50'
                                                            }`}
                                                    >
                                                        <div className="text-2xl mb-1" style={font.style}>{font.preview}</div>
                                                        <div className="text-xs text-zg-secondary">{font.name}</div>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Color Theme */}
                                        <div>
                                            <label className="text-sm font-medium text-zg-secondary mb-3 block">Color Theme</label>
                                            <div className="grid grid-cols-4 gap-3">
                                                {colors.map(color => (
                                                    <button
                                                        key={color.id}
                                                        onClick={() => setCustomization(prev => ({
                                                            ...prev,
                                                            coverDesign: { ...prev.coverDesign, color: color.id }
                                                        }))}
                                                        className={`group relative aspect-square rounded-xl overflow-hidden transition-all ${customization.coverDesign.color === color.id
                                                            ? 'ring-4 ring-zg-accent scale-105'
                                                            : 'hover:scale-105'
                                                            }`}
                                                        style={{ background: color.gradient }}
                                                    >
                                                        {customization.coverDesign.color === color.id && (
                                                            <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                                                                <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center">
                                                                    <div className="w-3 h-3 rounded-full bg-zg-accent"></div>
                                                                </div>
                                                            </div>
                                                        )}
                                                        <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[10px] py-1 px-2 opacity-0 group-hover:opacity-100 transition">
                                                            {color.name}
                                                        </div>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Date */}
                                        <div>
                                            <label className="text-sm font-medium text-zg-secondary mb-2 flex items-center gap-2">
                                                <CalendarIcon className="w-4 h-4" />
                                                Date
                                            </label>
                                            <input
                                                type="date"
                                                value={customization.coverDesign.date}
                                                onChange={(e) => setCustomization(prev => ({
                                                    ...prev,
                                                    coverDesign: { ...prev.coverDesign, date: e.target.value }
                                                }))}
                                                className="w-full px-4 py-3 rounded-xl bg-zg-bg border-2 border-zg-secondary/10 text-zg-primary focus:outline-none focus:border-zg-accent transition"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Pages Section */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="bg-zg-surface/50 backdrop-blur-xl border border-zg-secondary/10 rounded-2xl p-6"
                            >
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-3">
                                        <div className="p-3 bg-zg-accent/10 rounded-xl">
                                            <Layers className="w-6 h-6 text-zg-accent" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-zg-primary">Album Pages</h3>
                                            <p className="text-sm text-zg-secondary">Drag and drop photos between pages</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 bg-zg-surface p-1 rounded-xl border border-zg-secondary/10">
                                        <button
                                            onClick={() => setIsGridView(false)}
                                            className={`p-2 rounded-lg transition ${!isGridView ? 'bg-white shadow text-zg-accent' : 'text-zg-secondary hover:text-zg-primary'}`}
                                            title="Single Page View"
                                        >
                                            <Maximize2 className="w-5 h-5" />
                                        </button>
                                        <button
                                            onClick={() => setIsGridView(true)}
                                            className={`p-2 rounded-lg transition ${isGridView ? 'bg-white shadow text-zg-accent' : 'text-zg-secondary hover:text-zg-primary'}`}
                                            title="Grid View (Manage All Pages)"
                                        >
                                            <Grid className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>

                                {!isGridView ? (
                                    // Single Page View
                                    <>
                                        <div className="flex items-center justify-between mb-6">
                                            <div className="flex items-center gap-3">
                                                <button
                                                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                                                    disabled={currentPage === 1}
                                                    className="p-3 rounded-xl bg-zg-bg border border-zg-secondary/10 hover:border-zg-accent transition disabled:opacity-30 disabled:cursor-not-allowed"
                                                >
                                                    <ChevronLeft className="w-5 h-5" />
                                                </button>
                                                <div className="text-center px-4">
                                                    <div className="text-2xl font-bold text-zg-accent">{currentPage}</div>
                                                    <div className="text-xs text-zg-secondary">of {totalPages}</div>
                                                </div>
                                                <button
                                                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                                                    disabled={currentPage === totalPages}
                                                    className="p-3 rounded-xl bg-zg-bg border border-zg-secondary/10 hover:border-zg-accent transition disabled:opacity-30 disabled:cursor-not-allowed"
                                                >
                                                    <ChevronRight className="w-5 h-5" />
                                                </button>
                                            </div>

                                            {/* Page Layout Selector */}
                                            <div className="flex flex-col items-end gap-2">
                                                <div className="flex gap-2">
                                                    {pageLayouts.map(layout => (
                                                        <button
                                                            key={layout.id}
                                                            onClick={() => setPageLayout(currentPage, layout.id)}
                                                            className={`p-2 rounded-lg border-2 transition-all ${currentPageData?.layout === layout.id
                                                                ? 'border-zg-accent bg-zg-accent/10'
                                                                : 'border-zg-secondary/20 hover:border-zg-accent/50'
                                                                }`}
                                                            title={layout.name}
                                                        >
                                                            <div className="text-xl">{layout.icon}</div>
                                                        </button>
                                                    ))}
                                                </div>
                                                <button
                                                    onClick={() => setGlobalLayout(currentPageData.layout)}
                                                    className="text-xs text-zg-accent hover:text-zg-primary transition-colors flex items-center gap-1"
                                                >
                                                    <Layout className="w-3 h-3" />
                                                    Apply to All Pages
                                                </button>
                                            </div>
                                        </div>

                                        <div className="aspect-[3/2] bg-white rounded-xl shadow-lg overflow-hidden border border-zg-secondary/10">
                                            {renderPage(currentPageData)}
                                        </div>
                                    </>
                                ) : (
                                    // Grid View (All Pages)
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {customization.pages.map((page) => (
                                            <div key={page.pageNumber} className="space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <span className="font-bold text-sm">Page {page.pageNumber}</span>
                                                    <div className="flex gap-1">
                                                        {pageLayouts.map(layout => (
                                                            <button
                                                                key={layout.id}
                                                                onClick={() => setPageLayout(page.pageNumber, layout.id)}
                                                                className={`p-1 rounded border transition-all ${page.layout === layout.id
                                                                    ? 'border-zg-accent bg-zg-accent/10 text-zg-accent'
                                                                    : 'border-zg-secondary/20 text-zg-secondary'
                                                                    }`}
                                                                title={layout.name}
                                                            >
                                                                <div className="text-xs">{layout.icon}</div>
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div className="aspect-[3/2] bg-white rounded-xl shadow overflow-hidden border border-zg-secondary/10">
                                                    {renderPage(page)}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </motion.div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between p-6 border-t border-zg-secondary/10 bg-zg-surface/50">
                        <button
                            onClick={onClose}
                            className="px-6 py-3 rounded-xl border-2 border-zg-secondary/20 text-zg-secondary hover:text-zg-primary hover:border-zg-accent/50 transition font-medium"
                        >
                            Cancel
                        </button>
                        <div className="flex items-center gap-3">
                            <div className="text-sm text-zg-secondary">
                                {customization.pages.filter(p => p.images.length > 0).length} of {totalPages} pages filled
                            </div>
                            <button
                                onClick={handleSave}
                                className="px-8 py-3 rounded-xl bg-gradient-to-r from-zg-accent to-zg-accent/80 text-black font-bold hover:shadow-lg hover:shadow-zg-accent/30 transition-all flex items-center gap-2"
                            >
                                <Sparkles className="w-5 h-5" />
                                Save & Add to Cart
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Preview Modal */}
            <AnimatePresence>
                {showPreview && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/95 z-[60] flex items-center justify-center p-4"
                    >
                        <button
                            onClick={() => setShowPreview(false)}
                            className="absolute top-6 right-6 text-white hover:text-zg-accent transition z-10 p-3 bg-white/10 rounded-full backdrop-blur-md"
                        >
                            <X className="w-8 h-8" />
                        </button>

                        <div className="w-full h-full flex items-center justify-center overflow-hidden">
                            <HTMLFlipBook
                                width={400}
                                height={550}
                                size="stretch"
                                minWidth={300}
                                maxWidth={500}
                                minHeight={400}
                                maxHeight={700}
                                maxShadowOpacity={0.5}
                                showCover={true}
                                mobileScrollSupport={true}
                                className="shadow-2xl"
                                ref={flipBookRef}
                            >
                                <PageComponent pageNumber={0}>
                                    {renderCoverPage()}
                                </PageComponent>

                                {customization.pages.map((page, idx) => (
                                    <PageComponent key={idx} pageNumber={idx + 1}>
                                        {renderPage(page, true)}
                                    </PageComponent>
                                ))}
                            </HTMLFlipBook>
                        </div>

                        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white text-sm bg-white/10 backdrop-blur-md px-6 py-3 rounded-full pointer-events-none">
                            Click or drag corners to flip pages
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default EAlbumCustomizer;
