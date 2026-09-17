import React, { useState, useMemo, useEffect } from 'react';
import { Search, X, Layers, Tag, ChevronRight, ChevronLeft, Edit2, Trash2, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { read, utils } from 'xlsx';

// --- PRODUCT DETAILS SLIDE-IN COMPONENT ---
const ProductSlideSheet = ({ product, onClose }) => {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  
  // Safely grab images or fallback
  const availableImages = useMemo(() => {
    const imgs = [product['Thumbnail URL'], product['Image 1 URL'], product['Image 2 URL']].filter(Boolean);
    return imgs.length > 0 ? imgs : ["https://placehold.co/600x600?text=No+Image"];
  }, [product]);

  useEffect(() => { setActiveImageIndex(0); }, [product]);

  const sku = product.SKU || product.MODEL || 'N/A';
  const brand = product.Brand || 'LG';
  const category = product.Category || product.PRODUCT || 'N/A';
  const mrp = product.MRP || 0;
  const dp = product['DP (Dealer Price)'] || product.DP || 0;
  const netPrice = product['Net Price'] || product['net price'] || 0;
  const status = product.Status || 'Approved';

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-sm transition-opacity">
      <div className="w-full max-w-md bg-[#F8FAFC] h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        
        {/* Header */}
        <div className="flex justify-between items-start p-6 border-b border-gray-200/60 sticky top-0 bg-white/80 backdrop-blur-xl z-10">
          <div className="pr-4">
            <h2 className="text-xl font-black text-slate-900 leading-tight tracking-tight">{product.Title || `${brand} ${category} - ${sku}`}</h2>
            <div className="flex items-center gap-3 mt-1.5">
              <p className="text-xs font-bold text-surya-500 uppercase tracking-widest">{sku}</p>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                status === 'Approved' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
              }`}>
                {status}
              </span>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-800 bg-white hover:bg-slate-100 p-2 rounded-full border border-slate-200 shadow-sm shrink-0 transition-all duration-200 hover:rotate-90">
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          <div className="bg-white rounded-2xl p-4 border border-slate-200/60 shadow-sm space-y-4">
            <div className="bg-slate-50 rounded-xl overflow-hidden flex justify-center items-center h-64 relative group border border-slate-100 p-4">
              <img src={availableImages[activeImageIndex]} alt={sku} className="max-h-full max-w-full object-contain mix-blend-multiply transition-transform duration-500 group-hover:scale-105" />
            </div>
            {availableImages.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                {availableImages.map((imgUrl, idx) => (
                  <button 
                    key={idx} onClick={() => setActiveImageIndex(idx)}
                    className={`relative w-16 h-16 rounded-lg overflow-hidden shrink-0 border-2 transition-all ${
                      activeImageIndex === idx ? 'border-surya-500 shadow-md' : 'border-slate-200 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={imgUrl} className="w-full h-full object-cover bg-white" alt={`View ${idx + 1}`} />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-2.5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200/60 text-xs font-bold text-slate-700 shadow-sm"><Tag className="w-3.5 h-3.5 text-surya-500" /> {brand}</span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200/60 text-xs font-bold text-slate-700 shadow-sm"><Layers className="w-3.5 h-3.5 text-surya-500" /> {category}</span>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden relative">
            <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-surya-400 to-surya-600"></div>
            <div className="bg-slate-50/50 px-5 py-3 border-b border-slate-100 flex items-center gap-2">
              <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Financial Overview</span>
            </div>
            <div className="p-5 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-semibold text-slate-500">Maximum Retail Price</span>
                <span className="font-bold text-slate-400 line-through">₹{Number(mrp).toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-semibold text-slate-700">Dealer Price (DP)</span>
                <span className="font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">₹{Number(dp).toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-end pt-4 border-t border-slate-100">
                <div>
                  <span className="block text-xs font-bold text-surya-500 uppercase tracking-wider mb-1">Final Net Price</span>
                  <span className="text-2xl font-black text-slate-900 tracking-tight">₹{Number(netPrice).toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM ACTION BAR */}
        <div className="p-4 border-t border-slate-200 bg-white flex gap-3">
          <button className="flex-1 flex justify-center items-center gap-2 bg-red-50 text-red-600 hover:bg-red-100 py-3 rounded-xl text-sm font-bold transition-colors">
            <Trash2 size={16} /> Delete
          </button>
          <button className="flex-1 flex justify-center items-center gap-2 bg-surya-50 text-surya-600 hover:bg-surya-500 hover:text-white py-3 rounded-xl text-sm font-bold transition-all border border-surya-500/20">
            <Edit2 size={16} /> Edit Product
          </button>
        </div>
      </div>
    </div>
  );
};

// --- MAIN APP COMPONENT ---
export default function App() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filtering States
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedSubcategory, setSelectedSubcategory] = useState('All');
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  // Load Excel File
  useEffect(() => {
    const loadExcel = async () => {
      try {
        const response = await fetch('/Surya_Final_Master_With_Images.xlsx'); 
        const arrayBuffer = await response.arrayBuffer();
        const workbook = read(arrayBuffer, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const excelData = utils.sheet_to_json(workbook.Sheets[firstSheetName], { defval: "" });
        
        const cleanedData = excelData.filter(row => row.SKU || row.MODEL);
        setData(cleanedData);
      } catch (error) {
        console.error("Error loading Excel:", error);
      } finally {
        setLoading(false);
      }
    };
    loadExcel();
  }, []);

  const categories = useMemo(() => {
    const cats = data.map(p => p.Category || p.PRODUCT).filter(Boolean);
    return ['All', ...new Set(cats)];
  }, [data]);

  const subcategories = useMemo(() => {
    const subcats = data
      .filter(p => selectedCategory === 'All' || (p.Category || p.PRODUCT) === selectedCategory)
      .map(p => p.Subcategory || p.SEGMENT)
      .filter(Boolean);
    return ['All', ...new Set(subcats)];
  }, [data, selectedCategory]);

  // Reset to page 1 whenever filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory, selectedSubcategory]);

  // Apply Search & Filters
  const filteredData = useMemo(() => {
    return data.filter(product => {
      const sku = (product.SKU || product.MODEL || "").toLowerCase();
      const title = (product.Title || "").toLowerCase();
      const cat = product.Category || product.PRODUCT;
      const subcat = product.Subcategory || product.SEGMENT;
      
      const matchesSearch = sku.includes(searchTerm.toLowerCase()) || title.includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || cat === selectedCategory;
      const matchesSubcategory = selectedSubcategory === 'All' || subcat === selectedSubcategory;
      
      return matchesSearch && matchesCategory && matchesSubcategory;
    });
  }, [searchTerm, selectedCategory, selectedSubcategory, data]);

  // Calculate Pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredData, currentPage]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8FAFC]">
        <Loader2 className="w-10 h-10 text-surya-500 animate-spin mb-4" />
        <p className="text-slate-500 font-bold uppercase tracking-widest text-sm">Loading Excel Database...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] font-sans h-screen overflow-hidden selection:bg-surya-500/30">
      
      <header className="bg-white/80 backdrop-blur-xl border-b border-slate-200/80 px-8 py-4 flex items-center justify-between shrink-0 z-10 sticky top-0">
        <div className="flex items-center gap-5">
          <img src="/Surya Logo file.png" alt="Surya" className="h-10 object-contain drop-shadow-sm" />
          <div className="hidden md:flex flex-col border-l-2 border-slate-200 pl-5">
            <h1 className="text-xl font-black text-slate-900 tracking-tight">Data Center</h1>
            <p className="text-[10px] text-surya-500 font-black uppercase tracking-widest mt-0.5">Inventory Master</p>
          </div>
        </div>
      </header>

      <main className="flex-1 p-6 md:p-8 overflow-y-auto flex flex-col space-y-6">
        
        {/* FILTER BAR */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-4 shrink-0 flex flex-wrap gap-4 items-center justify-between transition-all hover:shadow-md">
          <div className="flex flex-wrap items-center gap-4 flex-1">
            <div className="relative flex-1 min-w-[250px] max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
              <input 
                type="text" placeholder="Search by SKU or Title..." 
                className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white focus:border-surya-500 focus:ring-4 focus:ring-surya-500/10 text-sm font-medium transition-all"
                value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select 
              className="py-2.5 px-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-surya-500 focus:ring-4 focus:ring-surya-500/10 text-sm text-slate-700 font-bold cursor-pointer transition-all min-w-[150px]"
              value={selectedCategory} 
              onChange={(e) => { setSelectedCategory(e.target.value); setSelectedSubcategory('All'); }}
            >
              {categories.map(cat => <option key={cat} value={cat}>{cat === 'All' ? 'All Categories' : cat}</option>)}
            </select>
            <select 
              className="py-2.5 px-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-surya-500 focus:ring-4 focus:ring-surya-500/10 text-sm text-slate-700 font-bold cursor-pointer transition-all min-w-[150px]"
              value={selectedSubcategory} onChange={(e) => setSelectedSubcategory(e.target.value)}
              disabled={selectedCategory === 'All' && subcategories.length <= 1}
            >
              {subcategories.map(sub => <option key={sub} value={sub}>{sub === 'All' ? 'All Sub-Groups' : sub}</option>)}
            </select>
          </div>
        </div>

        {/* MODERN TABLE WITH PAGINATION */}
        <div className="flex flex-col bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden flex-1 min-h-[500px]">
          <div className="flex-1 overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="py-4 px-6 w-10"><input type="checkbox" className="rounded text-surya-500 focus:ring-surya-500" /></th>
                  <th className="py-4 px-4 text-[11px] font-black text-slate-500 uppercase tracking-wider">SKU No</th>
                  <th className="py-4 px-4 text-[11px] font-black text-slate-500 uppercase tracking-wider">Brand</th>
                  <th className="py-4 px-4 text-[11px] font-black text-slate-500 uppercase tracking-wider">Product Group</th>
                  <th className="py-4 px-4 text-[11px] font-black text-slate-500 uppercase tracking-wider">Sub Group</th>
                  <th className="py-4 px-4 text-[11px] font-black text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="py-4 px-6 text-[11px] font-black text-slate-500 uppercase tracking-wider text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedData.map((product, idx) => {
                  const sku = product.SKU || product.MODEL || 'N/A';
                  const brand = product.Brand || 'LG';
                  const cat = product.Category || product.PRODUCT || 'N/A';
                  const subcat = product.Subcategory || product.SEGMENT || 'N/A';
                  const status = product.Status || 'Approved';
                  const thumb = product['Thumbnail URL'] || "https://placehold.co/100x100?text=No+Img";

                  return (
                    <tr key={idx} className="hover:bg-slate-50/80 transition-colors group">
                      <td className="py-3 px-6"><input type="checkbox" className="rounded text-surya-500 focus:ring-surya-500 border-slate-300" /></td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img src={thumb} alt="sku" className="w-10 h-10 rounded border border-slate-200 object-contain p-0.5 bg-white mix-blend-multiply" />
                          <span className="font-bold text-slate-800 text-sm group-hover:text-surya-600 transition-colors">{sku}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm font-semibold text-slate-600">{brand}</td>
                      <td className="py-3 px-4 text-sm font-semibold text-slate-600">{cat}</td>
                      <td className="py-3 px-4 text-sm font-semibold text-slate-600">{subcat}</td>
                      <td className="py-3 px-4">
                        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${
                          status === 'Approved' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-red-50 text-red-600 border-red-100'
                        }`}>
                          {status === 'Approved' ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                          {status}
                        </div>
                      </td>
                      <td className="py-3 px-6 text-right">
                        <button 
                          onClick={() => setSelectedProduct(product)}
                          className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 font-bold text-xs hover:border-surya-500 hover:text-surya-600 shadow-sm transition-all"
                        >
                          View <ChevronRight size={14} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {paginatedData.length === 0 && (
                  <tr>
                    <td colSpan="7" className="py-16 text-center text-slate-500 font-semibold">No products found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* PAGINATION CONTROLS */}
          {filteredData.length > 0 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 bg-slate-50/50 shrink-0">
              <div className="text-xs font-semibold text-slate-500">
                Showing <span className="font-bold text-slate-800">{((currentPage - 1) * itemsPerPage) + 1}</span> to <span className="font-bold text-slate-800">{Math.min(currentPage * itemsPerPage, filteredData.length)}</span> of <span className="font-bold text-slate-800">{filteredData.length}</span> entries
              </div>
              
              <div className="flex items-center gap-3">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  className="p-2 rounded-lg border border-slate-200 bg-white text-slate-600 disabled:opacity-40 hover:bg-slate-50 hover:text-surya-600 transition-colors shadow-sm"
                >
                  <ChevronLeft size={16} />
                </button>
                
                <span className="text-xs font-bold text-slate-700 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm">
                  Page {currentPage} of {totalPages}
                </span>
                
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  className="p-2 rounded-lg border border-slate-200 bg-white text-slate-600 disabled:opacity-40 hover:bg-slate-50 hover:text-surya-600 transition-colors shadow-sm"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {selectedProduct && <ProductSlideSheet product={selectedProduct} onClose={() => setSelectedProduct(null)} />}
    </div>
  );
}