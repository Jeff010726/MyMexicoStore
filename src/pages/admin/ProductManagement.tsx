import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Eye,
  MoreHorizontal,
  Package,
  Upload,
  AlertCircle,
  Check,
  X,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { API_BASE_URL } from '@/config/api';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: string;
  stock: number;
  status: 'active' | 'inactive' | 'draft';
  images: string[];
  createdAt: string;
  updatedAt: string;
}

interface ProductFormData {
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: string;
  stock: number;
  status: 'active' | 'inactive' | 'draft';
  images: File[];
}

const ProductManagement = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    description: '',
    price: 0,
    originalPrice: 0,
    category: '',
    stock: 0,
    status: 'draft',
    images: []
  });
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const categories = ['家具', '家电', '家纺', '数码', '厨具', '装饰', '其他'];
  const statuses = ['active', 'inactive', 'draft'];

  // 获取商品列表
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/products`);
      if (!response.ok) throw new Error('获取商品列表失败');
      const data = await response.json();
      setProducts(data.products || []);
    } catch (error) {
      console.error('获取商品失败:', error);
      setError('获取商品列表失败');
    } finally {
      setLoading(false);
    }
  };

  // 上传图片到Cloudflare R2
  const uploadImages = async (files: File[]): Promise<string[]> => {
    const uploadedUrls: string[] = [];
    
    for (const file of files) {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch(`${API_BASE_URL}/upload`, {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) throw new Error(`图片上传失败: ${file.name}`);
      
      const result = await response.json();
      uploadedUrls.push(result.url);
    }
    
    return uploadedUrls;
  };

  // 添加商品
  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);
    setError(null);

    try {
      // 上传图片
      let imageUrls: string[] = [];
      if (formData.images.length > 0) {
        imageUrls = await uploadImages(formData.images);
      }

      const productData = {
        name: formData.name,
        description: formData.description,
        price: formData.price,
        originalPrice: formData.originalPrice || undefined,
        category: formData.category,
        stock: formData.stock,
        status: formData.status,
        images: imageUrls
      };

      const response = await fetch(`${API_BASE_URL}/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(productData)
      });

      if (!response.ok) throw new Error('添加商品失败');

      await fetchProducts();
      setShowAddForm(false);
      resetForm();
    } catch (error) {
      console.error('添加商品失败:', error);
      setError(error instanceof Error ? error.message : '添加商品失败');
    } finally {
      setUploading(false);
    }
  };

  // 更新商品
  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    setUploading(true);
    setError(null);

    try {
      // 上传新图片
      let imageUrls = editingProduct.images;
      if (formData.images.length > 0) {
        const newImageUrls = await uploadImages(formData.images);
        imageUrls = [...imageUrls, ...newImageUrls];
      }

      const productData = {
        name: formData.name,
        description: formData.description,
        price: formData.price,
        originalPrice: formData.originalPrice || undefined,
        category: formData.category,
        stock: formData.stock,
        status: formData.status,
        images: imageUrls
      };

      const response = await fetch(`${API_BASE_URL}/products/${editingProduct.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(productData)
      });

      if (!response.ok) throw new Error('更新商品失败');

      await fetchProducts();
      setEditingProduct(null);
      resetForm();
    } catch (error) {
      console.error('更新商品失败:', error);
      setError(error instanceof Error ? error.message : '更新商品失败');
    } finally {
      setUploading(false);
    }
  };

  // 删除商品
  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('确定要删除这个商品吗？')) return;

    try {
      const response = await fetch(`${API_BASE_URL}/products/${productId}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('删除商品失败');

      await fetchProducts();
    } catch (error) {
      console.error('删除商品失败:', error);
      setError('删除商品失败');
    }
  };

  // 重置表单
  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: 0,
      originalPrice: 0,
      category: '',
      stock: 0,
      status: 'draft',
      images: []
    });
  };

  // 开始编辑商品
  const startEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price,
      originalPrice: product.originalPrice || 0,
      category: product.category,
      stock: product.stock,
      status: product.status,
      images: []
    });
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-red-100 text-red-800';
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return '已上架';
      case 'inactive':
        return '已下架';
      case 'draft':
        return '草稿';
      default:
        return status;
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    const matchesStatus = selectedStatus === 'all' || product.status === selectedStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin" />
        <span className="ml-2">加载中...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 错误提示 */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-2">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <span className="text-red-800">{error}</span>
          <button onClick={() => setError(null)} className="ml-auto">
            <X className="w-4 h-4 text-red-600" />
          </button>
        </div>
      )}

      {/* 页面头部 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">商品管理</h1>
          <p className="text-gray-600 mt-1">管理您的商品库存和信息</p>
        </div>
        <Button 
          onClick={() => setShowAddForm(true)}
          className="bg-gradient-to-r from-pink-500 to-orange-400 hover:from-pink-600 hover:to-orange-500"
        >
          <Plus size={20} className="mr-2" />
          添加商品
        </Button>
      </div>

      {/* 搜索和筛选 */}
      <Card className="p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 md:space-x-4">
          {/* 搜索框 */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <Input
              type="text"
              placeholder="搜索商品名称..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* 筛选器 */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter size={16} className="text-gray-400" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              >
                <option value="all">所有分类</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            >
              <option value="all">所有状态</option>
              {statuses.map(status => (
                <option key={status} value={status}>{getStatusText(status)}</option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* 商品表单 */}
      {(showAddForm || editingProduct) && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">
              {editingProduct ? '编辑商品' : '添加商品'}
            </h2>
            <Button
              variant="outline"
              onClick={() => {
                setShowAddForm(false);
                setEditingProduct(null);
                resetForm();
              }}
            >
              <X size={16} />
            </Button>
          </div>

          <form onSubmit={editingProduct ? handleUpdateProduct : handleAddProduct} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">商品名称</label>
                <Input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">分类</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  required
                >
                  <option value="">选择分类</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">价格</label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({...formData, price: parseFloat(e.target.value)})}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">原价（可选）</label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.originalPrice}
                  onChange={(e) => setFormData({...formData, originalPrice: parseFloat(e.target.value)})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">库存</label>
                <Input
                  type="number"
                  value={formData.stock}
                  onChange={(e) => setFormData({...formData, stock: parseInt(e.target.value)})}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">状态</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value as any})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                >
                  {statuses.map(status => (
                    <option key={status} value={status}>{getStatusText(status)}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">商品描述</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">商品图片</label>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => setFormData({...formData, images: Array.from(e.target.files || [])})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              />
              <p className="text-sm text-gray-500 mt-1">支持多张图片上传，建议尺寸 800x800px</p>
            </div>

            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowAddForm(false);
                  setEditingProduct(null);
                  resetForm();
                }}
              >
                取消
              </Button>
              <Button
                type="submit"
                disabled={uploading}
                className="bg-gradient-to-r from-pink-500 to-orange-400 hover:from-pink-600 hover:to-orange-500"
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    {editingProduct ? '更新中...' : '添加中...'}
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    {editingProduct ? '更新商品' : '添加商品'}
                  </>
                )}
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* 商品列表 */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left py-3 px-6 font-medium text-gray-900">商品</th>
                <th className="text-left py-3 px-6 font-medium text-gray-900">分类</th>
                <th className="text-left py-3 px-6 font-medium text-gray-900">价格</th>
                <th className="text-left py-3 px-6 font-medium text-gray-900">库存</th>
                <th className="text-left py-3 px-6 font-medium text-gray-900">状态</th>
                <th className="text-left py-3 px-6 font-medium text-gray-900">创建时间</th>
                <th className="text-right py-3 px-6 font-medium text-gray-900">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredProducts.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-3">
                      {product.images && product.images.length > 0 ? (
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-gray-200 flex items-center justify-center">
                          <Package className="w-6 h-6 text-gray-400" />
                        </div>
                      )}
                      <div>
                        <h3 className="font-medium text-gray-900">{product.name}</h3>
                        <p className="text-sm text-gray-500">ID: {product.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                      {product.category}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div>
                      <span className="font-medium text-gray-900">¥{product.price}</span>
                      {product.originalPrice && (
                        <span className="ml-2 text-sm text-gray-500 line-through">
                          ¥{product.originalPrice}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`font-medium ${
                      product.stock === 0 ? 'text-red-600' : 
                      product.stock < 10 ? 'text-yellow-600' : 'text-green-600'
                    }`}>
                      {product.stock}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`px-2 py-1 text-sm rounded-full ${getStatusColor(product.status)}`}>
                      {getStatusText(product.status)}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-gray-600">
                    {new Date(product.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center justify-end space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => startEdit(product)}
                      >
                        <Edit size={16} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteProduct(product.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <Package className="mx-auto text-gray-400 mb-4" size={48} />
            <h3 className="text-lg font-medium text-gray-900 mb-2">没有找到商品</h3>
            <p className="text-gray-600">尝试调整搜索条件或添加新商品</p>
          </div>
        )}
      </Card>

      {/* 分页 */}
      {filteredProducts.length > 0 && (
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              显示 1-{filteredProducts.length} 条，共 {filteredProducts.length} 条记录
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" disabled>
                上一页
              </Button>
              <Button size="sm" className="bg-gradient-to-r from-pink-500 to-orange-400">
                1
              </Button>
              <Button variant="outline" size="sm" disabled>
                下一页
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default ProductManagement;