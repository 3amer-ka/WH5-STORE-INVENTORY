/**
 * AddItem component for adding new inventory items
 */
import React, { useState } from 'react';
import { useInventory } from '../../contexts/InventoryContext';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import { 
  Plus, 
  Package, 
  Tag, 
  Save, 
  X,
  AlertCircle,
  CheckCircle,
  ImageIcon,
  QrCode
} from 'lucide-react';
import { InventoryItem } from '../../types/inventory';

interface AddItemProps {
  onViewChange: (view: string) => void;
}

const AddItem: React.FC<AddItemProps> = ({ onViewChange }) => {
  const { state, dispatch } = useInventory();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    quantity: '',
    unitType: 'pieces',
    waybillNumber: '',
    notes: '',
    category: 'default',
    tags: [] as string[],
    minStockLevel: '',
    location: '',
    supplier: '',
    price: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [currentTag, setCurrentTag] = useState('');

  const unitTypes = [
    'pieces', 'kg', 'g', 'liters', 'ml', 'meters', 'cm', 'boxes', 'packs', 'units'
  ];

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Item name is required';
    }

    if (!formData.quantity || isNaN(Number(formData.quantity)) || Number(formData.quantity) < 0) {
      newErrors.quantity = 'Valid quantity is required';
    }

    if (!formData.category) {
      newErrors.category = 'Category is required';
    }

    if (formData.minStockLevel && (isNaN(Number(formData.minStockLevel)) || Number(formData.minStockLevel) < 0)) {
      newErrors.minStockLevel = 'Valid minimum stock level is required';
    }

    if (formData.price && (isNaN(Number(formData.price)) || Number(formData.price) < 0)) {
      newErrors.price = 'Valid price is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitSuccess(false);

    try {
      const newItem: InventoryItem = {
        id: Date.now().toString(),
        name: formData.name.trim(),
        description: formData.description.trim(),
        quantity: Number(formData.quantity),
        unitType: formData.unitType,
        waybillNumber: formData.waybillNumber.trim(),
        notes: formData.notes.trim(),
        category: formData.category,
        tags: formData.tags,
        createdAt: new Date(),
        updatedAt: new Date(),
        minStockLevel: formData.minStockLevel ? Number(formData.minStockLevel) : undefined,
        location: formData.location.trim(),
        supplier: formData.supplier.trim(),
        price: formData.price ? Number(formData.price) : undefined
      };

      dispatch({ type: 'ADD_ITEM', payload: newItem });
      
      // Add activity log
      dispatch({
        type: 'ADD_ACTIVITY',
        payload: {
          id: Date.now().toString(),
          action: 'create',
          itemId: newItem.id,
          itemName: newItem.name,
          timestamp: new Date(),
          details: `Added new item with quantity ${newItem.quantity} ${newItem.unitType}`
        }
      });

      setSubmitSuccess(true);
      
      // Reset form
      setFormData({
        name: '',
        description: '',
        quantity: '',
        unitType: 'pieces',
        waybillNumber: '',
        notes: '',
        category: 'default',
        tags: [],
        minStockLevel: '',
        location: '',
        supplier: '',
        price: ''
      });
      setCurrentTag('');
      setErrors({});

      setTimeout(() => {
        setSubmitSuccess(false);
      }, 3000);
      
    } catch (error) {
      console.error('Error adding item:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const addTag = () => {
    if (currentTag.trim() && !formData.tags.includes(currentTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, currentTag.trim()]
      }));
      setCurrentTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleTagKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Plus className="w-8 h-8 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Add New Item</h1>
            <p className="text-gray-500 dark:text-gray-400">
              Add a new item to your inventory
            </p>
          </div>
        </div>
        <Button variant="outline" onClick={() => onViewChange('dashboard')}>
          Back to Dashboard
        </Button>
      </div>

      {submitSuccess && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="w-4 h-4 text-green-600" />
          <AlertDescription className="text-green-800">
            Item added successfully! You can continue adding more items.
          </AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Package className="w-5 h-5" />
                <span>Basic Information</span>
              </CardTitle>
              <CardDescription>
                Essential details about the inventory item
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Item Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Enter item name"
                  className={errors.name ? 'border-red-500' : ''}
                />
                {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Enter item description"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantity *</Label>
                  <Input
                    id="quantity"
                    type="number"
                    value={formData.quantity}
                    onChange={(e) => handleInputChange('quantity', e.target.value)}
                    placeholder="0"
                    min="0"
                    step="0.01"
                    className={errors.quantity ? 'border-red-500' : ''}
                  />
                  {errors.quantity && <p className="text-sm text-red-500">{errors.quantity}</p>}
                </div>

                <div className="space-y-2">
                  <Label>Unit Type</Label>
                  <Select value={formData.unitType} onValueChange={(value) => handleInputChange('unitType', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {unitTypes.map(unit => (
                        <SelectItem key={unit} value={unit}>
                          {unit}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                  <SelectTrigger className={errors.category ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {state.categories.map(category => (
                      <SelectItem key={category.id} value={category.id}>
                        <div className="flex items-center space-x-2">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: category.color }}
                          />
                          <span>{category.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.category && <p className="text-sm text-red-500">{errors.category}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="waybill">Waybill Number</Label>
                <Input
                  id="waybill"
                  value={formData.waybillNumber}
                  onChange={(e) => handleInputChange('waybillNumber', e.target.value)}
                  placeholder="Enter waybill number"
                />
              </div>
            </CardContent>
          </Card>

          {/* Additional Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Tag className="w-5 h-5" />
                <span>Additional Details</span>
              </CardTitle>
              <CardDescription>
                Optional information for better inventory management
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  placeholder="Storage location"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="supplier">Supplier</Label>
                <Input
                  id="supplier"
                  value={formData.supplier}
                  onChange={(e) => handleInputChange('supplier', e.target.value)}
                  placeholder="Supplier name"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="minStock">Min Stock Level</Label>
                  <Input
                    id="minStock"
                    type="number"
                    value={formData.minStockLevel}
                    onChange={(e) => handleInputChange('minStockLevel', e.target.value)}
                    placeholder="0"
                    min="0"
                    className={errors.minStockLevel ? 'border-red-500' : ''}
                  />
                  {errors.minStockLevel && <p className="text-sm text-red-500">{errors.minStockLevel}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="price">Price</Label>
                  <Input
                    id="price"
                    type="number"
                    value={formData.price}
                    onChange={(e) => handleInputChange('price', e.target.value)}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    className={errors.price ? 'border-red-500' : ''}
                  />
                  {errors.price && <p className="text-sm text-red-500">{errors.price}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tags">Tags</Label>
                <div className="flex space-x-2">
                  <Input
                    id="tags"
                    value={currentTag}
                    onChange={(e) => setCurrentTag(e.target.value)}
                    onKeyPress={handleTagKeyPress}
                    placeholder="Add tags..."
                  />
                  <Button type="button" variant="outline" onClick={addTag}>
                    Add
                  </Button>
                </div>
                {formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="flex items-center space-x-1">
                        <span>{tag}</span>
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="ml-1 text-red-500 hover:text-red-700"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  placeholder="Additional notes..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end space-x-4 mt-6">
          <Button type="button" variant="outline" onClick={() => onViewChange('dashboard')}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Adding...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Add Item
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AddItem;