import fs from 'fs';

const file = 'src/pages/inventory/ProductManagement/ProductManagement.tsx';
let content = fs.readFileSync(file, 'utf8');
const start = content.indexOf('const handleSaveProduct = async (formData: any) => {');
const end = content.indexOf('const showToast = ', start);

if (start > -1 && end > -1) {
  const replacement = `const handleSaveProduct = async (formData: any) => {
    setLoading(true);
    try {
      const existingProduct = editingProduct || products.find((product) => product.id === formData.id);
      
      const categoryId = categories.find(c => c.name === formData.category)?.id || categories[0]?.id;
      const brandId = brands.find(b => b.name === formData.brand)?.id || brands[0]?.id;
      const supplierId = suppliers.find(s => s.name === formData.supplier)?.id || suppliers[0]?.id;

      const payload = {
        productStructure: formData.productStructure || 'single',
        name: String(formData.name || existingProduct?.name || 'Untitled Product'),
        categoryId,
        brandId,
        supplierId,
        imageUrl: formData.frontImageUrl || formData.imageUrl || existingProduct?.imageUrl || '',
        
        // Single product specifics
        barcode: formData.barcode ? String(formData.barcode) : undefined,
        unitType: formData.unitType ? String(formData.unitType) : undefined,
        costPrice: formData.costPrice !== undefined ? Number(formData.costPrice) : undefined,
        sellingPrice: formData.sellingPrice !== undefined ? Number(formData.sellingPrice) : undefined,
        currentStock: formData.stock !== undefined ? Number(formData.stock) : undefined,
        reorderLevel: formData.reorderLevel !== undefined ? Number(formData.reorderLevel) : undefined,
        targetCapacity: formData.targetCapacity !== undefined ? Number(formData.targetCapacity) : undefined,

        // Variants array
        variants: formData.variants || []
      };

      if (existingProduct && !formData.id?.startsWith('prod_')) {
        showToast('API not connected yet for updating existing products.', 'info');
      } else {
        const res = await MasterDataService.createProduct(payload);
        if (res.success) {
          showToast('Product added successfully to database!');
          
          const prodRes = await MasterDataService.getProducts();
          if (prodRes.success) {
            const mappedProducts = prodRes.data.map((p: any) => ({
              id: p.sku,
              name: p.name,
              sku: p.sku,
              barcode: p.barcode,
              category: p.masterClass?.category?.name || 'Uncategorized',
              subcategory: p.masterClass?.subCategory?.name || 'General',
              supplier: p.masterClass?.supplier?.name || 'Unknown',
              brand: p.masterClass?.brand?.name || 'Generic',
              unitType: p.unitType,
              stock: p.currentStock,
              reorderLevel: p.reorderLevel,
              costPrice: p.costPrice,
              sellingPrice: p.sellingPrice,
              status: p.status === 'ACTIVE' ? 'Active' : 'Archived',
              description: \`\${p.name} - \${p.unitType}\`,
              imageUrl: p.imageUrl || ''
            }));
            setProducts(mappedProducts);
          }
        } else {
          showToast('Error saving product to database', 'info');
        }
      }

      setIsNewProductModalOpen(false);
      setEditingProduct(null);
    } catch (err) {
      console.error(err);
      showToast('Error saving product', 'info');
    } finally {
      setLoading(false);
    }
  };

  `;
  content = content.substring(0, start) + replacement + content.substring(end);
  fs.writeFileSync(file, content);
  console.log('Replacement done!');
} else {
  console.log('Could not find boundaries');
}
