import React, {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";

import {
    Search,
    X,
    Layers,
    Tag,
    ChevronRight,
    ChevronLeft,
    Edit2,
    CheckCircle2,
    XCircle,
    Loader2,
    RefreshCw,
    Package,
    IndianRupee,
    Power,
    Save,
    SlidersHorizontal,
    ImageIcon,
    ChevronDown,
    Upload,
    Trash2,
    Plus,
} from "lucide-react";

import { API_BASE } from "../config/api";

/* =========================================================
   HELPERS
========================================================= */

const formatPrice = (value) => {
    return Number(value || 0).toLocaleString("en-IN");
};

const getProductImages = (product) => {
    const images = [];

    if (product?.thumbnail?.url) {
        images.push({
            type: "thumbnail",
            url: product.thumbnail.url,
        });
    }

    if (Array.isArray(product?.images)) {
        product.images.forEach((image, index) => {
            if (image?.url) {
                images.push({
                    type: `image-${index + 1}`,
                    url: image.url,
                });
            }
        });
    }

    return images;
};

const getRelationName = (value) => {
    if (!value) return "N/A";
    if (typeof value === "string") return value;
    return value.name || "N/A";
};

const getRelationId = (value) => {
    if (!value) return "";
    if (typeof value === "string") return value;
    return value._id || "";
};

const compressImageFile = (
    file,
    { maxWidth = 1600, maxHeight = 1600, quality = 0.82 } = {}
) => {
    return new Promise((resolve) => {
        // Skip non-raster images like SVG
        if (!file.type.startsWith("image/") || file.type === "image/svg+xml") {
            return resolve(file);
        }

        const img = new Image();
        const objectUrl = URL.createObjectURL(file);

        img.onload = () => {
            URL.revokeObjectURL(objectUrl);

            let { width, height } = img;

            // Calculate proportional resize dimensions
            if (width > maxWidth || height > maxHeight) {
                const ratio = Math.min(maxWidth / width, maxHeight / height);
                width = Math.round(width * ratio);
                height = Math.round(height * ratio);
            }

            const canvas = document.createElement("canvas");
            canvas.width = width;
            canvas.height = height;

            const ctx = canvas.getContext("2d");
            ctx.drawImage(img, 0, 0, width, height);

            // Use WebP for great compression + alpha transparency support
            const outputType = "image/webp";
            const baseName = file.name.replace(/\.[^/.]+$/, "");

            canvas.toBlob(
                (blob) => {
                    if (!blob || blob.size >= file.size) {
                        // If compressed file isn't smaller, keep original
                        return resolve(file);
                    }

                    const compressedFile = new File(
                        [blob],
                        `${baseName}.webp`,
                        {
                            type: outputType,
                            lastModified: Date.now(),
                        }
                    );

                    resolve(compressedFile);
                },
                outputType,
                quality
            );
        };

        img.onerror = () => {
            URL.revokeObjectURL(objectUrl);
            resolve(file); // Fallback to original if decoding fails
        };

        img.src = objectUrl;
    });
};

/* =========================================================
   STATUS BADGE
========================================================= */

const StatusBadge = ({ active }) => {
    return (
        <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border ${active
                ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                : "bg-red-50 text-red-600 border-red-100"
                }`}
        >
            {active ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
            {active ? "Active" : "Inactive"}
        </span>
    );
};

/* =========================================================
   PRODUCT DETAILS DRAWER
========================================================= */

const ProductSlideSheet = ({
    product,
    onClose,
    onEdit,
    onStatusChange,
    statusUpdating,
}) => {
    const [activeImageIndex, setActiveImageIndex] = useState(0);

    const images = useMemo(() => getProductImages(product), [product]);

    useEffect(() => {
        setActiveImageIndex(0);
    }, [product]);

    if (!product) return null;

    const currentImage = images[activeImageIndex]?.url;

    return (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/40 backdrop-blur-sm">
            <div className="w-full max-w-xl bg-[#F8FAFC] h-full shadow-2xl flex flex-col">
                {/* HEADER */}
                <div className="flex justify-between items-start p-6 border-b border-slate-200 bg-white sticky top-0 z-20">
                    <div className="pr-6">
                        <div className="flex items-center gap-2 mb-2">
                            <StatusBadge active={product.isActive} />
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                {product.sku}
                            </span>
                        </div>

                        <h2 className="text-xl font-black text-slate-900 leading-tight">
                            {product.title}
                        </h2>
                    </div>

                    <button
                        onClick={onClose}
                        className="w-10 h-10 rounded-xl border border-slate-200 bg-white flex items-center justify-center text-slate-400 hover:text-slate-900 hover:bg-slate-50 transition"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* CONTENT */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {/* IMAGE GALLERY */}
                    <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
                        <div className="h-72 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-center overflow-hidden">
                            {currentImage ? (
                                <img
                                    src={currentImage}
                                    alt={product.sku}
                                    className="max-h-full max-w-full object-contain p-4"
                                />
                            ) : (
                                <div className="text-center text-slate-400">
                                    <ImageIcon
                                        size={42}
                                        className="mx-auto mb-2"
                                    />
                                    <p className="text-xs font-bold">
                                        No product image
                                    </p>
                                </div>
                            )}
                        </div>

                        {images.length > 1 && (
                            <div className="flex gap-3 mt-4 overflow-x-auto pb-1">
                                {images.map((image, index) => (
                                    <button
                                        key={`${image.url}-${index}`}
                                        onClick={() =>
                                            setActiveImageIndex(index)
                                        }
                                        className={`w-16 h-16 shrink-0 rounded-xl border-2 overflow-hidden bg-white ${activeImageIndex === index
                                            ? "border-orange-500"
                                            : "border-slate-200"
                                            }`}
                                    >
                                        <img
                                            src={image.url}
                                            alt=""
                                            className="w-full h-full object-contain p-1"
                                        />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* CLASSIFICATION */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <InfoCard
                            label="Brand"
                            value={getRelationName(product.brand)}
                            icon={<Tag size={15} />}
                        />

                        <InfoCard
                            label="Category"
                            value={getRelationName(product.category)}
                            icon={<Layers size={15} />}
                        />

                        <InfoCard
                            label="Subcategory"
                            value={getRelationName(product.subcategory)}
                            icon={<Package size={15} />}
                        />
                    </div>

                    {/* PRICING */}
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="px-5 py-4 border-b border-slate-100">
                            <p className="text-[11px] font-black uppercase tracking-widest text-slate-400">
                                Pricing
                            </p>
                        </div>

                        <div className="p-5 space-y-4">
                            <PriceRow
                                title="MRP"
                                value={product.pricing?.mrp}
                            />
                            <PriceRow
                                title="Dealer Price"
                                value={product.pricing?.dealerPrice}
                            />
                            <PriceRow
                                title="Net Price"
                                value={product.pricing?.netPrice}
                                highlight
                            />
                            <PriceRow
                                title="NLC"
                                value={product.pricing?.nlc}
                            />
                        </div>
                    </div>

                    {/* SPECIFICATIONS */}
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="px-5 py-4 border-b border-slate-100">
                            <p className="text-[11px] font-black uppercase tracking-widest text-slate-400">
                                Specifications
                            </p>
                        </div>

                        <div className="p-5">
                            {product.specifications &&
                                Object.keys(product.specifications).length > 0 ? (
                                <div className="divide-y divide-slate-100">
                                    {Object.entries(
                                        product.specifications
                                    ).map(([key, value]) => (
                                        <div
                                            key={key}
                                            className="flex justify-between gap-4 py-3"
                                        >
                                            <span className="text-sm capitalize text-slate-500">
                                                {key}
                                            </span>

                                            <span className="text-sm font-bold text-slate-900 text-right">
                                                {String(value || "N/A")}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-slate-400">
                                    No specifications.
                                </p>
                            )}
                        </div>
                    </div>

                    {/* META */}
                    <div className="text-xs text-slate-400 space-y-1">
                        <p>
                            Created:{" "}
                            {product.createdAt
                                ? new Date(product.createdAt).toLocaleString()
                                : "N/A"}
                        </p>
                        <p>
                            Updated:{" "}
                            {product.updatedAt
                                ? new Date(product.updatedAt).toLocaleString()
                                : "N/A"}
                        </p>
                    </div>
                </div>

                {/* FOOTER */}
                <div className="p-4 border-t border-slate-200 bg-white flex gap-3">
                    <button
                        disabled={statusUpdating}
                        onClick={() => onStatusChange(product)}
                        className={`flex-1 flex justify-center items-center gap-2 py-3 rounded-xl text-sm font-black transition disabled:opacity-60 ${product.isActive
                            ? "bg-red-50 text-red-600 hover:bg-red-100"
                            : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                            }`}
                    >
                        {statusUpdating ? (
                            <Loader2 size={16} className="animate-spin" />
                        ) : (
                            <Power size={16} />
                        )}
                        {product.isActive ? "Deactivate" : "Activate"}
                    </button>

                    <button
                        onClick={() => onEdit(product)}
                        className="flex-1 flex justify-center items-center gap-2 bg-slate-900 text-white hover:bg-slate-800 py-3 rounded-xl text-sm font-black transition"
                    >
                        <Edit2 size={16} />
                        Edit Product
                    </button>
                </div>
            </div>
        </div>
    );
};

/* =========================================================
   INFO CARD & PRICE ROW
========================================================= */

const InfoCard = ({ label, value, icon }) => {
    return (
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-2 text-orange-500 mb-2">
                {icon}
                <span className="text-[10px] uppercase tracking-widest font-black text-slate-400">
                    {label}
                </span>
            </div>
            <p className="font-bold text-slate-800 text-sm">{value}</p>
        </div>
    );
};

const PriceRow = ({ title, value, highlight }) => {
    return (
        <div className="flex justify-between items-center">
            <span className="text-sm font-semibold text-slate-500">
                {title}
            </span>
            <span
                className={`font-black ${highlight
                    ? "text-lg text-orange-600"
                    : "text-slate-900"
                    }`}
            >
                ₹{formatPrice(value)}
            </span>
        </div>
    );
};

/* =========================================================
   EDIT MODAL (FULL PRODUCT + DROPDOWNS + SPECS + CLOUDINARY)
========================================================= */

const EditProductModal = ({ product, meta, onClose, onSaved }) => {
    const [saving, setSaving] = useState(false);

    const [form, setForm] = useState({
        sku: "",
        title: "",
        brand: "",
        category: "",
        subcategory: "",
        mrp: "",
        dealerPrice: "",
        netPrice: "",
        nlc: "",
    });

    // Dynamic specifications as an array of { id, key, value }
    const [specRows, setSpecRows] = useState([]);

    // Thumbnail state
    const [existingThumbnailUrl, setExistingThumbnailUrl] = useState("");
    const [newThumbnailFile, setNewThumbnailFile] = useState(null);
    const [newThumbnailPreview, setNewThumbnailPreview] = useState("");
    const [removeThumbnail, setRemoveThumbnail] = useState(false);

    // Gallery images state
    const [existingImages, setExistingImages] = useState([]);
    const [removedImageIds, setRemovedImageIds] = useState([]);
    const [newGalleryItems, setNewGalleryItems] = useState([]); // [{ file, previewUrl }]

    const thumbnailInputRef = useRef(null);
    const galleryInputRef = useRef(null);

    // Populate form when product opens
    useEffect(() => {
        if (!product) return;

        setForm({
            sku: product.sku || "",
            title: product.title || "",
            brand: getRelationId(product.brand),
            category: getRelationId(product.category),
            subcategory: getRelationId(product.subcategory),
            mrp: product.pricing?.mrp ?? "",
            dealerPrice: product.pricing?.dealerPrice ?? "",
            netPrice: product.pricing?.netPrice ?? "",
            nlc: product.pricing?.nlc ?? "",
        });

        const entries = product.specifications
            ? Object.entries(product.specifications)
            : [];
        setSpecRows(
            entries.length > 0
                ? entries.map(([key, value], idx) => ({
                    id: `spec-${idx}-${Date.now()}`,
                    key,
                    value: String(value ?? ""),
                }))
                : [{ id: `spec-init-${Date.now()}`, key: "capacity", value: "" }]
        );

        setExistingThumbnailUrl(product.thumbnail?.url || "");
        setNewThumbnailFile(null);
        setNewThumbnailPreview("");
        setRemoveThumbnail(false);

        setExistingImages(
            Array.isArray(product.images) ? product.images : []
        );
        setRemovedImageIds([]);
        setNewGalleryItems([]);
    }, [product]);

    // Revoke object URLs on unmount/cleanup
    useEffect(() => {
        return () => {
            if (newThumbnailPreview) URL.revokeObjectURL(newThumbnailPreview);
            newGalleryItems.forEach((item) =>
                URL.revokeObjectURL(item.previewUrl)
            );
        };
    }, [newThumbnailPreview, newGalleryItems]);

    // Filter subcategories based on selected category
    const filteredSubcategories = useMemo(() => {
        if (!form.category) return [];
        return (meta.subcategories || []).filter(
            (sub) => String(sub.category) === String(form.category)
        );
    }, [meta.subcategories, form.category]);

    if (!product) return null;

    const updateField = (field, value) => {
        setForm((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleCategoryChange = (newCategoryId) => {
        const firstMatchingSub = (meta.subcategories || []).find(
            (sub) => String(sub.category) === String(newCategoryId)
        );

        setForm((prev) => ({
            ...prev,
            category: newCategoryId,
            subcategory: firstMatchingSub ? firstMatchingSub._id : "",
        }));
    };

    /* --- Specifications Handlers --- */
    const updateSpecRow = (id, field, val) => {
        setSpecRows((prev) =>
            prev.map((row) => (row.id === id ? { ...row, [field]: val } : row))
        );
    };

    const addSpecRow = () => {
        setSpecRows((prev) => [
            ...prev,
            { id: `spec-${Date.now()}-${Math.random()}`, key: "", value: "" },
        ]);
    };

    const removeSpecRow = (id) => {
        setSpecRows((prev) => prev.filter((row) => row.id !== id));
    };

    /* --- Thumbnail Handlers --- */
    const handleThumbnailSelect = async (event) => {
        const file = event.target.files?.[0];
        event.target.value = "";
        if (!file) return;

        // Compress thumbnail to max 800x800
        const compressed = await compressImageFile(file, {
            maxWidth: 800,
            maxHeight: 800,
            quality: 0.85,
        });

        if (newThumbnailPreview) URL.revokeObjectURL(newThumbnailPreview);
        setNewThumbnailFile(compressed);
        setNewThumbnailPreview(URL.createObjectURL(compressed));
        setRemoveThumbnail(false);
    };

    const handleClearThumbnail = () => {
        if (newThumbnailPreview) URL.revokeObjectURL(newThumbnailPreview);
        setNewThumbnailFile(null);
        setNewThumbnailPreview("");
        setExistingThumbnailUrl("");
        setRemoveThumbnail(true);
    };

    /* --- Gallery Handlers --- */
    const handleGallerySelect = async (event) => {
        const files = Array.from(event.target.files || []);
        event.target.value = "";
        if (files.length === 0) return;

        // Compress all selected gallery images in parallel to max 1600x1600
        const compressedFiles = await Promise.all(
            files.map((file) =>
                compressImageFile(file, {
                    maxWidth: 1600,
                    maxHeight: 1600,
                    quality: 0.82,
                })
            )
        );

        const mapped = compressedFiles.map((file) => ({
            file,
            previewUrl: URL.createObjectURL(file),
        }));

        setNewGalleryItems((prev) => [...prev, ...mapped]);
    };

    const handleRemoveExistingImage = (publicId) => {
        setRemovedImageIds((prev) => [...prev, publicId]);
        setExistingImages((prev) =>
            prev.filter((img) => img.publicId !== publicId)
        );
    };

    const handleRemoveNewGalleryItem = (index) => {
        setNewGalleryItems((prev) => {
            const target = prev[index];
            if (target) URL.revokeObjectURL(target.previewUrl);
            return prev.filter((_, idx) => idx !== index);
        });
    };

    /* --- Submit --- */
    const saveProduct = async () => {
        if (!form.title.trim()) {
            alert("Product title is required.");
            return;
        }
        if (!form.brand || !form.category || !form.subcategory) {
            alert("Please select Brand, Category, and Subcategory.");
            return;
        }

        try {
            setSaving(true);

            // Convert specRows into clean key-value object
            const cleanSpecifications = {};
            specRows.forEach(({ key, value }) => {
                const trimmedKey = key.trim();
                if (trimmedKey) {
                    cleanSpecifications[trimmedKey] = value.trim();
                }
            });

            const formData = new FormData();
            formData.append("sku", form.sku.trim().toUpperCase());
            formData.append("title", form.title.trim());
            formData.append("brand", form.brand);
            formData.append("category", form.category);
            formData.append("subcategory", form.subcategory);

            formData.append(
                "pricing",
                JSON.stringify({
                    mrp: Number(form.mrp) || 0,
                    dealerPrice: Number(form.dealerPrice) || 0,
                    netPrice: Number(form.netPrice) || 0,
                    nlc: Number(form.nlc) || 0,
                })
            );

            formData.append(
                "specifications",
                JSON.stringify(cleanSpecifications)
            );

            if (newThumbnailFile) {
                formData.append("thumbnail", newThumbnailFile);
            } else if (removeThumbnail) {
                formData.append("removeThumbnail", "true");
            }

            if (removedImageIds.length > 0) {
                formData.append(
                    "removedImageIds",
                    JSON.stringify(removedImageIds)
                );
            }

            newGalleryItems.forEach((item) => {
                formData.append("images", item.file);
            });

            const response = await fetch(
                `${API_BASE}/products/${product._id}`,
                {
                    method: "PUT",
                    body: formData,
                }
            );

            const result = await response.json();

            if (!response.ok) {
                throw new Error(
                    result.message || "Unable to update product"
                );
            }

            onSaved(result.data);
        } catch (error) {
            alert(error.message);
        } finally {
            setSaving(false);
        }
    };

    const displayedThumbnail =
        newThumbnailPreview || (!removeThumbnail ? existingThumbnailUrl : "");

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/50 backdrop-blur-sm px-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[92vh]">
                {/* HEADER */}
                <div className="px-6 py-5 border-b border-slate-200 flex justify-between items-start shrink-0">
                    <div>
                        <p className="text-[10px] uppercase tracking-widest font-black text-orange-500">
                            Edit Product
                        </p>
                        <h3 className="font-black text-xl text-slate-900 mt-1">
                            {product.sku}
                        </h3>
                    </div>

                    <button
                        onClick={onClose}
                        disabled={saving}
                        className="w-9 h-9 border border-slate-200 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-800"
                    >
                        <X size={17} />
                    </button>
                </div>

                {/* BODY */}
                <div className="p-6 overflow-y-auto space-y-6">
                    {/* BASIC INFO */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <Input
                            label="SKU"
                            value={form.sku}
                            onChange={(val) =>
                                updateField("sku", val.toUpperCase())
                            }
                        />
                        <div className="sm:col-span-2">
                            <Input
                                label="Product Title"
                                value={form.title}
                                onChange={(val) => updateField("title", val)}
                            />
                        </div>
                    </div>

                    {/* CLASSIFICATION DROPDOWNS */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <SelectInput
                            label="Brand"
                            value={form.brand}
                            onChange={(val) => updateField("brand", val)}
                            options={meta.brands}
                            placeholder="Select Brand"
                        />

                        <SelectInput
                            label="Category"
                            value={form.category}
                            onChange={handleCategoryChange}
                            options={meta.categories}
                            placeholder="Select Category"
                        />

                        <SelectInput
                            label="Subcategory"
                            value={form.subcategory}
                            onChange={(val) =>
                                updateField("subcategory", val)
                            }
                            options={filteredSubcategories}
                            placeholder={
                                form.category
                                    ? "Select Subcategory"
                                    : "Choose Category First"
                            }
                            disabled={!form.category}
                        />
                    </div>

                    {/* PRICING */}
                    <div>
                        <p className="text-xs font-black text-slate-500 uppercase tracking-wider mb-3">
                            Pricing (₹)
                        </p>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            <Input
                                label="MRP"
                                type="number"
                                value={form.mrp}
                                onChange={(val) => updateField("mrp", val)}
                            />
                            <Input
                                label="Dealer Price"
                                type="number"
                                value={form.dealerPrice}
                                onChange={(val) =>
                                    updateField("dealerPrice", val)
                                }
                            />
                            <Input
                                label="Net Price"
                                type="number"
                                value={form.netPrice}
                                onChange={(val) =>
                                    updateField("netPrice", val)
                                }
                            />
                            <Input
                                label="NLC"
                                type="number"
                                value={form.nlc}
                                onChange={(val) => updateField("nlc", val)}
                            />
                        </div>
                    </div>

                    {/* IMAGES (CLOUDINARY) */}
                    <div className="space-y-4 pt-2 border-t border-slate-100">
                        <p className="text-xs font-black text-slate-500 uppercase tracking-wider">
                            Product Media (Cloudinary)
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                            {/* THUMBNAIL */}
                            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-[11px] font-black uppercase tracking-wider text-slate-600">
                                        Thumbnail
                                    </span>
                                    {displayedThumbnail && (
                                        <button
                                            type="button"
                                            onClick={handleClearThumbnail}
                                            className="text-xs font-bold text-red-500 hover:text-red-700 flex items-center gap-1"
                                        >
                                            <Trash2 size={13} />
                                            Remove
                                        </button>
                                    )}
                                </div>

                                <div className="h-36 rounded-xl border-2 border-dashed border-slate-200 bg-white flex items-center justify-center overflow-hidden relative">
                                    {displayedThumbnail ? (
                                        <img
                                            src={displayedThumbnail}
                                            alt="Thumbnail preview"
                                            className="w-full h-full object-contain p-2"
                                        />
                                    ) : (
                                        <div className="text-center text-slate-400 p-3">
                                            <ImageIcon
                                                size={26}
                                                className="mx-auto mb-1"
                                            />
                                            <p className="text-[11px] font-bold">
                                                No Thumbnail
                                            </p>
                                        </div>
                                    )}
                                </div>

                                <input
                                    ref={thumbnailInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handleThumbnailSelect}
                                    className="hidden"
                                />

                                <button
                                    type="button"
                                    onClick={() =>
                                        thumbnailInputRef.current?.click()
                                    }
                                    className="mt-3 w-full py-2 px-3 rounded-lg border border-slate-200 bg-white text-xs font-bold text-slate-700 hover:border-orange-400 hover:text-orange-600 flex items-center justify-center gap-1.5 transition"
                                >
                                    <Upload size={14} />
                                    {displayedThumbnail
                                        ? "Replace Thumbnail"
                                        : "Upload Thumbnail"}
                                </button>
                            </div>

                            {/* GALLERY IMAGES */}
                            <div className="md:col-span-2 bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col">
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-[11px] font-black uppercase tracking-wider text-slate-600">
                                        Gallery Images (
                                        {existingImages.length +
                                            newGalleryItems.length}
                                        )
                                    </span>

                                    <input
                                        ref={galleryInputRef}
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        onChange={handleGallerySelect}
                                        className="hidden"
                                    />

                                    <button
                                        type="button"
                                        onClick={() =>
                                            galleryInputRef.current?.click()
                                        }
                                        className="px-3 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 flex items-center gap-1.5 transition"
                                    >
                                        <Plus size={14} />
                                        Add Images
                                    </button>
                                </div>

                                {existingImages.length === 0 &&
                                    newGalleryItems.length === 0 ? (
                                    <div className="flex-1 min-h-[144px] rounded-xl border-2 border-dashed border-slate-200 bg-white flex flex-col items-center justify-center text-slate-400 p-4">
                                        <ImageIcon
                                            size={26}
                                            className="mb-1"
                                        />
                                        <p className="text-xs font-bold">
                                            No gallery images added yet
                                        </p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                                        {/* Existing Cloudinary Images */}
                                        {existingImages.map((img) => (
                                            <div
                                                key={img.publicId}
                                                className="group relative h-24 rounded-xl border border-slate-200 bg-white overflow-hidden"
                                            >
                                                <img
                                                    src={img.url}
                                                    alt=""
                                                    className="w-full h-full object-contain p-1.5"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleRemoveExistingImage(
                                                            img.publicId
                                                        )
                                                    }
                                                    title="Delete image"
                                                    className="absolute top-1.5 right-1.5 w-6 h-6 rounded-lg bg-red-600 text-white flex items-center justify-center opacity-90 hover:opacity-100 shadow"
                                                >
                                                    <Trash2 size={12} />
                                                </button>
                                            </div>
                                        ))}

                                        {/* Newly Queued Local Images */}
                                        {newGalleryItems.map((item, idx) => (
                                            <div
                                                key={item.previewUrl}
                                                className="group relative h-24 rounded-xl border-2 border-orange-400 bg-white overflow-hidden"
                                            >
                                                <img
                                                    src={item.previewUrl}
                                                    alt=""
                                                    className="w-full h-full object-contain p-1.5"
                                                />
                                                <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded bg-orange-500 text-white text-[9px] font-black uppercase">
                                                    New
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleRemoveNewGalleryItem(
                                                            idx
                                                        )
                                                    }
                                                    title="Remove queued image"
                                                    className="absolute top-1.5 right-1.5 w-6 h-6 rounded-lg bg-slate-900 text-white flex items-center justify-center opacity-90 hover:opacity-100 shadow"
                                                >
                                                    <X size={12} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* DYNAMIC SPECIFICATIONS */}
                    <div className="space-y-3 pt-2 border-t border-slate-100">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-black text-slate-500 uppercase tracking-wider">
                                Specifications
                            </span>

                            <button
                                type="button"
                                onClick={addSpecRow}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-bold text-slate-700"
                            >
                                <Plus size={14} />
                                Add Field
                            </button>
                        </div>

                        {specRows.length === 0 ? (
                            <p className="text-xs text-slate-400">
                                No specifications. Click "Add Field" to add
                                key-value attributes.
                            </p>
                        ) : (
                            <div className="space-y-2.5">
                                {specRows.map((row) => (
                                    <div
                                        key={row.id}
                                        className="flex items-center gap-2.5"
                                    >
                                        <input
                                            type="text"
                                            placeholder="Attribute (e.g. Capacity)"
                                            value={row.key}
                                            onChange={(e) =>
                                                updateSpecRow(
                                                    row.id,
                                                    "key",
                                                    e.target.value
                                                )
                                            }
                                            className="w-2/5 px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-semibold outline-none focus:bg-white focus:border-orange-500"
                                        />

                                        <input
                                            type="text"
                                            placeholder="Value (e.g. 1.5 Ton)"
                                            value={row.value}
                                            onChange={(e) =>
                                                updateSpecRow(
                                                    row.id,
                                                    "value",
                                                    e.target.value
                                                )
                                            }
                                            className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-semibold outline-none focus:bg-white focus:border-orange-500"
                                        />

                                        <button
                                            type="button"
                                            onClick={() =>
                                                removeSpecRow(row.id)
                                            }
                                            className="w-10 h-10 shrink-0 rounded-xl border border-slate-200 text-slate-400 hover:text-red-600 hover:border-red-200 flex items-center justify-center transition"
                                        >
                                            <Trash2 size={15} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* FOOTER */}
                <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex justify-end gap-3 shrink-0">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={saving}
                        className="px-5 py-2.5 rounded-xl border border-slate-200 bg-white font-bold text-sm text-slate-600"
                    >
                        Cancel
                    </button>

                    <button
                        type="button"
                        onClick={saveProduct}
                        disabled={saving}
                        className="px-5 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-sm flex items-center gap-2 disabled:opacity-60 hover:bg-slate-800 transition"
                    >
                        {saving ? (
                            <Loader2 size={16} className="animate-spin" />
                        ) : (
                            <Save size={16} />
                        )}
                        {saving ? "Uploading & Saving..." : "Save Changes"}
                    </button>
                </div>
            </div>
        </div>
    );
};

/* =========================================================
   FORM INPUTS
========================================================= */

const Input = ({ label, value, onChange, type = "text" }) => {
    return (
        <label className="block">
            <span className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-2">
                {label}
            </span>

            <input
                type={type}
                value={value}
                onChange={(event) => onChange(event.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm font-semibold outline-none focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10"
            />
        </label>
    );
};

const SelectInput = ({
    label,
    value,
    onChange,
    options = [],
    placeholder = "Select option",
    disabled = false,
}) => {
    return (
        <label className="block">
            <span className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-2">
                {label}
            </span>

            <div className="relative">
                <select
                    value={value}
                    disabled={disabled}
                    onChange={(event) => onChange(event.target.value)}
                    className="w-full appearance-none px-4 pr-10 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm font-semibold text-slate-800 outline-none focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 disabled:opacity-50"
                >
                    <option value="">{placeholder}</option>
                    {options.map((opt) => (
                        <option key={opt._id} value={opt._id}>
                            {opt.name}
                        </option>
                    ))}
                </select>

                <ChevronDown
                    size={15}
                    className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />
            </div>
        </label>
    );
};

/* =========================================================
   MAIN DASHBOARD
========================================================= */

export default function ProductsPage() {
    const [products, setProducts] = useState([]);

    const [meta, setMeta] = useState({
        brands: [],
        categories: [],
        subcategories: [],
    });

    const [pagination, setPagination] = useState({
        page: 1,
        limit: 15,
        totalItems: 0,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: false,
    });

    const [loading, setLoading] = useState(true);
    const [statusUpdating, setStatusUpdating] = useState(false);
    const [error, setError] = useState("");

    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");

    const [brand, setBrand] = useState("");
    const [category, setCategory] = useState("");
    const [subcategory, setSubcategory] = useState("");
    const [status, setStatus] = useState("");

    const [sort, setSort] = useState("createdAt");
    const [order, setOrder] = useState("desc");

    const [selectedProduct, setSelectedProduct] = useState(null);
    const [editingProduct, setEditingProduct] = useState(null);

    /* -----------------------------------------
       LOAD DROPDOWN METADATA (/products/meta)
    ----------------------------------------- */
    const loadMeta = useCallback(async () => {
        try {
            const response = await fetch(`${API_BASE}/products/meta`);
            const result = await response.json();

            if (response.ok && result.data) {
                setMeta({
                    brands: result.data.brands || [],
                    categories: result.data.categories || [],
                    subcategories: result.data.subcategories || [],
                });
            }
        } catch (err) {
            console.error("Failed to load product metadata:", err);
        }
    }, []);

    useEffect(() => {
        loadMeta();
    }, [loadMeta]);

    /* -----------------------------------------
       SEARCH DEBOUNCE
    ----------------------------------------- */
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
            setPagination((previous) => ({
                ...previous,
                page: 1,
            }));
        }, 400);

        return () => clearTimeout(timer);
    }, [search]);

    /* -----------------------------------------
       LOAD PRODUCTS
    ----------------------------------------- */
    const loadProducts = useCallback(async () => {
        try {
            setLoading(true);
            setError("");

            const params = new URLSearchParams();
            params.set("page", pagination.page);
            params.set("limit", pagination.limit);
            params.set("sort", sort);
            params.set("order", order);

            if (debouncedSearch) params.set("search", debouncedSearch);
            if (brand) params.set("brand", brand);
            if (category) params.set("category", category);
            if (subcategory) params.set("subcategory", subcategory);
            if (status !== "") params.set("isActive", status);

            const response = await fetch(
                `${API_BASE}/products?${params.toString()}`
            );
            const result = await response.json();

            if (!response.ok) {
                throw new Error(
                    result.message || "Unable to load products"
                );
            }

            setProducts(result.data || []);
            setPagination((previous) => ({
                ...previous,
                ...(result.pagination || {}),
            }));
        } catch (err) {
            console.error(err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [
        pagination.page,
        pagination.limit,
        debouncedSearch,
        brand,
        category,
        subcategory,
        status,
        sort,
        order,
    ]);

    useEffect(() => {
        loadProducts();
    }, [loadProducts]);

    /* -----------------------------------------
       FILTER BAR OPTIONS FROM /meta
    ----------------------------------------- */
    const brandOptions = useMemo(
        () => meta.brands.map((b) => [b._id, b.name]),
        [meta.brands]
    );

    const categoryOptions = useMemo(
        () => meta.categories.map((c) => [c._id, c.name]),
        [meta.categories]
    );

    const subcategoryOptions = useMemo(() => {
        const list = category
            ? meta.subcategories.filter(
                (sub) => String(sub.category) === String(category)
            )
            : meta.subcategories;

        return list.map((sub) => [sub._id, sub.name]);
    }, [meta.subcategories, category]);

    /* -----------------------------------------
       STATUS UPDATE (ACTIVATE / DEACTIVATE)
    ----------------------------------------- */
    const changeProductStatus = async (product) => {
        try {
            setStatusUpdating(true);
            const response = await fetch(
                `${API_BASE}/products/${product._id}/status`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        isActive: !product.isActive,
                    }),
                }
            );

            const result = await response.json();

            if (!response.ok) {
                throw new Error(
                    result.message || "Unable to update status"
                );
            }

            // Update drawer and table state immediately
            setSelectedProduct(result.data);
            setProducts((prev) =>
                prev.map((item) =>
                    item._id === result.data._id ? result.data : item
                )
            );
        } catch (err) {
            alert(err.message);
        } finally {
            setStatusUpdating(false);
        }
    };

    /* -----------------------------------------
       EDIT SAVED
    ----------------------------------------- */
    const handleProductSaved = (updatedProduct) => {
        setEditingProduct(null);
        setSelectedProduct(updatedProduct);
        loadProducts();
    };

    /* -----------------------------------------
       RESET FILTERS
    ----------------------------------------- */
    const resetFilters = () => {
        setSearch("");
        setBrand("");
        setCategory("");
        setSubcategory("");
        setStatus("");

        setPagination((previous) => ({
            ...previous,
            page: 1,
        }));
    };

    const startItem =
        pagination.totalItems === 0
            ? 0
            : (pagination.page - 1) * pagination.limit + 1;

    const endItem = Math.min(
        pagination.page * pagination.limit,
        pagination.totalItems
    );

    return (
        <div className="min-h-screen bg-[#F6F7F9] text-slate-900">
            {/* HEADER */}
            <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-xl border-b border-slate-200">
                <div className="px-6 lg:px-8 h-[74px] flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center shadow-lg shadow-orange-500/20">
                            <Package className="text-white" size={22} />
                        </div>

                        <div>
                            <h1 className="font-black text-xl tracking-tight">
                                Surya Marketing
                            </h1>
                            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-orange-500">
                                Product Management
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={() => {
                            loadMeta();
                            loadProducts();
                        }}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-bold text-slate-600 hover:bg-slate-50"
                    >
                        <RefreshCw
                            size={15}
                            className={loading ? "animate-spin" : ""}
                        />
                        Refresh
                    </button>
                </div>
            </header>

            <main className="p-5 lg:p-8 max-w-[1700px] mx-auto space-y-6">
                {/* STATS */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <StatCard
                        label="Products"
                        value={pagination.totalItems}
                        icon={<Package size={20} />}
                    />
                    <StatCard
                        label="Current Page"
                        value={`${pagination.page} / ${pagination.totalPages}`}
                        icon={<Layers size={20} />}
                    />
                    <StatCard
                        label="Page Size"
                        value={pagination.limit}
                        icon={<SlidersHorizontal size={20} />}
                    />
                </div>

                {/* FILTERS */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
                    <div className="flex flex-col xl:flex-row gap-3">
                        <div className="relative flex-1 min-w-[240px]">
                            <Search
                                size={17}
                                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                            />

                            <input
                                value={search}
                                onChange={(event) =>
                                    setSearch(event.target.value)
                                }
                                placeholder="Search SKU or product title..."
                                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold outline-none focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10"
                            />
                        </div>

                        <FilterSelect
                            value={brand}
                            onChange={(value) => {
                                setBrand(value);
                                setPagination((previous) => ({
                                    ...previous,
                                    page: 1,
                                }));
                            }}
                            label="All Brands"
                            items={brandOptions}
                        />

                        <FilterSelect
                            value={category}
                            onChange={(value) => {
                                setCategory(value);
                                setSubcategory("");
                                setPagination((previous) => ({
                                    ...previous,
                                    page: 1,
                                }));
                            }}
                            label="All Categories"
                            items={categoryOptions}
                        />

                        <FilterSelect
                            value={subcategory}
                            onChange={(value) => {
                                setSubcategory(value);
                                setPagination((previous) => ({
                                    ...previous,
                                    page: 1,
                                }));
                            }}
                            label="All Subcategories"
                            items={subcategoryOptions}
                        />

                        <select
                            value={status}
                            onChange={(event) => {
                                setStatus(event.target.value);
                                setPagination((previous) => ({
                                    ...previous,
                                    page: 1,
                                }));
                            }}
                            className="px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm font-bold outline-none"
                        >
                            <option value="">All Status</option>
                            <option value="true">Active</option>
                            <option value="false">Inactive</option>
                        </select>

                        <button
                            onClick={resetFilters}
                            className="px-4 py-3 rounded-xl border border-slate-200 text-sm font-bold text-slate-500 hover:bg-slate-50"
                        >
                            Reset
                        </button>
                    </div>

                    {/* SORT BAR */}
                    <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t border-slate-100">
                        <select
                            value={sort}
                            onChange={(event) => setSort(event.target.value)}
                            className="px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs font-bold"
                        >
                            <option value="createdAt">Date Created</option>
                            <option value="updatedAt">Last Updated</option>
                            <option value="title">Product Title</option>
                            <option value="sku">SKU</option>
                            <option value="pricing.mrp">MRP</option>
                            <option value="pricing.netPrice">Net Price</option>
                        </select>

                        <select
                            value={order}
                            onChange={(event) => setOrder(event.target.value)}
                            className="px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs font-bold"
                        >
                            <option value="desc">Descending</option>
                            <option value="asc">Ascending</option>
                        </select>

                        <select
                            value={pagination.limit}
                            onChange={(event) =>
                                setPagination((previous) => ({
                                    ...previous,
                                    page: 1,
                                    limit: Number(event.target.value),
                                }))
                            }
                            className="px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs font-bold"
                        >
                            <option value={10}>10 / page</option>
                            <option value={15}>15 / page</option>
                            <option value={25}>25 / page</option>
                            <option value={50}>50 / page</option>
                        </select>
                    </div>
                </div>

                {/* TABLE */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    {error ? (
                        <div className="py-20 text-center">
                            <XCircle
                                size={42}
                                className="mx-auto text-red-400 mb-3"
                            />
                            <p className="font-black text-slate-800">
                                Unable to load products
                            </p>
                            <p className="text-sm text-slate-500 mt-1">
                                {error}
                            </p>
                        </div>
                    ) : loading ? (
                        <div className="py-24 flex flex-col items-center">
                            <Loader2 className="w-9 h-9 animate-spin text-orange-500" />
                            <p className="text-xs font-black uppercase tracking-widest text-slate-400 mt-4">
                                Loading Products
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-slate-50 border-b border-slate-200">
                                        <TableHead>Product</TableHead>
                                        <TableHead>Brand</TableHead>
                                        <TableHead>Category</TableHead>
                                        <TableHead>Subcategory</TableHead>
                                        <TableHead>Net Price</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead align="right">
                                            Action
                                        </TableHead>
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-slate-100">
                                    {products.map((product) => (
                                        <tr
                                            key={product._id}
                                            className="hover:bg-slate-50/70 transition"
                                        >
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3 min-w-[250px]">
                                                    <div className="w-12 h-12 border border-slate-200 rounded-xl bg-white flex items-center justify-center overflow-hidden">
                                                        {product.thumbnail
                                                            ?.url ? (
                                                            <img
                                                                src={
                                                                    product
                                                                        .thumbnail
                                                                        .url
                                                                }
                                                                alt={
                                                                    product.sku
                                                                }
                                                                className="w-full h-full object-contain p-1"
                                                            />
                                                        ) : (
                                                            <ImageIcon
                                                                size={18}
                                                                className="text-slate-300"
                                                            />
                                                        )}
                                                    </div>

                                                    <div>
                                                        <p className="font-black text-sm text-slate-900">
                                                            {product.sku}
                                                        </p>
                                                        <p className="text-xs text-slate-500 mt-1 line-clamp-1 max-w-[280px]">
                                                            {product.title}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>

                                            <TableCell>
                                                {getRelationName(product.brand)}
                                            </TableCell>

                                            <TableCell>
                                                {getRelationName(
                                                    product.category
                                                )}
                                            </TableCell>

                                            <TableCell>
                                                {getRelationName(
                                                    product.subcategory
                                                )}
                                            </TableCell>

                                            <td className="px-4 py-4">
                                                <span className="inline-flex items-center font-black text-sm text-slate-900">
                                                    <IndianRupee size={13} />
                                                    {formatPrice(
                                                        product.pricing
                                                            ?.netPrice
                                                    )}
                                                </span>
                                            </td>

                                            <td className="px-4 py-4">
                                                <StatusBadge
                                                    active={product.isActive}
                                                />
                                            </td>

                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    onClick={() =>
                                                        setSelectedProduct(
                                                            product
                                                        )
                                                    }
                                                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-slate-200 text-xs font-black text-slate-600 hover:border-orange-400 hover:text-orange-600 bg-white"
                                                >
                                                    View
                                                    <ChevronRight size={14} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}

                                    {products.length === 0 && (
                                        <tr>
                                            <td
                                                colSpan="7"
                                                className="py-20 text-center"
                                            >
                                                <Package
                                                    size={42}
                                                    className="mx-auto text-slate-300 mb-3"
                                                />
                                                <p className="font-bold text-slate-500">
                                                    No products found
                                                </p>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* PAGINATION */}
                    {!loading && !error && pagination.totalItems > 0 && (
                        <div className="flex flex-col sm:flex-row gap-4 sm:items-center justify-between px-6 py-4 border-t border-slate-200 bg-slate-50/50">
                            <p className="text-xs font-semibold text-slate-500">
                                Showing{" "}
                                <strong className="text-slate-900">
                                    {startItem}
                                </strong>{" "}
                                –{" "}
                                <strong className="text-slate-900">
                                    {endItem}
                                </strong>{" "}
                                of{" "}
                                <strong className="text-slate-900">
                                    {pagination.totalItems}
                                </strong>{" "}
                                products
                            </p>

                            <div className="flex items-center gap-2">
                                <button
                                    disabled={!pagination.hasPreviousPage}
                                    onClick={() =>
                                        setPagination((previous) => ({
                                            ...previous,
                                            page: previous.page - 1,
                                        }))
                                    }
                                    className="w-9 h-9 rounded-lg border border-slate-200 bg-white flex items-center justify-center disabled:opacity-30"
                                >
                                    <ChevronLeft size={16} />
                                </button>

                                <span className="px-4 py-2 text-xs font-black bg-white rounded-lg border border-slate-200">
                                    Page {pagination.page} of{" "}
                                    {pagination.totalPages}
                                </span>

                                <button
                                    disabled={!pagination.hasNextPage}
                                    onClick={() =>
                                        setPagination((previous) => ({
                                            ...previous,
                                            page: previous.page + 1,
                                        }))
                                    }
                                    className="w-9 h-9 rounded-lg border border-slate-200 bg-white flex items-center justify-center disabled:opacity-30"
                                >
                                    <ChevronRight size={16} />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </main>

            {/* PRODUCT DRAWER */}
            {selectedProduct && (
                <ProductSlideSheet
                    product={selectedProduct}
                    onClose={() => setSelectedProduct(null)}
                    onEdit={(prod) => setEditingProduct(prod)}
                    onStatusChange={changeProductStatus}
                    statusUpdating={statusUpdating}
                />
            )}

            {/* EDIT PRODUCT MODAL */}
            {editingProduct && (
                <EditProductModal
                    product={editingProduct}
                    meta={meta}
                    onClose={() => setEditingProduct(null)}
                    onSaved={handleProductSaved}
                />
            )}
        </div>
    );
}

/* =========================================================
   SMALL UI COMPONENTS
========================================================= */

const TableHead = ({ children, align }) => {
    return (
        <th
            className={`px-4 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 ${align === "right" ? "text-right" : ""
                }`}
        >
            {children}
        </th>
    );
};

const TableCell = ({ children }) => {
    return (
        <td className="px-4 py-4 text-sm font-semibold text-slate-600">
            {children}
        </td>
    );
};

const StatCard = ({ label, value, icon }) => {
    return (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
                {icon}
            </div>

            <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    {label}
                </p>
                <p className="text-xl font-black text-slate-900 mt-1">
                    {value}
                </p>
            </div>
        </div>
    );
};

const FilterSelect = ({ value, onChange, label, items }) => {
    return (
        <div className="relative">
            <select
                value={value}
                onChange={(event) => onChange(event.target.value)}
                className="appearance-none min-w-[165px] px-4 pr-9 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm font-bold text-slate-600 outline-none"
            >
                <option value="">{label}</option>
                {items.map(([id, name]) => (
                    <option key={id} value={id}>
                        {name}
                    </option>
                ))}
            </select>

            <ChevronDown
                size={14}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
        </div>
    );
};