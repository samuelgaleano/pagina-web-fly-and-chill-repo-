import { useState, useRef } from "react";
import { useShop } from "@/context/ShopContext";
import { Button } from "@/components/ui/Button";
import { db, storage, handleFirestoreError, OperationType } from "@/lib/firebase";
import { collection, doc, deleteDoc, addDoc, updateDoc, setDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { Plus, Edit2, Trash2, X, Save, Package, Image as ImageIcon, Tag, Beaker, DollarSign, FileText, Upload, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Product } from "@/types";

export function Admin() {
  const { products, loading, isAdmin } = useShop();
  const [isEditing, setIsEditing] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<Partial<Product> | null>(null);
  const [uploading, setUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [imageUrlInput, setImageUrlInput] = useState("");

  const addImageUrl = () => {
    if (!imageUrlInput.trim() || !currentProduct) return;
    const newImages = [...(currentProduct.images || []), imageUrlInput.trim()];
    if (newImages.length > 6) {
      alert('Máximo 6 imágenes por producto.');
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
      cbdContent: "1000mg",
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
      alert('Máximo 6 imágenes por producto.');
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
      alert(`Error al procesar las imágenes: ${error instanceof Error ? error.message : String(error)}`);
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

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de que quieres eliminar este producto?")) return;
    try {
      await deleteDoc(doc(db, "products", id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `products/${id}`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentProduct || !currentProduct.images || currentProduct.images.length === 0) {
      alert("Por favor, sube al menos una imagen para el producto.");
      return;
    }

    setIsSaving(true);
    try {
      if (currentProduct.id) {
        // Use setDoc instead of updateDoc to handle "upsert" (create if missing)
        // This is crucial for static products that don't exist in Firestore yet
        await setDoc(doc(db, "products", currentProduct.id), currentProduct as any, { merge: true });
      } else {
        // Create new with auto-ID
        const docRef = await addDoc(collection(db, "products"), currentProduct as any);
        await updateDoc(docRef, { id: docRef.id });
      }
      
      // Success: Close modal and reset state
      setIsEditing(false);
      setCurrentProduct(null);
      console.log("Product saved successfully");
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, "products");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-brand-black min-h-screen pt-32 pb-24 text-white">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-4xl md:text-6xl font-heading font-black uppercase tracking-tighter">
              Panel de <span className="text-brand-primary italic serif font-light lowercase">Control</span>
            </h1>
            <p className="text-gray-400 mt-2 uppercase tracking-widest text-[10px] font-bold">Gestión de Inventario Elite</p>
          </div>
          <Button 
            onClick={handleAddNew}
            className="bg-brand-primary text-brand-black hover:bg-white rounded-2xl px-8 py-6 text-xs font-black uppercase tracking-widest flex items-center gap-3"
          >
            <Plus className="w-4 h-4" />
            Nuevo Producto
          </Button>
        </div>

        {loading ? (
          <div className="text-center py-20 animate-pulse text-brand-primary font-black uppercase tracking-widest">
            Sincronizando con la nube...
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
                        {product.price.toFixed(2)}
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
                          <DollarSign className="w-3 h-3" /> Precio (USD)
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
                          placeholder="Ej: 1000mg, 500mg"
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
      </div>
    </div>
  );
}
