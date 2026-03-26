import { useState, useEffect, useMemo } from "react";
import api from "../../services/api";
import { useToast } from "../../context/ToastContext";

// NEW: IN-DEPTH TECH DATA DICTIONARY
// NEW: IN-DEPTH TECH DATA DICTIONARY (WITH DROPDOWN ARRAYS)
const TECH_DICTIONARY = {
  phone: {
    keywords: ['phone', 'smartphone', 'mobile', 'cellphone'],
    brands: ['Apple', 'Samsung', 'Xiaomi', 'Oppo', 'Vivo', 'Huawei', 'Google', 'Sony'],
    specs: {
      'RAM': ['2GB', '3GB', '4GB', '6GB', '8GB', '12GB', '16GB', '24GB'],
      'Storage': ['32GB', '64GB', '128GB', '256GB', '512GB', '1TB'],
      'Chipset': ['Snapdragon 4 series', 'Snapdragon 6 series', 'Snapdragon 7 series', 'Snapdragon 8 series', 'Apple A series', 'MediaTek Helio', 'MediaTek Dimensity', 'Google Tensor'],
      'Screen Size': ['5.5"', '6.1"', '6.5"', '6.7"', '6.8"'],
      'Resolution': ['HD+', 'Full HD+', '2K', '4K'],
      'Refresh Rate': ['60Hz', '90Hz', '120Hz', '144Hz'],
      'Panel': ['LCD', 'IPS', 'OLED', 'AMOLED', 'LTPO'],
      'Main Camera': ['8MP', '12MP', '48MP', '50MP', '64MP', '108MP', '200MP'],
      'Zoom': ['No zoom', '2x optical', '3x optical', '5x optical', '10x optical'],
      'Video': ['1080p', '4K', '8K'],
      'Battery': ['3000mAh', '4000mAh', '4500mAh', '5000mAh', '6000mAh'],
      'Charging': ['10W', '18W', '25W', '33W', '45W', '65W', '120W'],
      'Connectivity': ['4G', '5G', 'WiFi 5', 'WiFi 6', 'WiFi 6E', 'WiFi 7', 'Bluetooth 5.0', 'Bluetooth 5.1', 'Bluetooth 5.2', 'Bluetooth 5.3', 'Bluetooth 5.4']
    }
  },
  watch: {
    keywords: ['watch', 'smartwatch', 'wearable', 'band'],
    brands: ['Apple', 'Samsung', 'Garmin', 'Huawei', 'Fitbit', 'Xiaomi'],
    specs: {
      'RAM': ['512MB', '1GB', '2GB', '4GB'],
      'Storage': ['4GB', '8GB', '16GB', '32GB'],
      'Battery': ['200mAh', '300mAh', '400mAh', '500mAh', '600mAh'],
      'Sensors': ['Heart rate', 'SpO2', 'ECG', 'Sleep tracking', 'GPS'],
      'Water Resistance': ['IP67', 'IP68', '5ATM', '10ATM']
    }
  },
  mouse: {
    keywords: ['mouse', 'mice'],
    brands: ['Logitech', 'SteelSeries', 'Corsair', 'Razer', 'Keychron', 'Akko', 'Apple'],
    specs: {
      'DPI': ['800', '1200', '1600', '3200', '6400', '12000', '16000', '26000'],
      'Polling Rate': ['125Hz', '250Hz', '500Hz', '1000Hz', '2000Hz', '4000Hz', '8000Hz'],
      'Connection': ['Wired', 'Wireless 2.4GHz', 'Bluetooth'],
      'Sensor': ['Optical', 'Laser']
    }
  },
  power: {
    keywords: ['battery', 'charger', 'cable', 'power bank', 'adapter'],
    brands: ['Anker', 'Baseus', 'UGREEN', 'Belkin', 'Samsung', 'Apple'],
    specs: {
      'Capacity': ['5000mAh', '10000mAh', '20000mAh', '30000mAh'],
      'Output': ['10W', '18W', '20W', '30W', '45W', '65W'],
      'Port': ['USB-A', 'USB-C', 'Lightning'],
      'Protocol': ['PD', 'QC', 'PPS']
    }
  },
  laptop: {
    keywords: ['laptop', 'pc', 'computer', 'macbook', 'desktop'],
    brands: ['Dell', 'HP', 'Lenovo', 'Asus', 'Acer', 'MSI', 'Razer', 'Apple'],
    specs: {
      'CPU': ['Intel i3', 'Intel i5', 'Intel i7', 'Intel i9', 'AMD Ryzen 3', 'AMD Ryzen 5', 'AMD Ryzen 7', 'AMD Ryzen 9', 'Apple M1', 'Apple M2', 'Apple M3'],
      'RAM': ['4GB', '8GB', '16GB', '32GB', '64GB'],
      'Storage': ['128GB SSD', '256GB SSD', '512GB SSD', '1TB SSD', '2TB SSD'],
      'GPU': ['Integrated', 'RTX 3050', 'RTX 3060', 'RTX 3070', 'RTX 3080', 'RTX 4060', 'RTX 4070', 'RTX 4080', 'RTX 4090'],
      'Screen Size': ['13"', '14"', '15.6"', '16"', '17"'],
      'Refresh Rate': ['60Hz', '120Hz', '144Hz', '165Hz', '240Hz']
    }
  },
  keyboard: {
    keywords: ['keyboard', 'mechanical keyboard'],
    brands: ['Keychron', 'Akko', 'Logitech', 'Razer', 'Corsair', 'SteelSeries', 'Redragon'],
    specs: {
      'Type': ['Membrane', 'Mechanical', 'Optical'],
      'Switch': ['Red', 'Blue', 'Brown', 'Black', 'Silver'],
      'Layout': ['100%', 'TKL (80%)', '75%', '65%', '60%'],
      'Connection': ['Wired', 'Wireless 2.4GHz', 'Bluetooth'],
      'Keycaps': ['ABS', 'PBT']
    }
  },
  audio: {
    keywords: ['headphone', 'earphone', 'speaker', 'audio', 'airpods', 'headset'],
    brands: ['Sony', 'Apple', 'Samsung', 'JBL', 'Marshall', 'Sennheiser', 'Bose'],
    specs: {
      'Driver Size': 'Ex: 10mm, 40mm...',
      'Battery Life': 'Ex: 5 hours, 20 hours...',
      'ANC': ['Yes', 'No'],
      'Connectivity': ['Bluetooth 5.3', '3.5mm Jack', 'Wireless']
    }
  }
};

