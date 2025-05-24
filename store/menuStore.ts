import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MenuItem, Category, OrderType } from '@/types';
import { SAMPLE_MENU_ITEMS, SAMPLE_CATEGORIES } from '@/mocks/data';
import { v4 as uuidv4 } from '@/utils/uuid';

interface MenuState {
  menuItems: MenuItem[];
  categories: Category[];
  getMenuItemById: (id: string) => MenuItem | undefined;
  getMenuItemsByCategory: (categoryId: string) => MenuItem[];
  getMenuItemsByType: (type: OrderType) => MenuItem[];
  getCategoriesByType: (type: OrderType) => Category[];
  getCategoryById: (id: string) => Category | undefined;
  addMenuItem: (item: Omit<MenuItem, 'id'>) => MenuItem;
  updateMenuItem: (id: string, updates: Partial<MenuItem>) => void;
  toggleMenuItemAvailability: (id: string) => void;
  deleteMenuItem: (id: string) => void;
  addCategory: (name: string, type: OrderType) => Category;
  updateCategory: (id: string, name: string, type: OrderType) => void;
  deleteCategory: (id: string) => void;
}

export const useMenuStore = create<MenuState>()(
  persist(
    (set, get) => {
      // Initialize with sample data
      const initialState = {
        menuItems: SAMPLE_MENU_ITEMS,
        categories: SAMPLE_CATEGORIES,
      };
      
      // Log initial state
      console.log('MenuStore initializing with:', {
        menuItemsCount: initialState.menuItems.length,
        categoriesCount: initialState.categories.length,
        sampleMenuItem: initialState.menuItems.length > 0 ? initialState.menuItems[0] : null,
        sampleCategory: initialState.categories.length > 0 ? initialState.categories[0] : null
      });
      
      return {
        ...initialState,
        
        getMenuItemById: (id: string) => {
          const items = get().menuItems;
          return items.find(item => item.id === id);
        },
        
        getMenuItemsByCategory: (categoryId: string) => {
          const items = get().menuItems;
          console.log(`getMenuItemsByCategory(${categoryId}): Total items: ${items.length}`);
          
          // Debug: log all items and their categoryIds
          const result = items.filter(item => item.categoryId === categoryId);
          console.log(`Found ${result.length} items for category ${categoryId}`);
          
          // If no items found, log more details
          if (result.length === 0) {
            console.log('No items found for this category. Checking all categoryIds:');
            const uniqueCategoryIds = [...new Set(items.map(item => item.categoryId))];
            console.log('Unique categoryIds in menuItems:', uniqueCategoryIds);
            
            // Check if the category exists
            const category = get().categories.find(c => c.id === categoryId);
            console.log('Category exists:', !!category, category ? category.name : 'N/A');
          }
          
          return result;
        },
        
        getMenuItemsByType: (type: OrderType) => {
          const items = get().menuItems;
          console.log(`getMenuItemsByType(${type}): Total items: ${items.length}`);
          const result = items.filter(item => item.type === type);
          console.log(`Found ${result.length} items for type ${type}`);
          return result;
        },
        
        getCategoriesByType: (type: OrderType) => {
          const categories = get().categories;
          console.log(`getCategoriesByType(${type}): Total categories: ${categories.length}`);
          const result = categories.filter(category => category.type === type);
          console.log(`Found ${result.length} categories for type ${type}`);
          return result;
        },
        
        getCategoryById: (id: string) => {
          const categories = get().categories;
          return categories.find(category => category.id === id);
        },
        
        addMenuItem: (item) => {
          const newItem: MenuItem = {
            ...item,
            id: `item-${uuidv4()}`,
          };
          
          set(state => ({
            ...state,
            menuItems: [...state.menuItems, newItem]
          }));
          
          return newItem;
        },
        
        updateMenuItem: (id, updates) => {
          set(state => ({
            ...state,
            menuItems: state.menuItems.map(item => 
              item.id === id ? { ...item, ...updates } : item
            )
          }));
        },
        
        toggleMenuItemAvailability: (id) => {
          set(state => ({
            ...state,
            menuItems: state.menuItems.map(item => 
              item.id === id ? { ...item, available: !item.available } : item
            )
          }));
        },
        
        deleteMenuItem: (id) => {
          set(state => ({
            ...state,
            menuItems: state.menuItems.filter(item => item.id !== id)
          }));
        },
        
        addCategory: (name, type) => {
          const newCategory: Category = {
            id: `cat-${uuidv4().substring(0, 8)}`,
            name,
            type,
            order: get().categories.length + 1
          };
          
          set(state => ({
            ...state,
            categories: [...state.categories, newCategory]
          }));
          
          return newCategory;
        },
        
        updateCategory: (id, name, type) => {
          set(state => ({
            ...state,
            categories: state.categories.map(category => 
              category.id === id ? { ...category, name, type } : category
            )
          }));
        },
        
        deleteCategory: (id) => {
          // Don't delete categories that have menu items associated
          const hasMenuItems = get().menuItems.some(item => item.categoryId === id);
          
          if (!hasMenuItems) {
            set(state => ({
              ...state,
              categories: state.categories.filter(category => category.id !== id)
            }));
          }
        },
      };
    },
    {
      name: 'menu-storage',
      storage: createJSONStorage(() => AsyncStorage),
      // Only persist the data, not the methods
      partialize: (state) => ({
        menuItems: state.menuItems,
        categories: state.categories,
      }),
    }
  )
);