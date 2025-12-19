import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import DashboardLayout from '../components/layouts/DashboardLayout';
import { ArrowLeft, Save, Upload, X, Image as ImageIcon, Plus, Trash2 } from 'lucide-react';
import {
    getProductByIdApi,
    createProductApi,
    updateProductApi,
    getCategoriesApi,
    uploadImageApi
} from '../utils/Api';

const ProductForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditMode = !!id;

    const [categories, setCategories] = useState([]);

    const [formData, setFormData] = useState({
        type: 'ealbum',
        name: '',
        description: '',
        category: '',
        coverImage: '',
        gallery: [],
        price: '',
        stock: 0,

        formats: [],
        pageCount: '',
        author: '',
        publisher: '',
        isbn: '',
        digitalDownloadUrl: '',
        features: [],
        benefits: [],
        customization: {
            allowed: false,
            imageCount: 0,
            previewArea: { x: 10, y: 10, width: 80, height: 80 }
        },
        albumSizes: [],
        albumSheetOptions: []
    });

    const [loading, setLoading] = useState(false);

    // Load categories
    const fetchCategories = async () => {
        try {
            const res = await getCategoriesApi();
            setCategories(res.data);
        } catch (err) {
            console.error("Category fetch error:", err);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    // Load product if editing
    useEffect(() => {
        if (isEditMode) fetchProduct();
    }, [id]);

    const fetchProduct = async () => {
        try {
            const response = await getProductByIdApi(id);
            const data = response.data;

            setFormData({
                type: data.type,
                name: data.name,
                description: data.description,
                category: data.category,
                coverImage: data.coverImage,
                gallery: data.gallery,
                price: data.price,

                formats: data.formats || [],
                pageCount: data.pageCount || '',
                author: data.author || '',
                publisher: data.publisher || '',
                isbn: data.isbn || '',
                digitalDownloadUrl: data.digitalDownloadUrl || '',

                features: data.features || [],
                benefits: data.benefits || [],
                customization: data.customization || {
                    allowed: false,
                    imageCount: 0,
                    previewArea: { x: 10, y: 10, width: 80, height: 80 }
                },
                albumSizes: data.albumSizes || [],
                albumSheetOptions: data.albumSheetOptions || []
            });
        } catch (error) {
            console.error('Error fetching product:', error);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleListChange = (field, index, value) => {
        const updated = [...formData[field]];
        updated[index] = value;
        setFormData(prev => ({ ...prev, [field]: updated }));
    };

    const addListItem = (field) => {
        setFormData(prev => ({ ...prev, [field]: [...prev[field], ''] }));
    };

    const removeListItem = (field, index) => {
        setFormData(prev => ({
            ...prev,
            [field]: prev[field].filter((_, i) => i !== index)
        }));
    };

    const handleSheetOptionChange = (index, key, value) => {
        const updated = [...formData.albumSheetOptions];
        updated[index] = { ...updated[index], [key]: value };
        setFormData(prev => ({ ...prev, albumSheetOptions: updated }));
    };

    const addSheetOption = () => {
        setFormData(prev => ({
            ...prev,
            albumSheetOptions: [...prev.albumSheetOptions, { name: '', pageCount: 20, price: 0 }]
        }));
    };

    const removeSheetOption = (index) => {
        setFormData(prev => ({
            ...prev,
            albumSheetOptions: prev.albumSheetOptions.filter((_, i) => i !== index)
        }));
    };



    const handleFormatChange = (e) => {
        const { value, checked } = e.target;
        let updated = [...formData.formats];

        if (checked) updated.push(value);
        else updated = updated.filter(v => v !== value);

        setFormData(prev => ({ ...prev, formats: updated }));
    };

    // ---------------------------------------------
    // ✅ Upload Cover Image
    // ---------------------------------------------
    const uploadCover = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const fd = new FormData();
        fd.append("image", file);

        try {
            const res = await uploadImageApi(fd);
            setFormData(prev => ({ ...prev, coverImage: res.data.url }));
        } catch (e) {
            alert("Upload failed");
        }
    };

    // ---------------------------------------------
    // ✅ Upload Gallery Images (multiple)
    // ---------------------------------------------
    const uploadGallery = async (e) => {
        const files = Array.from(e.target.files);
        let uploaded = [];

        for (const file of files) {
            const fd = new FormData();
            fd.append("image", file);

            const res = await uploadImageApi(fd);
            uploaded.push(res.data.url);
        }

        setFormData(prev => ({
            ...prev,
            gallery: [...prev.gallery, ...uploaded]
        }));
    };

    const removeGalleryImage = (url) => {
        setFormData(prev => ({
            ...prev,
            gallery: prev.gallery.filter(img => img !== url)
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const cleanData = {
            ...formData,
            isDigital: formData.type === "ealbum",
            features: formData.features.filter(f => f.trim()),

            formats: formData.formats,
            customization: formData.customization,
            albumSizes: formData.albumSizes.filter(s => s.trim()),
            albumSheetOptions: formData.albumSheetOptions.filter(o => o.name.trim())
        };
        try {
            if (isEditMode) {
                await updateProductApi(id, cleanData);
            } else {
                await createProductApi(cleanData);
            }
            navigate("/admin/products");
        } catch (err) {
            console.error(err);
            alert("Failed to save product");
        }

        setLoading(false);
    };

    return (
        <DashboardLayout title={isEditMode ? "Edit Product" : "Add Product"}>

            {/* Back Button */}
            <button
                onClick={() => navigate("/admin/products")}
                className="flex items-center gap-2 text-zg-secondary hover:text-zg-primary mb-6"
            >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Products</span>
            </button>

            <form onSubmit={handleSubmit} className="custom-container mx-auto space-y-6">

                {/* Product Section */}
                <div className="bg-zg-surface/50 border border-zg-secondary/10 p-6 rounded-2xl">



                    {/* Category */}
                    <div className="mt-4">
                        <label className="text-zg-secondary text-sm block mb-2">Category</label>
                        <select
                            name="category"
                            value={formData.category}
                            onChange={handleChange}
                            className="w-full px-4 py-3 rounded-lg bg-zg-surface border border-zg-secondary/10"
                        >
                            <option value="">Select Category</option>

                            {categories.map(cat => (
                                <option key={cat._id} value={cat.slug}>
                                    {cat.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Name */}
                    <div className="mt-4">
                        <label className="text-zg-secondary text-sm block mb-2">Product Name</label>
                        <input
                            type="text"
                            name="name"
                            required
                            value={formData.name}
                            onChange={handleChange}
                            className="w-full px-4 py-3 rounded-lg bg-zg-surface border border-zg-secondary/10"
                        />
                    </div>

                    {/* Description */}
                    <div className="mt-4">
                        <label className="text-zg-secondary text-sm block mb-2">Description</label>
                        <textarea
                            name="description"
                            rows="3"
                            required
                            value={formData.description}
                            onChange={handleChange}
                            className="w-full px-4 py-3 rounded-lg bg-zg-surface border border-zg-secondary/10"
                        ></textarea>
                    </div>

                    {/* Base Price */}
                    <div className="mt-4">
                        <label className="text-zg-secondary text-sm block mb-2">Base Price</label>
                        <input
                            type="number"
                            name="price"
                            value={formData.price}
                            onChange={handleChange}
                            className="w-full px-4 py-3 rounded-lg bg-zg-surface border border-zg-secondary/10"
                        />
                    </div>



                </div>

                {/* ALBUM CONFIGURATION */}
                {formData.type === 'ealbum' && (
                    <div className="bg-zg-surface/50 border border-zg-secondary/10 p-6 rounded-2xl mb-6">
                        <h3 className="text-lg font-bold mb-6 text-zg-primary">Album Configuration</h3>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Album Sizes */}
                            <div>
                                <label className="text-zg-primary text-sm font-medium block mb-3">Available Sizes</label>
                                <div className="space-y-3">
                                    {formData.albumSizes.map((size, index) => (
                                        <div key={index} className="flex items-center gap-2">
                                            <input
                                                type="text"
                                                value={size}
                                                onChange={(e) => handleListChange('albumSizes', index, e.target.value)}
                                                placeholder="e.g. 12X20"
                                                className="flex-1 px-4 py-3 rounded-lg bg-zg-surface border border-zg-secondary/10 text-zg-primary focus:outline-none focus:border-zg-accent transition"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removeListItem('albumSizes', index)}
                                                className="p-3 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 transition"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                    <button
                                        type="button"
                                        onClick={() => addListItem('albumSizes')}
                                        className="w-full py-3 rounded-lg border-2 border-dashed border-zg-secondary/20 hover:border-zg-accent/50 text-zg-secondary hover:text-zg-accent transition flex items-center justify-center gap-2"
                                    >
                                        <Plus className="w-4 h-4" />
                                        Add Size
                                    </button>
                                </div>
                            </div>

                            {/* Sheet Options */}
                            <div>
                                <label className="text-zg-primary text-sm font-medium block mb-3">Sheet Options</label>
                                <div className="space-y-4">
                                    {formData.albumSheetOptions.map((option, index) => (
                                        <div key={index} className="bg-zg-surface p-4 rounded-lg border border-zg-secondary/10 relative">
                                            <button
                                                type="button"
                                                onClick={() => removeSheetOption(index)}
                                                className="absolute top-2 right-2 text-red-500 hover:bg-red-500/10 p-1 rounded transition"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                            <div className="grid grid-cols-1 gap-3">
                                                <div>
                                                    <label className="text-xs text-zg-secondary mb-1 block">Option Name</label>
                                                    <input
                                                        type="text"
                                                        value={option.name}
                                                        onChange={(e) => handleSheetOptionChange(index, 'name', e.target.value)}
                                                        placeholder="e.g. 11SHEETS (SOFT COVER)"
                                                        className="w-full px-3 py-2 rounded bg-zg-bg border border-zg-secondary/10 text-sm"
                                                    />
                                                </div>
                                                <div className="grid grid-cols-2 gap-3">
                                                    <div>
                                                        <label className="text-xs text-zg-secondary mb-1 block">Pages</label>
                                                        <input
                                                            type="number"
                                                            value={option.pageCount}
                                                            onChange={(e) => handleSheetOptionChange(index, 'pageCount', parseInt(e.target.value) || 0)}
                                                            className="w-full px-3 py-2 rounded bg-zg-bg border border-zg-secondary/10 text-sm"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="text-xs text-zg-secondary mb-1 block">Extra Price</label>
                                                        <input
                                                            type="number"
                                                            value={option.price}
                                                            onChange={(e) => handleSheetOptionChange(index, 'price', parseFloat(e.target.value) || 0)}
                                                            className="w-full px-3 py-2 rounded bg-zg-bg border border-zg-secondary/10 text-sm"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    <button
                                        type="button"
                                        onClick={addSheetOption}
                                        className="w-full py-3 rounded-lg border-2 border-dashed border-zg-secondary/20 hover:border-zg-accent/50 text-zg-secondary hover:text-zg-accent transition flex items-center justify-center gap-2"
                                    >
                                        <Plus className="w-4 h-4" />
                                        Add Sheet Option
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* IMAGE UPLOAD SECTION */}
                <div className="bg-zg-surface/50 border border-zg-secondary/10 p-6 rounded-2xl">

                    {/* Cover Image */}
                    <label className="text-zg-secondary text-sm block mb-2">Cover Image</label>
                    <div className="flex items-center gap-4">
                        <div className="w-40 h-28 bg-zg-secondary/10 rounded-lg overflow-hidden">
                            {formData.coverImage ? (
                                <img src={formData.coverImage} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <ImageIcon className="w-8 h-8 text-zg-secondary" />
                                </div>
                            )}
                        </div>

                        <label className="px-4 py-2 bg-zg-accent text-black rounded-lg cursor-pointer flex items-center gap-2">
                            <Upload className="w-4 h-4" />
                            Upload
                            <input type="file" accept="image/*" className="hidden" onChange={uploadCover} />
                        </label>
                    </div>

                    {/* Gallery Images */}
                    <div className="mt-6">
                        <label className="text-zg-secondary text-sm block mb-2">Gallery Images</label>

                        <div className="grid grid-cols-3 gap-4">
                            {formData.gallery.map((img, index) => (
                                <div key={index} className="relative group">
                                    <img src={img} className="w-full h-32 rounded-lg object-cover" />
                                    <button
                                        type="button"
                                        onClick={() => removeGalleryImage(img)}
                                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}

                            {/* Upload Button */}
                            <label className="border border-zg-secondary/20 rounded-lg h-32 flex flex-col items-center justify-center cursor-pointer hover:bg-zg-secondary/10 transition">
                                <Plus className="w-6 h-6 text-zg-secondary" />
                                <span className="text-xs text-zg-secondary">Add Image</span>
                                <input
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    className="hidden"
                                    onChange={uploadGallery}
                                />
                            </label>
                        </div>
                    </div>
                </div>

                {/* FEATURES & BENEFITS SECTION */}
                <div className="bg-zg-surface/50 border border-zg-secondary/10 p-6 rounded-2xl">
                    <h3 className="text-lg font-bold mb-6 text-zg-primary">Features & Benefits</h3>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Features */}
                        <div>
                            <label className="text-zg-primary text-sm font-medium block mb-3">Product Features</label>
                            <div className="space-y-3">
                                {formData.features.map((feature, index) => (
                                    <div key={index} className="flex items-center gap-2">
                                        <input
                                            type="text"
                                            value={feature}
                                            onChange={(e) => handleListChange('features', index, e.target.value)}
                                            placeholder={`Feature ${index + 1}`}
                                            className="flex-1 px-4 py-3 rounded-lg bg-zg-surface border border-zg-secondary/10 text-zg-primary focus:outline-none focus:border-zg-accent transition"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => removeListItem('features', index)}
                                            className="p-3 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 transition"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                                <button
                                    type="button"
                                    onClick={() => addListItem('features')}
                                    className="w-full py-3 rounded-lg border-2 border-dashed border-zg-secondary/20 hover:border-zg-accent/50 text-zg-secondary hover:text-zg-accent transition flex items-center justify-center gap-2"
                                >
                                    <Plus className="w-4 h-4" />
                                    Add Feature
                                </button>
                            </div>
                        </div>

                        {/* Benefits */}
                        <div>
                            <label className="text-zg-primary text-sm font-medium block mb-3">Product Benefits</label>
                            <div className="space-y-3">
                                {formData.benefits.map((benefit, index) => (
                                    <div key={index} className="flex items-center gap-2">
                                        <input
                                            type="text"
                                            value={benefit}
                                            onChange={(e) => handleListChange('benefits', index, e.target.value)}
                                            placeholder={`Benefit ${index + 1}`}
                                            className="flex-1 px-4 py-3 rounded-lg bg-zg-surface border border-zg-secondary/10 text-zg-primary focus:outline-none focus:border-zg-accent transition"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => removeListItem('benefits', index)}
                                            className="p-3 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 transition"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                                <button
                                    type="button"
                                    onClick={() => addListItem('benefits')}
                                    className="w-full py-3 rounded-lg border-2 border-dashed border-zg-secondary/20 hover:border-zg-accent/50 text-zg-secondary hover:text-zg-accent transition flex items-center justify-center gap-2"
                                >
                                    <Plus className="w-4 h-4" />
                                    Add Benefit
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* CUSTOMIZATION SECTION */}
                <div className="bg-zg-surface/50 border border-zg-secondary/10 p-6 rounded-2xl">
                    <h3 className="text-lg font-bold mb-4 text-zg-primary">Customization Settings</h3>

                    <div className="flex items-center gap-3 mb-4">
                        <input
                            type="checkbox"
                            id="allowCustomization"
                            checked={formData.customization.allowed}
                            onChange={(e) => setFormData(prev => ({
                                ...prev,
                                customization: { ...prev.customization, allowed: e.target.checked }
                            }))}
                            className="w-5 h-5 rounded border-zg-secondary/20 bg-zg-surface text-zg-accent focus:ring-zg-accent"
                        />
                        <label htmlFor="allowCustomization" className="text-zg-primary font-medium">
                            Enable User Uploads
                        </label>
                    </div>

                    {formData.customization.allowed && (
                        <div className="space-y-4 pl-8 border-l-2 border-zg-secondary/10">
                            <div>
                                <label className="text-zg-primary text-sm font-medium block mb-2">Max Image Count</label>
                                <input
                                    type="number"
                                    value={formData.customization.imageCount}
                                    onChange={(e) => setFormData(prev => ({
                                        ...prev,
                                        customization: { ...prev.customization, imageCount: parseInt(e.target.value) || 0 }
                                    }))}
                                    className="w-full px-4 py-3 rounded-lg bg-zg-surface border border-zg-secondary/10"
                                />
                            </div>

                            {formData.type === "ealbum" && (
                                <div>
                                    <label className="text-zg-primary font-medium block mb-3">Cover Preview Area (%)</label>
                                    <p className="text-xs text-zg-secondary mb-3">
                                        Define the area on the cover image where the user's uploaded photo will be placed.
                                        Values are in percentages (0-100).
                                    </p>

                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        <div>
                                            <label className="text-zg-primary text-xs font-medium block mb-1">Left (X)</label>
                                            <input
                                                type="number"
                                                value={formData.customization.previewArea.x}
                                                onChange={(e) => setFormData(prev => ({
                                                    ...prev,
                                                    customization: {
                                                        ...prev.customization,
                                                        previewArea: { ...prev.customization.previewArea, x: parseFloat(e.target.value) }
                                                    }
                                                }))}
                                                className="w-full px-3 py-2 rounded-lg bg-zg-surface border border-zg-secondary/10 text-sm"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-zg-primary text-xs font-medium block mb-1">Top (Y)</label>
                                            <input
                                                type="number"
                                                value={formData.customization.previewArea.y}
                                                onChange={(e) => setFormData(prev => ({
                                                    ...prev,
                                                    customization: {
                                                        ...prev.customization,
                                                        previewArea: { ...prev.customization.previewArea, y: parseFloat(e.target.value) }
                                                    }
                                                }))}
                                                className="w-full px-3 py-2 rounded-lg bg-zg-surface border border-zg-secondary/10 text-sm"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-zg-primary text-xs font-medium block mb-1">Width</label>
                                            <input
                                                type="number"
                                                value={formData.customization.previewArea.width}
                                                onChange={(e) => setFormData(prev => ({
                                                    ...prev,
                                                    customization: {
                                                        ...prev.customization,
                                                        previewArea: { ...prev.customization.previewArea, width: parseFloat(e.target.value) }
                                                    }
                                                }))}
                                                className="w-full px-3 py-2 rounded-lg bg-zg-surface border border-zg-secondary/10 text-sm"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-zg-primary text-xs font-medium block mb-1">Height</label>
                                            <input
                                                type="number"
                                                value={formData.customization.previewArea.height}
                                                onChange={(e) => setFormData(prev => ({
                                                    ...prev,
                                                    customization: {
                                                        ...prev.customization,
                                                        previewArea: { ...prev.customization.previewArea, height: parseFloat(e.target.value) }
                                                    }
                                                }))}
                                                className="w-full px-3 py-2 rounded-lg bg-zg-surface border border-zg-secondary/10 text-sm"
                                            />
                                        </div>
                                    </div>

                                    {/* PREVIEW VISUALIZER */}
                                    {formData.coverImage && (
                                        <div className="mt-4 relative w-64 h-64 bg-gray-800 rounded-lg overflow-hidden border border-zg-secondary/20">
                                            <img src={formData.coverImage} className="w-full h-full object-cover opacity-50" />
                                            <div
                                                className="absolute border-2 border-zg-accent bg-zg-accent/20 flex items-center justify-center text-xs text-white font-bold"
                                                style={{
                                                    left: `${formData.customization.previewArea.x}%`,
                                                    top: `${formData.customization.previewArea.y}%`,
                                                    width: `${formData.customization.previewArea.width}%`,
                                                    height: `${formData.customization.previewArea.height}%`,
                                                }}
                                            >
                                                Preview Area
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>
                {/* (Omitted here since it's unchanged from your code; keep your existing ones) */}

                {/* SUBMIT BUTTONS */}
                <div className="flex justify-end gap-4">
                    <button
                        type="button"
                        onClick={() => navigate("/admin/products")}
                        className="px-6 py-3 rounded-lg text-zg-secondary hover:bg-zg-secondary/10"
                    >
                        Cancel
                    </button>

                    <button
                        type="submit"
                        disabled={loading}
                        className="px-8 py-3 bg-zg-accent text-black font-bold rounded-lg shadow-lg disabled:opacity-50"
                    >
                        <Save className="w-4 h-4" />
                        {loading ? "Saving..." : "Save Product"}
                    </button>
                </div>

            </form>
        </DashboardLayout>
    );
};

export default ProductForm;