const useManageProducts = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    category_id: "",
    stock_quantity: "0",
    image_url: "",
    keywords: "",      // MỚI
    description: "",   // MỚI
    sku: "",
    brand: "",
    discount_price: "",
    is_active: true,
    specifications: {}, // Đổi thành dạng Object
  });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // MỚI: State quản lý Popup và ô tìm kiếm Specs
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [specSearch, setSpecSearch] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);

  const { addToast } = useToast();

  useEffect(() => {
    fetchInitialData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);

  // MỚI: Logic tự động sinh SKU (6 ký tự: 2 chữ Tên + 1 chữ Specs + 3 ngẫu nhiên)
  useEffect(() => {
    // Chỉ tự động sinh SKU khi đang tạo mới sản phẩm
    if (!editingId && formData.name) {
      // 1. Lấy 2 ký tự đầu của tên sản phẩm (chỉ lấy chữ/số, bỏ khoảng trắng/kí tự đặc biệt)
      const namePrefix = formData.name.replace(/[^a-zA-Z0-9]/g, '').substring(0, 2).toUpperCase() || 'PR';

      // 2. Lấy 1 ký tự đầu của thông số Specs đầu tiên (nếu có)
      let specChar = 'X';
      const specValues = Object.values(formData.specifications || {});
      if (specValues.length > 0 && typeof specValues[0] === 'string' && specValues[0].length > 0) {
        specChar = specValues[0].replace(/[^a-zA-Z0-9]/g, '').substring(0, 1).toUpperCase() || 'X';
      }

      const targetPrefix = (namePrefix + specChar).padEnd(3, 'X');

      // 3. Chỉ sinh lại chuỗi random nếu Prefix bị đổi, tránh việc SKU nhảy liên tục khi Admin đang gõ phím
      if (!formData.sku || !formData.sku.startsWith(targetPrefix)) {
        const randomSuffix = Math.random().toString(36).substring(2, 5).toUpperCase();
        const generatedSku = (targetPrefix + randomSuffix).substring(0, 6);
        
        setFormData(prev => ({ ...prev, sku: generatedSku }));
      }
    }
  }, [formData.name, formData.specifications, editingId, formData.sku]);

  const fetchInitialData = async () => {
    try {
      const [catRes, prodRes] = await Promise.all([
        api.get("/categories"),
        api.get("/products", { params: { page: currentPage, per_page: 6 } }),
      ]);
      setCategories(catRes.data.categories || []);
      setProducts(prodRes.data.products || []);
      setTotalPages(prodRes.data.total_pages || 1);
    } catch (err) {
      addToast("Fetch error", "error");
    }
  };

  const initiateDelete = (id) => {
    setProductToDelete(id);
    setIsConfirmOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await api.delete(`/products/${productToDelete}`);
      setProducts(products.filter((p) => p.product_id !== productToDelete));
      addToast("Product deleted", "info");
    } catch (err) {
      addToast("Delete failed", "error");
    } finally {
      setIsConfirmOpen(false);
    }
  };

  const handleEdit = (p) => {
    setEditingId(p.product_id);
    setFormData({
      name: p.name,
      price: p.price.toString(),
      category_id: p.category_id.toString(),
      stock_quantity: p.stock_quantity.toString(),
      image_url: p.image_url || "",
      keywords: "",
      description: p.description || "",
      sku: p.sku || "",
      brand: p.brand || "",
      discount_price: p.discount_price ? p.discount_price.toString() : "",
      is_active: p.is_active ?? true,
      specifications: p.specifications || {},
    });
    setIsModalOpen(true); // MỚI: Mở modal thay vì scroll
  };

  // --- MỚI: CÁC HÀM QUẢN LÝ SPECIFICATIONS ---
  const handleAddSpec = (key) => {
    setFormData(prev => ({
      ...prev,
      specifications: { ...prev.specifications, [key]: "" }
    }));
  };

  const handleUpdateSpec = (key, value) => {
    setFormData(prev => ({
      ...prev,
      specifications: { ...prev.specifications, [key]: value }
    }));
  };

  const handleRemoveSpec = (key) => {
    setFormData(prev => {
      const newSpecs = { ...prev.specifications };
      delete newSpecs[key];
      return { ...prev, specifications: newSpecs };
    });
  };
  // ------------------------------------------

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      ...formData,
      price: parseFloat(formData.price),
      category_id: parseInt(formData.category_id),
      stock_quantity: parseInt(formData.stock_quantity),
      discount_price: formData.discount_price ? parseFloat(formData.discount_price) : null,
      specifications: formData.specifications // Truyền thẳng Object
    };

    try {
      if (editingId) {
        await api.put(`/products/${editingId}`, payload);
        addToast("Product updated!", "success");
      } else {
        await api.post("/products", payload);
        addToast("Product created!", "success");
      }
      resetForm();
      fetchInitialData();
      setIsModalOpen(false); // MỚI: Đóng modal sau khi thao tác thành công
    } catch (err) {
      addToast("Operation failed", "error");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      name: "",
      price: "",
      category_id: "",
      stock_quantity: "0",
      image_url: "",
      keywords: "",
      description: "",
      sku: "",
      brand: "",
      discount_price: "",
      is_active: true,
      specifications: {}, // Đổi thành dạng Object
    });
  };

  // MỚI: Hàm gọi AI sinh mô tả
  const handleGenerateDescription = async () => {
    if (!formData.name || !formData.category_id) {
      addToast("Please enter Product Name and select a Category first", "error");
      return;
    }
    setIsGenerating(true);
    addToast("AI is thinking... This might take a few seconds", "info");
    try {
      const selectedCategory = categories.find(c => c.category_id.toString() === formData.category_id.toString());
      
      const res = await api.post("/products/generate-description", {
        name: formData.name,
        category_name: selectedCategory?.name || "",
        keywords: formData.keywords,
        specifications: formData.specifications // MỚI: Truyền thêm thông số kỹ thuật cho AI
      });
      setFormData(prev => ({ ...prev, description: res.data.description }));
      addToast("Description generated successfully!", "success");
    } catch (err) {
      addToast(err.response?.data?.message || "Failed to generate description", "error");
    } finally {
      setIsGenerating(false);
    }
  };

  // NEW: Automatically analyze context to return appropriate Brand and Specs
  const availableContext = useMemo(() => {
    const catName = categories.find(c => c.category_id.toString() === formData.category_id.toString())?.name || "";
    const combinedText = `${catName} ${formData.name}`.toLowerCase();

    for (const [key, data] of Object.entries(TECH_DICTIONARY)) {
      if (data.keywords.some(kw => combinedText.includes(kw))) {
        return { brands: data.brands, specs: data.specs };
      }
    }
    
    // Default fallback if no category matches
    return {
      brands: ['Apple', 'Samsung', 'Xiaomi', 'Sony', 'Dell', 'HP', 'Lenovo', 'Asus', 'Logitech', 'Razer', 'Anker', 'Baseus', 'Other'],
      specs: {
         "Color": "Ex: Black, White, Silver...", 
         "Weight": "Ex: 1.5kg, 200g...", 
         "Dimensions": "Ex: Length x Width x Height...", 
         "Warranty": "Ex: 12 months, 24 months..."
      }
    };
  }, [formData.name, formData.category_id, categories]);

  // MỚI: Xử lý logic lọc danh sách Specs ngay trong Hook
  const filteredSpecs = useMemo(() => {
    const specKeys = Object.keys(availableContext.specs);
    return specKeys.filter(s => 
      s.toLowerCase().includes(specSearch.toLowerCase()) &&
      !Object.keys(formData.specifications || {}).includes(s)
    );
  }, [availableContext.specs, specSearch, formData.specifications]);

  return {
    products,
    categories,
    formData,
    setFormData,
    editingId,
    loading,
    currentPage,
    setCurrentPage,
    totalPages,
    isConfirmOpen,
    setIsConfirmOpen,
    initiateDelete,
    confirmDelete,
    handleEdit,
    handleSubmit,
    resetForm,
    handleGenerateDescription,
    isGenerating, // Thêm isGenerating để tránh lỗi bên giao diện
    handleAddSpec,
    handleUpdateSpec,
    handleRemoveSpec,
    availableContext, // Trả về context để giao diện sử dụng
    isModalOpen,
    setIsModalOpen,
    specSearch,
    setSpecSearch,
    filteredSpecs
  };
};

export default useManageProducts;