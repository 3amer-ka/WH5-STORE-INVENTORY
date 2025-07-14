/**
 * Categories component for managing inventory categories
 */
import React, { useState } from 'react';
import { useInventory } from '../../contexts/InventoryContext';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Alert, AlertDescription } from '../ui/alert';
import { 
  FolderOpen, 
  Plus, 
  Edit, 
  Trash2, 
  Package,
  AlertCircle,
  Check,
  X
} from 'lucide-react';

interface CategoriesProps {
  onViewChange: (view: string) => void;
}

const Categories: React.FC<CategoriesProps> = ({ onViewChange }) => {
  const { state, dispatch } = useInventory();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#3B82F6'
  });
  const [errors, setErrors] = useState<any>({});

  const colorOptions = [
    { value: '#3B82F6', label: 'Blue' },
    { value: '#10B981', label: 'Green' },
    { value: '#8B5CF6', label: 'Purple' },
    { value: '#F59E0B', label: 'Orange' },
    { value: '#EF4444', label: 'Red' },
    { value: '#6B7280', label: 'Gray' },
    { value: '#EC4899', label: 'Pink' },
    { value: '#14B8A6', label: 'Teal' }
  ];

  const validateForm = () => {
    const newErrors: any = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Category name is required';
    } else if (formData.name.length < 2) {
      newErrors.name = 'Category name must be at least 2 characters';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    // Check for duplicate name (excluding current category when editing)
    const isDuplicate = state.categories.some(cat => 
      cat.name.toLowerCase() === formData.name.toLowerCase() && 
      cat.id !== editingCategory?.id
    );
    
    if (isDuplicate) {
      newErrors.name = 'Category name already exists';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    if (editingCategory) {
      // Update category
      const updatedCategory = {
        ...editingCategory,
        name: formData.name,
        description: formData.description,
        color: formData.color
      };
      
      dispatch({ type: 'UPDATE_CATEGORY', payload: updatedCategory });
      dispatch({
        type: 'ADD_ACTIVITY',
        payload: {
          id: Date.now().toString(),
          type: 'update',
          description: `Updated category "${formData.name}"`,
          timestamp: new Date(),
          userId: state.auth.user?.id
        }
      });
      
      setIsEditDialogOpen(false);
      setEditingCategory(null);
    } else {
      // Add new category
      const newCategory = {
        id: Date.now().toString(),
        name: formData.name,
        description: formData.description,
        color: formData.color,
        createdAt: new Date()
      };
      
      dispatch({ type: 'ADD_CATEGORY', payload: newCategory });
      dispatch({
        type: 'ADD_ACTIVITY',
        payload: {
          id: Date.now().toString(),
          type: 'add',
          description: `Added new category "${formData.name}"`,
          timestamp: new Date(),
          userId: state.auth.user?.id
        }
      });
      
      setIsAddDialogOpen(false);
    }
    
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      color: '#3B82F6'
    });
    setErrors({});
  };

  const handleEdit = (category: any) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description,
      color: category.color
    });
    setIsEditDialogOpen(true);
  };

  const handleDelete = (category: any) => {
    if (category.id === 'default') {
      alert('Cannot delete the default category');
      return;
    }

    const itemsInCategory = state.items.filter(item => item.categoryId === category.id);
    if (itemsInCategory.length > 0) {
      const confirmDelete = window.confirm(
        `This category contains ${itemsInCategory.length} items. Deleting it will move these items to the default category. Continue?`
      );
      if (!confirmDelete) return;
      
      // Move items to default category
      itemsInCategory.forEach(item => {
        dispatch({
          type: 'UPDATE_ITEM',
          payload: { ...item, categoryId: 'default' }
        });
      });
    }

    dispatch({ type: 'DELETE_CATEGORY', payload: category.id });
    dispatch({
      type: 'ADD_ACTIVITY',
      payload: {
        id: Date.now().toString(),
        type: 'delete',
        description: `Deleted category "${category.name}"`,
        timestamp: new Date(),
        userId: state.auth.user?.id
      }
    });
  };

  const getCategoryItemCount = (categoryId: string) => {
    return state.items.filter(item => item.categoryId === categoryId).length;
  };

  const CategoryForm = () => (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Category Name</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Enter category name"
          className={errors.name ? 'border-red-500' : ''}
        />
        {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Input
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Enter category description"
          className={errors.description ? 'border-red-500' : ''}
        />
        {errors.description && <p className="text-sm text-red-500">{errors.description}</p>}
      </div>

      <div className="space-y-2">
        <Label>Color</Label>
        <div className="grid grid-cols-4 gap-2">
          {colorOptions.map((color) => (
            <button
              key={color.value}
              type="button"
              onClick={() => setFormData({ ...formData, color: color.value })}
              className={`w-12 h-12 rounded-lg border-2 ${
                formData.color === color.value ? 'border-gray-900 dark:border-white' : 'border-gray-200'
              }`}
              style={{ backgroundColor: color.value }}
              title={color.label}
            >
              {formData.color === color.value && (
                <Check className="w-4 h-4 text-white mx-auto" />
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="flex justify-end space-x-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            setIsAddDialogOpen(false);
            setIsEditDialogOpen(false);
            resetForm();
          }}
        >
          Cancel
        </Button>
        <Button type="submit">
          {editingCategory ? 'Update Category' : 'Add Category'}
        </Button>
      </div>
    </form>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <FolderOpen className="w-8 h-8 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Categories</h1>
            <p className="text-gray-500 dark:text-gray-400">
              Manage your inventory categories and organization
            </p>
          </div>
        </div>
        <div className="flex space-x-2">
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Category
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Category</DialogTitle>
              </DialogHeader>
              <CategoryForm />
            </DialogContent>
          </Dialog>
          <Button variant="outline" onClick={() => onViewChange('dashboard')}>
            Back to Dashboard
          </Button>
        </div>
      </div>

      {/* Categories Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {state.categories.map((category) => {
          const itemCount = getCategoryItemCount(category.id);
          return (
            <Card key={category.id} className="relative">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: category.color }}
                    />
                    <CardTitle className="text-lg">{category.name}</CardTitle>
                  </div>
                  <Badge variant="secondary">
                    {itemCount} {itemCount === 1 ? 'item' : 'items'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="mb-4">
                  {category.description}
                </CardDescription>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <Package className="w-4 h-4" />
                    <span>Created {category.createdAt.toLocaleDateString()}</span>
                  </div>
                  
                  <div className="flex space-x-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(category)}
                      disabled={state.auth.user?.role === 'guest'}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(category)}
                      disabled={category.id === 'default' || state.auth.user?.role === 'guest'}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {state.categories.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <FolderOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No Categories Found
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              Create your first category to start organizing your inventory
            </p>
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Category
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Category</DialogTitle>
          </DialogHeader>
          <CategoryForm />
        </DialogContent>
      </Dialog>

      {/* Usage Info */}
      <Card>
        <CardHeader>
          <CardTitle>Category Management Tips</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-semibold mb-2">Best Practices</h4>
              <ul className="space-y-1 text-gray-600 dark:text-gray-300">
                <li>• Use descriptive names for easy identification</li>
                <li>• Choose colors that make sense for your workflow</li>
                <li>• Keep categories broad enough to be useful</li>
                <li>• Regular review and cleanup of unused categories</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Category Actions</h4>
              <ul className="space-y-1 text-gray-600 dark:text-gray-300">
                <li>• Edit category details and colors</li>
                <li>• Delete categories (moves items to default)</li>
                <li>• View item count for each category</li>
                <li>• Filter items by category in search</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Categories;
