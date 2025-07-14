/**
 * SearchFilter component for advanced search and filtering of inventory items
 */
import React, { useState, useEffect } from 'react';
import { useInventory } from '../../contexts/InventoryContext';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { 
  Search, 
  Filter, 
  X, 
  Package, 
  SortAsc, 
  SortDesc,
  Calendar,
  Tag,
  RotateCcw
} from 'lucide-react';
import { InventoryItem } from '../../types/inventory';

interface SearchFilterProps {
  onViewChange: (view: string) => void;
}

const SearchFilter: React.FC<SearchFilterProps> = ({ onViewChange }) => {
  const { state } = useInventory();
  const [filters, setFilters] = useState({
    search: '',
    category: 'all',
    minQuantity: '',
    maxQuantity: '',
    dateFrom: '',
    dateTo: '',
    tags: [] as string[]
  });
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [filteredItems, setFilteredItems] = useState<InventoryItem[]>([]);

  // Filter and sort items
  useEffect(() => {
    let filtered = state.items.filter(item => {
      // Search filter
      const matchesSearch = !filters.search || 
        item.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        item.description?.toLowerCase().includes(filters.search.toLowerCase()) ||
        item.waybillNumber?.toLowerCase().includes(filters.search.toLowerCase());

      // Category filter
      const matchesCategory = filters.category === 'all' || item.category === filters.category;

      // Quantity filters
      const matchesMinQuantity = !filters.minQuantity || item.quantity >= parseInt(filters.minQuantity);
      const matchesMaxQuantity = !filters.maxQuantity || item.quantity <= parseInt(filters.maxQuantity);

      // Date filters
      const matchesDateFrom = !filters.dateFrom || new Date(item.createdAt) >= new Date(filters.dateFrom);
      const matchesDateTo = !filters.dateTo || new Date(item.createdAt) <= new Date(filters.dateTo);

      // Tags filter
      const matchesTags = filters.tags.length === 0 || 
        filters.tags.every(tag => item.tags.includes(tag));

      return matchesSearch && matchesCategory && matchesMinQuantity && 
             matchesMaxQuantity && matchesDateFrom && matchesDateTo && matchesTags;
    });

    // Sort items
    filtered.sort((a, b) => {
      let aValue: any = a[sortBy as keyof InventoryItem];
      let bValue: any = b[sortBy as keyof InventoryItem];

      if (sortBy === 'createdAt' || sortBy === 'updatedAt') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }

      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredItems(filtered);
  }, [state.items, filters, sortBy, sortOrder]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      category: 'all',
      minQuantity: '',
      maxQuantity: '',
      dateFrom: '',
      dateTo: '',
      tags: []
    });
  };

  const getCategoryName = (categoryId: string) => {
    const category = state.categories.find(c => c.id === categoryId);
    return category?.name || 'Unknown';
  };

  const getCategoryColor = (categoryId: string) => {
    const category = state.categories.find(c => c.id === categoryId);
    return category?.color || '#6B7280';
  };

  const getStockStatus = (quantity: number) => {
    if (quantity === 0) return { status: 'Out of Stock', color: 'bg-red-100 text-red-800' };
    if (quantity < 10) return { status: 'Low Stock', color: 'bg-yellow-100 text-yellow-800' };
    return { status: 'In Stock', color: 'bg-green-100 text-green-800' };
  };

  const allTags = [...new Set(state.items.flatMap(item => item.tags))];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Search className="w-8 h-8 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Search & Filter</h1>
            <p className="text-gray-500 dark:text-gray-400">
              Advanced search and filtering for your inventory
            </p>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={clearFilters}>
            <RotateCcw className="w-4 h-4 mr-2" />
            Clear Filters
          </Button>
          <Button variant="outline" onClick={() => onViewChange('dashboard')}>
            Back to Dashboard
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Filters Panel */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Filter className="w-5 h-5" />
              <span>Filters</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Search */}
            <div className="space-y-2">
              <Label htmlFor="search">Search</Label>
              <Input
                id="search"
                placeholder="Search items..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
              />
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={filters.category} onValueChange={(value) => handleFilterChange('category', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {state.categories.map((category) => (
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
            </div>

            <Separator />

            {/* Quantity Range */}
            <div className="space-y-2">
              <Label>Quantity Range</Label>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  type="number"
                  placeholder="Min"
                  value={filters.minQuantity}
                  onChange={(e) => handleFilterChange('minQuantity', e.target.value)}
                />
                <Input
                  type="number"
                  placeholder="Max"
                  value={filters.maxQuantity}
                  onChange={(e) => handleFilterChange('maxQuantity', e.target.value)}
                />
              </div>
            </div>

            {/* Date Range */}
            <div className="space-y-2">
              <Label>Date Range</Label>
              <div className="space-y-2">
                <Input
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                />
                <Input
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                />
              </div>
            </div>

            <Separator />

            {/* Sort Options */}
            <div className="space-y-2">
              <Label>Sort By</Label>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="quantity">Quantity</SelectItem>
                  <SelectItem value="createdAt">Date Created</SelectItem>
                  <SelectItem value="updatedAt">Date Updated</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Sort Order</Label>
              <Select value={sortOrder} onValueChange={setSortOrder}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="asc">
                    <div className="flex items-center space-x-2">
                      <SortAsc className="w-4 h-4" />
                      <span>Ascending</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="desc">
                    <div className="flex items-center space-x-2">
                      <SortDesc className="w-4 h-4" />
                      <span>Descending</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Results Summary */}
            <Separator />
            <div className="text-sm text-gray-500">
              Showing {filteredItems.length} of {state.items.length} items
            </div>
          </CardContent>
        </Card>

        {/* Results Panel */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Package className="w-5 h-5" />
              <span>Results</span>
            </CardTitle>
            <CardDescription>
              {filteredItems.length} items found
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredItems.length === 0 ? (
              <div className="text-center py-12">
                <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  No items found
                </h3>
                <p className="text-gray-500 mb-4">
                  Try adjusting your search criteria or clearing filters.
                </p>
                <Button onClick={clearFilters}>
                  Clear Filters
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredItems.map((item) => {
                  const stockStatus = getStockStatus(item.quantity);
                  return (
                    <div key={item.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg">{item.name}</h3>
                          <p className="text-sm text-gray-500 mt-1">{item.description}</p>
                        </div>
                        <Badge className={stockStatus.color}>
                          {stockStatus.status}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium">Quantity:</span>
                          <span className="text-sm">{item.quantity} {item.unitType}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium">Category:</span>
                          <div className="flex items-center space-x-1">
                            <div 
                              className="w-3 h-3 rounded-full" 
                              style={{ backgroundColor: getCategoryColor(item.category) }}
                            />
                            <span className="text-sm">{getCategoryName(item.category)}</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium">Created:</span>
                          <span className="text-sm">{new Date(item.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>

                      {item.waybillNumber && (
                        <div className="flex items-center space-x-2 mb-3">
                          <span className="text-sm font-medium">Waybill:</span>
                          <span className="text-sm">{item.waybillNumber}</span>
                        </div>
                      )}

                      {item.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {item.tags.map((tag) => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              <Tag className="w-3 h-3 mr-1" />
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SearchFilter;