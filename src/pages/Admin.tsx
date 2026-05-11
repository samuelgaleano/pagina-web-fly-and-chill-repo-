import { useState, useRef, useEffect } from "react";
import { useShop } from "@/context/ShopContext";
import { Button } from "@/components/ui/Button";
import { db, handleFirestoreError, OperationType } from "@/lib/firebase";
import { collection, doc, deleteDoc, addDoc, updateDoc, setDoc, onSnapshot, query, orderBy, writeBatch } from "firebase/firestore";
import { Plus, Edit2, Trash2, X, Save, Package, Image as ImageIcon, Tag, Beaker, DollarSign, FileText, Upload, Loader2, Ticket, LayoutDashboard, Users } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { formatPrice } from "@/lib/formatters";
import { Product, PromoCode } from "@/types";

interface Lead {
  id: string;
  email: string;
  signupDate: any;
  source: string;
  status: string;
}

export function Admin() {
  const { products, loading, isAdmin } = useShop();
  const [activeTab, setActiveTab] = useState<"products" | "promoCodes" | "leads" | "orders">("products");
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loadingPromo, setLoadingPromo] = useState(true);
  const [loadingLeads, setLoadingLeads] = useState(true);
  const [loadingOrders, setLoadingOrders] = useState(true);
  
  const [isEditing, setIsEditing] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<Partial<Product> | null>(null);
  
  const [isEditingPromo, setIsEditingPromo] = useState(false);
  const [currentPromo, setCurrentPromo] = useState<Partial<PromoCode> | null>(null);

  const [isEditingOrder, setIsEditingOrder] = useState(false);
  const [currentOrder, setCurrentOrder] = useState<any | null>(null);
  const [paymentLinkInput, setPaymentLinkInput] = useState("");

  const [uploading, setUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [imageUrlInput, setImageUrlInput] = useState("");

  // Custom Modal States
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    confirmText?: string;
    type?: 'danger' | 'primary';
  }>({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
  });

  const [notification, setNotification] = useState<{
    message: string;
    type: 'success' | 'error';
  } | null>(null);

  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  useEffect(() => {
    if (!isAdmin) return;
    
    const q = query(collection(db, "promoCodes"), orderBy("code", "asc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const codes = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as PromoCode));
      setPromoCodes(codes);
      setLoadingPromo(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, "promoCodes");
      setLoadingPromo(false);
    });

    return () => unsubscribe();
  }, [isAdmin]);

  useEffect(() => {
    if (!isAdmin) return;
    
    const q = query(collection(db, "leads"), orderBy("signupDate", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const leadData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Lead));
      setLeads(leadData);
      setLoadingLeads(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, "leads");
      setLoadingLeads(false);
    });

    return () => unsubscribe();
  }, [isAdmin]);

  useEffect(() => {
    if (!isAdmin) return;
    
    const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const orderData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setOrders(orderData);
      setLoadingOrders(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, "orders");
      setLoadingOrders(false);
    });

    return () => unsubscribe();
  }, [isAdmin]);

  const addImageUrl = () => {
    if (!imageUrlInput.trim() || !currentProduct) return;
    const newImages = [...(currentProduct.images || []), imageUrlInput.trim()];
    if (newImages.length > 6) {
      showNotification('Máximo 6 imágenes por producto.', 'error');
      return;
    }
    setCurrentProduct({ ...currentProduct, images: newImages });
    setImageUrlInput("");
  };
  const [flavorInput, setFlavorInput] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-brand-black flex items-center justify-center pt-32">
        <div className="text-center">
          <h2 className="text-3xl font-heading font-black text-white uppercase mb-4">Acceso Denegado</h2>
          <p className="text-gray-400">No tienes permisos para acceder a esta sección.</p>
        </div>
      </div>
    );
  }

  const handleSyncWithCatalog = () => {
    setConfirmModal({
      isOpen: true,
      title: "Sincronizar con Código",
      message: "Esta acción ELIMINARÁ todos los productos actuales en la base de datos y los reemplazará con los productos definidos en el código (Catálogo Oficial). ¿Deseas continuar?",
      confirmText: "Sincronizar",
      type: 'danger',
      onConfirm: async () => {
        setIsSyncing(true);
        try {
          const { products: staticProducts } = await import("@/data/products");
          const batch = writeBatch(db);
          
          // Delete existing products from the current state (which comes from Firestore)
          products.forEach(p => {
            batch.delete(doc(db, "products", p.id));
          });
          
          // Add static products
          staticProducts.forEach(p => {
            const docRef = doc(collection(db, "products"), p.id);
            batch.set(docRef, p);
          });
          
          await batch.commit();
          showNotification("Catálogo sincronizado correctamente");
        } catch (error) {
          console.error("Sync error:", error);
          showNotification("Error al sincronizar el catálogo", "error");
        } finally {
          setIsSyncing(false);
          setConfirmModal(prev => ({ ...prev, isOpen: false }));
        }
      }
    });
  };

  const handleEdit = (product: Product) => {
    // Create a deep copy to ensure editing one doesn't affect others in the UI
    setCurrentProduct(JSON.parse(JSON.stringify(product)));
    setIsEditing(true);
  };

  const handleAddNew = () => {
    setCurrentProduct({
      name: "",
      price: 0,
      description: "",
      images: [],
      category: "Desechables",
      flavors: ["Natural"],
      stock: 10,
      cbdContent: "Premium",
      rating: 5,
      isFeatured: false,
    });
    setFlavorInput("");
    setIsEditing(true);
  };

  const compressImage = (file: File): Promise<Blob> => {
    console.log("Compressing image:", file.name);
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          console.log("Image loaded for compression:", img.width, "x", img.height);
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          // Optimized dimensions for e-commerce
          const MAX_WIDTH = 1000;
          const MAX_HEIGHT = 1000;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          
          if (ctx) {
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            ctx.drawImage(img, 0, 0, width, height);
          }

          canvas.toBlob(
            (blob) => {
              if (blob) {
                console.log("Compression complete:", blob.size, "bytes");
                resolve(blob);
              } else {
                reject(new Error('Canvas to Blob failed'));
              }
            },
            'image/webp',
            0.75
          );
        };
        img.onerror = (err) => {
          console.error("Image load error:", err);
          reject(new Error("Failed to load image for compression"));
        };
      };
      reader.onerror = (error) => {
        console.error("FileReader error:", error);
        reject(error);
      };
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !currentProduct) return;

    console.log("Files selected:", files.length);

    const newImages = [...(currentProduct.images || [])];
    
    if (newImages.length + files.length > 6) {
      showNotification('Máximo 6 imágenes por producto.', 'error');
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (!file.type.startsWith('image/')) {
          console.warn("Skipping non-image file:", file.name);
          continue;
        }

        console.log("Processing file:", file.name);
        const compressedBlob = await compressImage(file);
        
        // Convert to Base64 for high reliability in previewer
        const reader = new FileReader();
        const base64Promise = new Promise<string>((resolve) => {
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(compressedBlob);
        });
        
        const base64String = await base64Promise;
        console.log("Image converted to Base64, size:", base64String.length);
        
        newImages.push(base64String);
        setUploadProgress(((i + 1) / files.length) * 100);
      }
      
      setCurrentProduct({ ...currentProduct, images: newImages });
      setUploading(false);
      console.log("All images processed locally");
    } catch (error) {
      console.error("Processing error:", error);
      showNotification(`Error al procesar las imágenes: ${error instanceof Error ? error.message : String(error)}`, 'error');
      setUploading(false);
    }
  };

  const removeImage = (index: number) => {
    if (!currentProduct || !currentProduct.images) return;
    const newImages = [...currentProduct.images];
    newImages.splice(index, 1);
    setCurrentProduct({ ...currentProduct, images: newImages });
  };

  const addFlavor = (e: React.KeyboardEvent) => {
    if ((e.key === 'Enter' || e.key === ',') && flavorInput.trim()) {
      e.preventDefault();
      const newFlavor = flavorInput.trim().replace(/,$/, '');
      if (newFlavor && !currentProduct.flavors.includes(newFlavor)) {
        setCurrentProduct({
          ...currentProduct,
          flavors: [...currentProduct.flavors, newFlavor]
        });
      }
      setFlavorInput("");
    }
  };

  const removeFlavor = (index: number) => {
    const newFlavors = [...currentProduct.flavors];
    newFlavors.splice(index, 1);
    setCurrentProduct({ ...currentProduct, flavors: newFlavors });
  };

  const handleDelete = (id: string) => {
    setConfirmModal({
      isOpen: true,
      title: "Eliminar Producto",
      message: "¿Estás seguro de que quieres eliminar este producto? Esta acción no se puede deshacer.",
      confirmText: "Eliminar",
      type: 'danger',
      onConfirm: async () => {
        try {
          await deleteDoc(doc(db, "products", id));
          showNotification("Producto eliminado correctamente");
        } catch (error) {
          handleFirestoreError(error, OperationType.DELETE, `products/${id}`);
          showNotification("Error al eliminar el producto", "error");
        }
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  const handleAddNewPromo = () => {
    setCurrentPromo({
      code: "",
      discountType: "percentage",
      discountValue: 0,
      isActive: true,
      usageCount: 0
    });
    setIsEditingPromo(true);
  };

  const handleEditPromo = (promo: PromoCode) => {
    setCurrentPromo({ ...promo });
    setIsEditingPromo(true);
  };

  const handleDeletePromo = (id: string) => {
    setConfirmModal({
      isOpen: true,
      title: "Eliminar Código",
      message: "¿Estás seguro de que quieres eliminar este código promocional?",
      confirmText: "Eliminar",
      type: 'danger',
      onConfirm: async () => {
        try {
          await deleteDoc(doc(db, "promoCodes", id));
          showNotification("Código promocional eliminado");
        } catch (error) {
          handleFirestoreError(error, OperationType.DELETE, `promoCodes/${id}`);
          showNotification("Error al eliminar el código", "error");
        }
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  const handleSubmitPromo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPromo || !currentPromo.code) return;

    setConfirmModal({
      isOpen: true,
      title: "Guardar Código",
      message: "¿Deseas guardar los cambios en este código promocional?",
      confirmText: "Guardar",
      type: 'primary',
      onConfirm: async () => {
        setIsSaving(true);
        try {
          const promoData = {
            ...currentPromo,
            code: currentPromo.code.toUpperCase().trim()
          };

          if (currentPromo.id) {
            await updateDoc(doc(db, "promoCodes", currentPromo.id), promoData as any);
          } else {
            const docRef = await addDoc(collection(db, "promoCodes"), promoData as any);
            await updateDoc(docRef, { id: docRef.id });
          }
          
          setIsEditingPromo(false);
          setCurrentPromo(null);
          showNotification("Código promocional guardado con éxito");
        } catch (error) {
          handleFirestoreError(error, OperationType.WRITE, "promoCodes");
          showNotification("Error al guardar el código", "error");
        } finally {
          setIsSaving(false);
          setConfirmModal(prev => ({ ...prev, isOpen: false }));
        }
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentProduct || !currentProduct.images || currentProduct.images.length === 0) {
      showNotification("Por favor, sube al menos una imagen para el producto.", "error");
      return;
    }

    setConfirmModal({
      isOpen: true,
      title: "Guardar Producto",
      message: "¿Deseas guardar los cambios realizados en este producto?",
      confirmText: "Guardar",
      type: 'primary',
      onConfirm: async () => {
        setIsSaving(true);
        try {
          if (currentProduct.id) {
            await setDoc(doc(db, "products", currentProduct.id), currentProduct as any, { merge: true });
          } else {
            const docRef = await addDoc(collection(db, "products"), currentProduct as any);
            await updateDoc(docRef, { id: docRef.id });
          }
          
          setIsEditing(false);
          setCurrentProduct(null);
          showNotification("Producto guardado correctamente");
        } catch (error) {
          handleFirestoreError(error, OperationType.WRITE, "products");
          showNotification("Error al guardar el producto", "error");
        } finally {
          setIsSaving(false);
          setConfirmModal(prev => ({ ...prev, isOpen: false }));
        }
      }
    });
  };

  const handleUpdateOrder = async (orderId: string, updates: any) => {
    try {
      await updateDoc(doc(db, "orders", orderId), updates);
      showNotification("Pedido actualizado correctamente");
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `orders/${orderId}`);
      showNotification("Error al actualizar el pedido", "error");
    }
  };

  const handleSendPaymentLink = async (order: any) => {
    if (!paymentLinkInput.trim()) return;
    
    try {
      await updateDoc(doc(db, "orders", order.id), {
        paymentLink: paymentLinkInput.trim(),
        status: "pending" // Ensure it's pending if link is sent
      });
      
      // In a real app, you'd trigger an email here too
      showNotification("Link de pago guardado y listo para enviar");
      setIsEditingOrder(false);
      setPaymentLinkInput("");
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `orders/${order.id}`);
      showNotification("Error al guardar el link de pago", "error");
    }
  };

  const handleDeleteOrder = (id: string) => {
    setConfirmModal({
      isOpen: true,
      title: "Eliminar Pedido",
      message: "¿Estás seguro de que quieres eliminar este pedido? Esta acción no se puede deshacer.",
      confirmText: "Eliminar",
      type: 'danger',
      onConfirm: async () => {
        try {
          await deleteDoc(doc(db, "orders", id));
          showNotification("Pedido eliminado correctamente");
        } catch (error) {
          handleFirestoreError(error, OperationType.DELETE, `orders/${id}`);
          showNotification("Error al eliminar el pedido", "error");
        }
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  return (
    <div className="bg-brand-black min-h-screen pt-32 pb-24 text-white">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
          <div>
            <h1 className="text-4xl md:text-6xl font-heading font-black uppercase tracking-tighter">
              Panel de <span className="text-brand-primary italic serif font-light lowercase">Control</span>
            </h1>
            <p className="text-gray-400 mt-2 uppercase tracking-widest text-[10px] font-bold">Gestión de Inventario Elite</p>
          </div>
          
          <div className="flex flex-wrap gap-4">
            <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10">
              <button 
                onClick={() => setActiveTab("products")}
                className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === "products" ? "bg-brand-primary text-brand-black shadow-lg" : "text-gray-400 hover:text-white"}`}
              >
                <LayoutDashboard className="w-3 h-3" />
                Productos
              </button>
              <button 
                onClick={() => setActiveTab("promoCodes")}
                className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === "promoCodes" ? "bg-brand-primary text-brand-black shadow-lg" : "text-gray-400 hover:text-white"}`}
              >
                <Ticket className="w-3 h-3" />
                Códigos Promo
              </button>
              <button 
                onClick={() => setActiveTab("leads")}
                className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === "leads" ? "bg-brand-primary text-brand-black shadow-lg" : "text-gray-400 hover:text-white"}`}
              >
                <Users className="w-3 h-3" />
                Leads
              </button>
              <button 
                onClick={() => setActiveTab("orders")}
                className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === "orders" ? "bg-brand-primary text-brand-black shadow-lg" : "text-gray-400 hover:text-white"}`}
              >
                <Package className="w-3 h-3" />
                Pedidos
              </button>
            </div>

            {activeTab === "products" ? (
              <div className="flex gap-4">
                <Button 
                  onClick={handleSyncWithCatalog}
                  disabled={isSyncing}
                  variant="outline"
                  className="border-brand-primary/30 text-brand-primary/70 hover:text-brand-primary hover:border-brand-primary rounded-2xl px-6 py-6 text-[10px] font-black uppercase tracking-widest flex items-center gap-3 transition-all"
                >
                  {isSyncing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Sincronizar Catálogo
                </Button>
                <Button 
                  onClick={handleAddNew}
                  className="bg-brand-primary text-brand-black hover:bg-white rounded-2xl px-8 py-6 text-xs font-black uppercase tracking-widest flex items-center gap-3"
                >
                  <Plus className="w-4 h-4" />
                  Nuevo Producto
                </Button>
              </div>
            ) : activeTab === "promoCodes" ? (
              <Button 
                onClick={handleAddNewPromo}
                className="bg-brand-primary text-brand-black hover:bg-white rounded-2xl px-8 py-6 text-xs font-black uppercase tracking-widest flex items-center gap-3"
              >
                <Plus className="w-4 h-4" />
                Nuevo Código
              </Button>
            ) : null}
          </div>
        </div>

        {activeTab === "products" ? (
          loading ? (
            <div className="text-center py-20 animate-pulse text-brand-primary font-black uppercase tracking-widest">
              Sincronizando productos...
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {products.map((product) => (
                <div key={product.id} className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 hover:border-brand-primary/30 transition-all group">
                  <div className="flex gap-6 mb-6">
                    <div className="w-24 h-24 bg-white/10 rounded-2xl overflow-hidden shrink-0">
                      <img src={product.images[0]} alt={product.name} className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                    </div>
                    <div className="flex-grow">
                      <h3 className="text-xl font-heading font-black uppercase tracking-tighter leading-tight mb-2 group-hover:text-brand-primary transition-colors">
                        {product.name}
                      </h3>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1 text-brand-primary font-bold text-sm">
                          <DollarSign className="w-3 h-3" />
                          {formatPrice(product.price)}
                        </div>
                        {product.isFeatured && (
                          <span className="bg-brand-primary/20 text-brand-primary text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-full border border-brand-primary/30">
                            Destacado
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="bg-white/5 rounded-xl p-3 border border-white/5">
                      <div className="text-[8px] text-gray-500 uppercase font-black tracking-widest mb-1">Stock</div>
                      <div className={`text-sm font-black ${product.stock < 5 ? "text-brand-secondary" : "text-white"}`}>
                        {product.stock} unidades
                      </div>
                    </div>
                    <div className="bg-white/5 rounded-xl p-3 border border-white/5">
                      <div className="text-[8px] text-gray-500 uppercase font-black tracking-widest mb-1">Categoría</div>
                      <div className="text-sm font-black truncate">{product.category}</div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button 
                      onClick={() => handleEdit(product)}
                      variant="outline"
                      className="flex-1 bg-white/5 border-white/10 hover:bg-white/10 text-[10px] font-black uppercase tracking-widest py-4 rounded-2xl"
                    >
                      <Edit2 className="w-3 h-3 mr-2" />
                      Editar
                    </Button>
                    <Button 
                      onClick={() => handleDelete(product.id)}
                      variant="outline"
                      className="flex-1 bg-brand-secondary/10 border-brand-secondary/20 text-brand-secondary hover:bg-brand-secondary hover:text-white text-[10px] font-black uppercase tracking-widest py-4 rounded-2xl"
                    >
                      <Trash2 className="w-3 h-3 mr-2" />
                      Borrar
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : activeTab === "promoCodes" ? (
          loadingPromo ? (
            <div className="text-center py-20 animate-pulse text-brand-primary font-black uppercase tracking-widest">
              Sincronizando códigos...
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {promoCodes.map((promo) => (
                <div key={promo.id} className="bg-white/5 border border-white/10 rounded-3xl p-6 hover:border-brand-primary/30 transition-all">
                  <div className="flex justify-between items-start mb-4">
                    <div className="bg-brand-primary/10 text-brand-primary px-4 py-2 rounded-xl border border-brand-primary/20">
                      <span className="text-lg font-black tracking-tighter">{promo.code}</span>
                    </div>
                    <div className={`w-3 h-3 rounded-full ${promo.isActive ? "bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]" : "bg-gray-600"}`} />
                  </div>
                  
                  <div className="space-y-4 mb-6">
                    <div>
                      <div className="text-[8px] text-gray-500 uppercase font-black tracking-widest mb-1">Descuento</div>
                      <div className="text-xl font-black text-white">
                        {promo.discountType === "percentage" ? `${promo.discountValue}%` : `$${formatPrice(promo.discountValue)}`}
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <div>
                        <div className="text-[8px] text-gray-500 uppercase font-black tracking-widest mb-1">Usos</div>
                        <div className="text-sm font-bold text-white">{promo.usageCount}</div>
                      </div>
                      <div>
                        <div className="text-[8px] text-gray-500 uppercase font-black tracking-widest mb-1">Estado</div>
                        <div className={`text-[10px] font-black uppercase tracking-widest ${promo.isActive ? "text-green-500" : "text-gray-500"}`}>
                          {promo.isActive ? "Activo" : "Inactivo"}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleEditPromo(promo)}
                      className="flex-1 bg-white/5 hover:bg-white/10 text-[10px] font-black uppercase tracking-widest py-3 rounded-xl border border-white/5 transition-all"
                    >
                      Editar
                    </button>
                    <button 
                      onClick={() => handleDeletePromo(promo.id)}
                      className="flex-1 bg-brand-secondary/10 text-brand-secondary hover:bg-brand-secondary hover:text-white text-[10px] font-black uppercase tracking-widest py-3 rounded-xl border border-brand-secondary/20 transition-all"
                    >
                      Borrar
                    </button>
                  </div>
                </div>
              ))}
              {promoCodes.length === 0 && (
                <div className="col-span-full text-center py-20 bg-white/5 rounded-[3rem] border border-dashed border-white/10">
                  <Ticket className="w-12 h-12 text-gray-600 mx-auto mb-4 opacity-20" />
                  <p className="text-gray-500 uppercase tracking-widest text-sm font-bold">No hay códigos promocionales registrados</p>
                </div>
              )}
            </div>
          )
        ) : activeTab === "orders" ? (
          loadingOrders ? (
            <div className="text-center py-20 animate-pulse text-brand-primary font-black uppercase tracking-widest">
              Sincronizando pedidos...
            </div>
          ) : (
            <div className="space-y-6">
              {orders.map((order) => (
                <div key={order.id} className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 hover:border-brand-primary/30 transition-all">
                  <div className="flex flex-col md:flex-row justify-between gap-6 mb-8">
                    <div className="flex gap-6">
                      <div className="w-16 h-16 bg-brand-primary/10 rounded-2xl flex items-center justify-center text-brand-primary shrink-0">
                        <Package className="w-8 h-8" />
                      </div>
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="text-xl font-heading font-black uppercase tracking-tighter">
                            Pedido #{order.id.substring(0, 6).toUpperCase()}
                          </h3>
                          <span className={`text-[8px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${
                            order.status === 'paid' ? 'bg-green-500/10 border-green-500/20 text-green-500' :
                            order.status === 'shipped' ? 'bg-blue-500/10 border-blue-500/20 text-blue-500' :
                            order.status === 'cancelled' ? 'bg-red-500/10 border-red-500/20 text-red-500' :
                            'bg-brand-primary/10 border-brand-primary/20 text-brand-primary'
                          }`}>
                            {order.status}
                          </span>
                        </div>
                        <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">
                          {order.createdAt?.toDate ? order.createdAt.toDate().toLocaleString() : "Reciente"}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[8px] text-gray-500 uppercase font-black tracking-widest mb-1">Total del Pedido</div>
                      <div className="text-2xl font-black text-brand-primary">${formatPrice(order.total)}</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                    <div className="bg-white/5 rounded-3xl p-6 border border-white/5">
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-4 flex items-center gap-2">
                        <Users className="w-3 h-3" /> Cliente
                      </h4>
                      <p className="font-bold text-white mb-1">{order.shippingInfo.firstName} {order.shippingInfo.lastName}</p>
                      <p className="text-sm text-gray-400">{order.shippingInfo.email}</p>
                      <p className="text-sm text-gray-400">{order.shippingInfo.phone}</p>
                    </div>
                    <div className="bg-white/5 rounded-3xl p-6 border border-white/5">
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-4 flex items-center gap-2">
                        <ImageIcon className="w-3 h-3" /> Envío
                      </h4>
                      <p className="text-sm text-white mb-1">{order.shippingInfo.address}</p>
                      <p className="text-sm text-gray-400">{order.shippingInfo.city}, {order.shippingInfo.zipCode}</p>
                    </div>
                    <div className="bg-white/5 rounded-3xl p-6 border border-white/5">
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-4 flex items-center gap-2">
                        <DollarSign className="w-3 h-3" /> Pago ({order.paymentMethod})
                      </h4>
                      {order.paymentLink ? (
                        <div className="space-y-2">
                          <p className="text-[10px] font-bold text-green-500 uppercase tracking-widest">Link Generado</p>
                          <a href={order.paymentLink} target="_blank" rel="noopener noreferrer" className="text-xs text-brand-primary hover:underline break-all">
                            {order.paymentLink}
                          </a>
                        </div>
                      ) : (
                        <p className="text-xs text-gray-500 italic">Sin link de pago generado</p>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-4 pt-6 border-t border-white/10">
                    <select 
                      value={order.status}
                      onChange={(e) => handleUpdateOrder(order.id, { status: e.target.value })}
                      className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-[10px] font-black uppercase tracking-widest outline-none focus:ring-2 focus:ring-brand-primary"
                    >
                      <option value="pending">Pendiente</option>
                      <option value="paid">Pagado</option>
                      <option value="shipped">Enviado</option>
                      <option value="cancelled">Cancelado</option>
                    </select>

                    <Button 
                      onClick={() => {
                        setCurrentOrder(order);
                        setPaymentLinkInput(order.paymentLink || "");
                        setIsEditingOrder(true);
                      }}
                      className="bg-brand-primary text-brand-black text-[10px] font-black uppercase tracking-widest px-6 py-2 rounded-xl"
                    >
                      Gestionar Pago
                    </Button>

                    <Button 
                      onClick={() => {
                        setConfirmModal({
                          isOpen: true,
                          title: "Finalizar Pedido",
                          message: "¿Deseas marcar este pedido como Finalizado? El estado cambiará a 'Entregado'.",
                          confirmText: "Finalizar",
                          type: 'primary',
                          onConfirm: async () => {
                            await handleUpdateOrder(order.id, { status: "shipped" });
                            setConfirmModal(prev => ({ ...prev, isOpen: false }));
                          }
                        });
                      }}
                      className="bg-white/10 text-white hover:bg-white hover:text-brand-black text-[10px] font-black uppercase tracking-widest px-6 py-2 rounded-xl transition-all"
                    >
                      Finalizar Pedido
                    </Button>

                    <Button 
                      onClick={() => {
                        const message = `Hola ${order.shippingInfo.firstName}, soy del equipo de Fly and Chill. Respecto a tu pedido #${order.id.substring(0, 6).toUpperCase()}...`;
                        window.open(`https://wa.me/${order.shippingInfo.phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`, '_blank');
                      }}
                      variant="outline"
                      className="border-white/10 text-[10px] font-black uppercase tracking-widest px-6 py-2 rounded-xl"
                    >
                      WhatsApp
                    </Button>

                    <div className="ml-auto">
                      <Button 
                        onClick={() => handleDeleteOrder(order.id)}
                        variant="outline"
                        className="border-brand-secondary/30 text-brand-secondary hover:bg-brand-secondary hover:text-white text-[10px] font-black uppercase tracking-widest px-6 py-2 rounded-xl transition-all"
                      >
                        <Trash2 className="w-3 h-3 mr-2" />
                        Eliminar
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
              {orders.length === 0 && (
                <div className="text-center py-20 bg-white/5 rounded-[3rem] border border-dashed border-white/10">
                  <Package className="w-12 h-12 text-gray-600 mx-auto mb-4 opacity-20" />
                  <p className="text-gray-500 uppercase tracking-widest text-sm font-bold">No hay pedidos registrados aún</p>
                </div>
              )}
            </div>
          )
        ) : (
          loadingLeads ? (
            <div className="text-center py-20 animate-pulse text-brand-primary font-black uppercase tracking-widest">
              Sincronizando leads...
            </div>
          ) : (
            <div className="bg-white/5 border border-white/10 rounded-[2.5rem] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/10 bg-white/5">
                      <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-gray-500">Email</th>
                      <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-gray-500">Fecha de Registro</th>
                      <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-gray-500">Origen</th>
                      <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-gray-500">Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leads.map((lead) => (
                      <tr key={lead.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                        <td className="px-8 py-6 font-bold text-white">{lead.email}</td>
                        <td className="px-8 py-6 text-gray-400 text-sm">
                          {lead.signupDate?.toDate ? lead.signupDate.toDate().toLocaleString() : "Reciente"}
                        </td>
                        <td className="px-8 py-6">
                          <span className="bg-white/10 text-gray-300 text-[8px] font-black uppercase tracking-widest px-3 py-1 rounded-full border border-white/10">
                            {lead.source}
                          </span>
                        </td>
                        <td className="px-8 py-6">
                          <span className="text-brand-primary text-[10px] font-black uppercase tracking-widest">
                            {lead.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {leads.length === 0 && (
                      <tr>
                        <td colSpan={4} className="px-8 py-20 text-center">
                          <Users className="w-12 h-12 text-gray-600 mx-auto mb-4 opacity-20" />
                          <p className="text-gray-500 uppercase tracking-widest text-sm font-bold">No hay leads registrados aún</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )
        )}

        {/* Edit Modal */}
        <AnimatePresence>
          {isEditing && currentProduct && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsEditing(false)}
                className="absolute inset-0 bg-brand-black/90 backdrop-blur-md"
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative w-full max-w-4xl bg-white/5 border border-white/10 rounded-[3rem] shadow-2xl overflow-hidden"
              >
                <div className="p-8 md:p-12 max-h-[90vh] overflow-y-auto custom-scrollbar">
                  <div className="flex justify-between items-center mb-10">
                    <h2 className="text-3xl font-heading font-black uppercase tracking-tighter">
                      {currentProduct.id ? "Editar" : "Nuevo"} <span className="text-brand-primary">Producto</span>
                    </h2>
                    <button onClick={() => setIsEditing(false)} className="text-gray-400 hover:text-white transition-colors">
                      <X className="w-8 h-8" />
                    </button>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {/* Image Upload Area */}
                      <div className="md:col-span-2">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 flex items-center gap-2 mb-4">
                          <ImageIcon className="w-3 h-3" /> Galería de Imágenes (3-6 recomendadas)
                        </label>
                        
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 mb-4">
                          {currentProduct.images?.map((img, index) => (
                            <div key={index} className="relative aspect-square bg-brand-black/40 border border-white/10 rounded-2xl overflow-hidden group/img">
                              <img src={img} alt={`Preview ${index}`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                              <button 
                                type="button"
                                onClick={() => removeImage(index)}
                                className="absolute top-2 right-2 bg-brand-secondary text-white p-1.5 rounded-full opacity-0 group-hover/img:opacity-100 transition-opacity"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                          
                          {(!currentProduct.images || currentProduct.images.length < 6) && (
                            <button 
                              type="button"
                              onClick={() => fileInputRef.current?.click()}
                              className="aspect-square bg-white/5 border-2 border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center hover:border-brand-primary/30 transition-all group/add"
                            >
                              <Upload className="w-6 h-6 text-gray-400 group-hover/add:text-brand-primary transition-colors" />
                              <span className="text-[8px] font-black uppercase tracking-widest text-gray-500 mt-2">Añadir</span>
                            </button>
                          )}
                        </div>

                        {uploading && (
                          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-4">
                            <div className="flex items-center gap-4 mb-4">
                              <Loader2 className="w-5 h-5 text-brand-primary animate-spin" />
                              <p className="text-[10px] font-black uppercase tracking-widest text-brand-primary">
                                Procesando y Subiendo... {Math.round(uploadProgress)}%
                              </p>
                            </div>
                            <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-brand-primary transition-all duration-300" 
                                style={{ width: `${uploadProgress}%` }}
                              />
                            </div>
                          </div>
                        )}

                        <div className="space-y-4">
                          <div className="flex gap-2">
                            <input 
                              type="text"
                              value={imageUrlInput}
                              onChange={(e) => setImageUrlInput(e.target.value)}
                              className="flex-1 bg-brand-black/40 border border-white/10 rounded-2xl px-6 py-4 text-white focus:ring-2 focus:ring-brand-primary outline-none transition-all"
                              placeholder="O pega una URL de imagen..."
                            />
                            <button 
                              type="button"
                              onClick={addImageUrl}
                              className="bg-brand-primary text-brand-black font-black uppercase tracking-widest px-6 rounded-2xl hover:bg-white transition-colors"
                            >
                              Añadir
                            </button>
                          </div>
                          
                          <p className="text-[10px] text-gray-600 uppercase tracking-widest">
                            Sube entre 3 y 6 imágenes para una mejor visualización en el catálogo.
                          </p>
                        </div>
                        
                        <input 
                          type="file"
                          ref={fileInputRef}
                          onChange={handleFileChange}
                          className="hidden"
                          accept="image/*"
                          multiple
                        />
                      </div>

                      {/* Name */}
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 flex items-center gap-2">
                          <Package className="w-3 h-3" /> Nombre del Producto
                        </label>
                        <input 
                          required
                          type="text"
                          value={currentProduct.name}
                          onChange={(e) => setCurrentProduct({...currentProduct, name: e.target.value})}
                          className="w-full bg-brand-black/40 border border-white/10 rounded-2xl px-6 py-4 text-white focus:ring-2 focus:ring-brand-primary outline-none transition-all"
                          placeholder="Ej: Elite Vape Gold Edition"
                        />
                      </div>

                      {/* Price */}
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 flex items-center gap-2">
                          <DollarSign className="w-3 h-3" /> Precio
                        </label>
                        <input 
                          required
                          type="number"
                          step="0.01"
                          value={isNaN(currentProduct.price) ? "" : currentProduct.price}
                          onChange={(e) => {
                            const val = e.target.value === "" ? NaN : parseFloat(e.target.value);
                            setCurrentProduct({...currentProduct, price: val});
                          }}
                          className="w-full bg-brand-black/40 border border-white/10 rounded-2xl px-6 py-4 text-white focus:ring-2 focus:ring-brand-primary outline-none transition-all"
                        />
                      </div>

                      {/* Category */}
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 flex items-center gap-2">
                          <Tag className="w-3 h-3" /> Categoría
                        </label>
                        <select 
                          value={currentProduct.category}
                          onChange={(e) => setCurrentProduct({...currentProduct, category: e.target.value})}
                          className="w-full bg-brand-black/40 border border-white/10 rounded-2xl px-6 py-4 text-white focus:ring-2 focus:ring-brand-primary outline-none transition-all appearance-none"
                        >
                          <option value="Desechables">Desechables</option>
                          <option value="CARTS NACIONALES">CARTS NACIONALES</option>
                          <option value="CARTS IMPORTADOS">CARTS IMPORTADOS</option>
                          <option value="BATERIAS">BATERIAS</option>
                          <option value="COMBOS">COMBOS</option>
                        </select>
                      </div>

                      {/* Flavor */}
                      <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 flex items-center gap-2">
                          <Beaker className="w-3 h-3" /> Sabores / Variedades
                        </label>
                        
                        <div className="w-full bg-brand-black/40 border border-white/10 rounded-2xl p-2 flex flex-wrap gap-2 focus-within:ring-2 focus-within:ring-brand-primary transition-all">
                          {currentProduct.flavors?.map((f, index) => (
                            <span key={index} className="bg-brand-primary/20 text-brand-primary text-[10px] font-bold px-3 py-1.5 rounded-full flex items-center gap-2 border border-brand-primary/30">
                              {f}
                              <button type="button" onClick={() => removeFlavor(index)} className="hover:text-white">
                                <X className="w-3 h-3" />
                              </button>
                            </span>
                          ))}
                          <input 
                            type="text"
                            value={flavorInput}
                            onChange={(e) => setFlavorInput(e.target.value)}
                            onKeyDown={addFlavor}
                            className="flex-1 bg-transparent border-none outline-none text-white px-4 py-2 min-w-[150px]"
                            placeholder={currentProduct.flavors?.length === 0 ? "Escribe un sabor y presiona Enter o Coma" : "Añadir otro..."}
                          />
                        </div>
                        <p className="text-[8px] font-bold text-gray-500 uppercase tracking-widest">
                          Puedes escribir varios sabores separados por comas o presionando Enter.
                        </p>
                      </div>

                      {/* Stock */}
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 flex items-center gap-2">
                          <Package className="w-3 h-3" /> Cantidad en Stock
                        </label>
                        <input 
                          required
                          type="number"
                          value={isNaN(currentProduct.stock) ? "" : currentProduct.stock}
                          onChange={(e) => {
                            const val = e.target.value === "" ? NaN : parseInt(e.target.value);
                            setCurrentProduct({...currentProduct, stock: val});
                          }}
                          className="w-full bg-brand-black/40 border border-white/10 rounded-2xl px-6 py-4 text-white focus:ring-2 focus:ring-brand-primary outline-none transition-all"
                        />
                      </div>

                      {/* CBD Content */}
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 flex items-center gap-2">
                          <Beaker className="w-3 h-3" /> Contenido CBD
                        </label>
                        <input 
                          type="text"
                          value={currentProduct.cbdContent}
                          onChange={(e) => setCurrentProduct({...currentProduct, cbdContent: e.target.value})}
                          className="w-full bg-brand-black/40 border border-white/10 rounded-2xl px-6 py-4 text-white focus:ring-2 focus:ring-brand-primary outline-none transition-all"
                          placeholder="Ej: Premium, Elite"
                        />
                      </div>

                      {/* Description */}
                      <div className="space-y-2 md:col-span-2">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 flex items-center gap-2">
                          <FileText className="w-3 h-3" /> Descripción
                        </label>
                        <textarea 
                          required
                          rows={4}
                          value={currentProduct.description}
                          onChange={(e) => setCurrentProduct({...currentProduct, description: e.target.value})}
                          className="w-full bg-brand-black/40 border border-white/10 rounded-2xl px-6 py-4 text-white focus:ring-2 focus:ring-brand-primary outline-none transition-all resize-none"
                          placeholder="Describe las características del producto..."
                        />
                      </div>

                      {/* Featured Toggle */}
                      <div className="md:col-span-2 flex items-center gap-4 bg-white/5 p-6 rounded-2xl border border-white/5">
                        <div className="flex-grow">
                          <h4 className="text-sm font-black uppercase tracking-widest">Producto Destacado</h4>
                          <p className="text-[10px] text-gray-500 uppercase mt-1">Aparecerá en las secciones principales de la web</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setCurrentProduct({...currentProduct, isFeatured: !currentProduct.isFeatured})}
                          className={`w-14 h-8 rounded-full transition-all relative ${currentProduct.isFeatured ? 'bg-brand-primary' : 'bg-white/10'}`}
                        >
                          <div className={`absolute top-1 w-6 h-6 rounded-full bg-white transition-all ${currentProduct.isFeatured ? 'left-7' : 'left-1'}`} />
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 pt-6">
                      <Button 
                        type="submit"
                        disabled={uploading || isSaving}
                        className="flex-1 bg-brand-primary text-brand-black hover:bg-white rounded-2xl py-6 text-xs font-black uppercase tracking-widest flex items-center justify-center gap-3 disabled:opacity-50"
                      >
                        {isSaving ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Guardando...
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4" />
                            {currentProduct.id ? "Guardar Cambios" : "Crear Producto"}
                          </>
                        )}
                      </Button>
                      <Button 
                        type="button"
                        onClick={() => setIsEditing(false)}
                        variant="outline"
                        disabled={isSaving}
                        className="flex-1 bg-white/5 border-white/10 hover:bg-white/10 text-white rounded-2xl py-6 text-xs font-black uppercase tracking-widest disabled:opacity-50"
                      >
                        Cancelar
                      </Button>
                    </div>
                  </form>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
        {/* Promo Code Edit Modal */}
        <AnimatePresence>
          {isEditingPromo && currentPromo && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsEditingPromo(false)}
                className="absolute inset-0 bg-brand-black/90 backdrop-blur-md"
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative w-full max-w-lg bg-white/5 border border-white/10 rounded-[3rem] shadow-2xl overflow-hidden"
              >
                <div className="p-8 md:p-12">
                  <div className="flex justify-between items-center mb-10">
                    <h2 className="text-3xl font-heading font-black uppercase tracking-tighter">
                      {currentPromo.id ? "Editar" : "Nuevo"} <span className="text-brand-primary">Código</span>
                    </h2>
                    <button onClick={() => setIsEditingPromo(false)} className="text-gray-400 hover:text-white transition-colors">
                      <X className="w-8 h-8" />
                    </button>
                  </div>

                  <form onSubmit={handleSubmitPromo} className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Código (Ej: FLY20)</label>
                      <input 
                        required
                        type="text"
                        value={currentPromo.code}
                        onChange={(e) => setCurrentPromo({...currentPromo, code: e.target.value.toUpperCase()})}
                        className="w-full bg-brand-black/40 border border-white/10 rounded-2xl px-6 py-4 text-white focus:ring-2 focus:ring-brand-primary outline-none transition-all"
                        placeholder="FLY20"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Tipo</label>
                        <select 
                          value={currentPromo.discountType}
                          onChange={(e) => setCurrentPromo({...currentPromo, discountType: e.target.value as any})}
                          className="w-full bg-brand-black/40 border border-white/10 rounded-2xl px-6 py-4 text-white focus:ring-2 focus:ring-brand-primary outline-none transition-all appearance-none"
                        >
                          <option value="percentage">Porcentaje (%)</option>
                          <option value="fixed">Fijo ($)</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Valor</label>
                        <input 
                          required
                          type="number"
                          value={isNaN(currentPromo.discountValue) ? "" : currentPromo.discountValue}
                          onChange={(e) => {
                            const val = e.target.value === "" ? NaN : parseFloat(e.target.value);
                            setCurrentPromo({...currentPromo, discountValue: val});
                          }}
                          className="w-full bg-brand-black/40 border border-white/10 rounded-2xl px-6 py-4 text-white focus:ring-2 focus:ring-brand-primary outline-none transition-all"
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-4 bg-white/5 p-6 rounded-2xl border border-white/5">
                      <div className="flex-grow">
                        <h4 className="text-sm font-black uppercase tracking-widest">Código Activo</h4>
                        <p className="text-[10px] text-gray-500 uppercase mt-1">Los clientes podrán usarlo en el checkout</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setCurrentPromo({...currentPromo, isActive: !currentPromo.isActive})}
                        className={`w-14 h-8 rounded-full transition-all relative ${currentPromo.isActive ? 'bg-brand-primary' : 'bg-white/10'}`}
                      >
                        <div className={`absolute top-1 w-6 h-6 rounded-full bg-white transition-all ${currentPromo.isActive ? 'left-7' : 'left-1'}`} />
                      </button>
                    </div>

                    <div className="flex gap-4 pt-6">
                      <Button 
                        type="submit"
                        disabled={isSaving}
                        className="flex-1 bg-brand-primary text-brand-black hover:bg-white rounded-2xl py-6 text-xs font-black uppercase tracking-widest flex items-center justify-center gap-3"
                      >
                        {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        {currentPromo.id ? "Guardar" : "Crear"}
                      </Button>
                      <Button 
                        type="button"
                        onClick={() => setIsEditingPromo(false)}
                        variant="outline"
                        className="flex-1 bg-white/5 border-white/10 hover:bg-white/10 text-white rounded-2xl py-6 text-xs font-black uppercase tracking-widest"
                      >
                        Cancelar
                      </Button>
                    </div>
                  </form>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Order Management Modal */}
        <AnimatePresence>
          {isEditingOrder && currentOrder && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsEditingOrder(false)}
                className="absolute inset-0 bg-brand-black/90 backdrop-blur-md"
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative w-full max-w-lg bg-white/5 border border-white/10 rounded-[3rem] shadow-2xl overflow-hidden"
              >
                <div className="p-10">
                  <div className="flex justify-between items-center mb-8">
                    <h2 className="text-2xl font-heading font-black uppercase tracking-tighter">
                      Gestionar <span className="text-brand-primary">Pago</span>
                    </h2>
                    <button onClick={() => setIsEditingOrder(false)} className="text-gray-400 hover:text-white transition-colors">
                      <X className="w-6 h-6" />
                    </button>
                  </div>

                  <div className="space-y-6">
                    <div className="bg-white/5 rounded-2xl p-6 border border-white/5">
                      <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">Método Seleccionado</p>
                      <p className="text-lg font-bold text-white uppercase tracking-tight">
                        {currentOrder.paymentMethod === 'nequi' ? '📲 Nequi / Transfiya' : '💳 PSE / Tarjetas'}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Link de Pago (PSE/Card)</label>
                      <input 
                        type="text"
                        value={paymentLinkInput}
                        onChange={(e) => setPaymentLinkInput(e.target.value)}
                        className="w-full bg-brand-black/40 border border-white/10 rounded-2xl px-6 py-4 text-white focus:ring-2 focus:ring-brand-primary outline-none transition-all"
                        placeholder="https://checkout.pse.com.co/..."
                      />
                      <p className="text-[10px] text-gray-600 italic">Pega aquí el link generado desde tu pasarela de pagos.</p>
                    </div>

                    <div className="flex gap-4 pt-4">
                      <Button 
                        onClick={() => handleSendPaymentLink(currentOrder)}
                        className="flex-1 bg-brand-primary text-brand-black font-black uppercase tracking-widest py-4 rounded-2xl"
                      >
                        Guardar Link
                      </Button>
                      <Button 
                        onClick={() => setIsEditingOrder(false)}
                        variant="outline"
                        className="flex-1 border-white/10 text-gray-400 font-black uppercase tracking-widest py-4 rounded-2xl"
                      >
                        Cancelar
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Global Notification */}
        <AnimatePresence>
          {notification && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="fixed bottom-8 right-8 z-[100]"
            >
              <div className={`px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-4 border ${
                notification.type === 'success' 
                  ? 'bg-green-500/10 border-green-500/20 text-green-500' 
                  : 'bg-brand-secondary/10 border-brand-secondary/20 text-brand-secondary'
              }`}>
                <div className={`w-2 h-2 rounded-full animate-pulse ${
                  notification.type === 'success' ? 'bg-green-500' : 'bg-brand-secondary'
                }`} />
                <span className="text-[10px] font-black uppercase tracking-widest">{notification.message}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Custom Confirmation Modal */}
        <AnimatePresence>
          {confirmModal.isOpen && (
            <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                className="absolute inset-0 bg-brand-black/90 backdrop-blur-md"
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative w-full max-w-md bg-white/5 border border-white/10 rounded-[3rem] shadow-2xl overflow-hidden p-10 text-center"
              >
                <h3 className="text-2xl font-heading font-black uppercase tracking-tighter mb-4">
                  {confirmModal.title}
                </h3>
                <p className="text-gray-400 text-sm mb-8">
                  {confirmModal.message}
                </p>
                <div className="flex gap-4">
                  <Button 
                    onClick={confirmModal.onConfirm}
                    className={`flex-1 rounded-2xl py-6 text-[10px] font-black uppercase tracking-widest ${
                      confirmModal.type === 'danger' 
                        ? 'bg-brand-secondary text-white hover:bg-white hover:text-brand-secondary' 
                        : 'bg-brand-primary text-brand-black hover:bg-white'
                    }`}
                  >
                    {confirmModal.confirmText || "Confirmar"}
                  </Button>
                  <Button 
                    onClick={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                    variant="outline"
                    className="flex-1 bg-white/5 border-white/10 hover:bg-white/10 text-white rounded-2xl py-6 text-[10px] font-black uppercase tracking-widest"
                  >
                    Cancelar
                  </Button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
