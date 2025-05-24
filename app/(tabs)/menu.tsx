import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  FlatList, 
  Alert,
  ScrollView
} from 'react-native';
import { Stack } from 'expo-router';
import { useMenuStore } from '@/store/menuStore';
import { MenuItemCard } from '@/components/MenuItemCard';
import { MenuItemDialog } from '@/components/MenuItemDialog';
import { CategoryDialog } from '@/components/CategoryDialog';
import { MenuItem, Category, OrderType } from '@/types';
import { colors } from '@/constants/colors';
import { Plus, Filter } from 'lucide-react-native';

export default function MenuScreen() {
  const { 
    menuItems, 
    categories, 
    getCategoriesByType,
    getMenuItemsByCategory,
    addMenuItem, 
    updateMenuItem, 
    toggleMenuItemAvailability, 
    deleteMenuItem,
    addCategory,
    updateCategory,
    deleteCategory
  } = useMenuStore();
  
  const [selectedType, setSelectedType] = useState<OrderType>('food');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [menuItemDialogVisible, setMenuItemDialogVisible] = useState(false);
  const [categoryDialogVisible, setCategoryDialogVisible] = useState(false);
  const [selectedMenuItem, setSelectedMenuItem] = useState<MenuItem | null>(null);
  const [selectedCategoryForEdit, setSelectedCategoryForEdit] = useState<Category | null>(null);
  
  // Set initial selected category
  useEffect(() => {
    const typeCategories = getCategoriesByType(selectedType);
    if (typeCategories.length > 0 && !selectedCategory) {
      setSelectedCategory(typeCategories[0].id);
    }
  }, [selectedType, categories, selectedCategory, getCategoriesByType]);
  
  // Get filtered categories based on selected type
  const filteredCategories = getCategoriesByType(selectedType);
  
  // Get filtered menu items based on selected category and type
  const getFilteredItems = () => {
    // If no category is selected, show all items of the selected type
    if (!selectedCategory) {
      return menuItems.filter(item => item.type === selectedType);
    }
    
    // Get items for the selected category
    const items = getMenuItemsByCategory(selectedCategory);
    
    // Filter by type
    return items.filter(item => item.type === selectedType);
  };
  
  const filteredItems = getFilteredItems();
  
  const handleAddMenuItem = () => {
    setSelectedMenuItem(null);
    setMenuItemDialogVisible(true);
  };
  
  const handleEditMenuItem = (item: MenuItem) => {
    setSelectedMenuItem(item);
    setMenuItemDialogVisible(true);
  };
  
  const handleToggleAvailability = (id: string) => {
    toggleMenuItemAvailability(id);
  };
  
  const handleDeleteMenuItem = (id: string) => {
    Alert.alert(
      'Conferma eliminazione',
      'Sei sicuro di voler eliminare questo elemento?',
      [
        { text: 'Annulla', style: 'cancel' },
        { 
          text: 'Elimina', 
          style: 'destructive',
          onPress: () => deleteMenuItem(id)
        }
      ]
    );
  };
  
  const handleSaveMenuItem = (item: Omit<MenuItem, 'id'>) => {
    try {
      if (selectedMenuItem) {
        // Update existing item
        updateMenuItem(selectedMenuItem.id, item);
      } else {
        // Add new item
        addMenuItem(item);
      }
      setMenuItemDialogVisible(false);
    } catch (error) {
      Alert.alert('Errore', 'Si è verificato un errore durante il salvataggio');
    }
  };
  
  const handleAddCategory = () => {
    setSelectedCategoryForEdit(null);
    setCategoryDialogVisible(true);
  };
  
  const handleEditCategory = (category: Category) => {
    setSelectedCategoryForEdit(category);
    setCategoryDialogVisible(true);
  };
  
  const handleSaveCategory = (name: string, type: OrderType) => {
    try {
      if (selectedCategoryForEdit) {
        // Update existing category
        updateCategory(selectedCategoryForEdit.id, name, type);
      } else {
        // Add new category
        const newCategory = addCategory(name, type);
        setSelectedCategory(newCategory.id);
      }
      setCategoryDialogVisible(false);
    } catch (error) {
      Alert.alert('Errore', 'Si è verificato un errore durante il salvataggio');
    }
  };
  
  const handleDeleteCategory = (id: string) => {
    try {
      // Check if there are menu items in this category
      const hasItems = menuItems.some(item => item.categoryId === id);
      
      if (hasItems) {
        Alert.alert(
          'Impossibile eliminare',
          'Questa categoria contiene elementi del menu. Rimuovi prima tutti gli elementi.'
        );
        return;
      }
      
      Alert.alert(
        'Conferma eliminazione',
        'Sei sicuro di voler eliminare questa categoria?',
        [
          { text: 'Annulla', style: 'cancel' },
          { 
            text: 'Elimina', 
            style: 'destructive',
            onPress: () => {
              deleteCategory(id);
              // Reset selected category if it was deleted
              if (selectedCategory === id) {
                const remainingCategories = categories.filter(c => c.id !== id && c.type === selectedType);
                setSelectedCategory(remainingCategories.length > 0 ? remainingCategories[0].id : null);
              }
            }
          }
        ]
      );
    } catch (error) {
      Alert.alert('Errore', 'Si è verificato un errore durante l\'eliminazione');
    }
  };
  
  const renderMenuItem = ({ item }: { item: MenuItem }) => (
    <MenuItemCard
      item={item}
      onEdit={() => handleEditMenuItem(item)}
      onToggleAvailability={() => handleToggleAvailability(item.id)}
      onDelete={() => handleDeleteMenuItem(item.id)}
    />
  );
  
  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{
          title: "Menu",
          headerRight: () => (
            <View style={styles.headerButtons}>
              <TouchableOpacity 
                style={styles.headerButton}
                onPress={handleAddCategory}
              >
                <Plus size={20} color={colors.primary} />
                <Text style={styles.headerButtonText}>Categoria</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.headerButton}
                onPress={handleAddMenuItem}
              >
                <Plus size={20} color={colors.primary} />
                <Text style={styles.headerButtonText}>Elemento</Text>
              </TouchableOpacity>
            </View>
          ),
        }} 
      />
      
      <View style={styles.typeSelector}>
        <TouchableOpacity
          style={[
            styles.typeButton,
            selectedType === 'food' && styles.activeTypeButton
          ]}
          onPress={() => {
            setSelectedType('food');
            setSelectedCategory(null);
          }}
        >
          <Text style={[
            styles.typeButtonText,
            selectedType === 'food' && styles.activeTypeButtonText
          ]}>
            Cibo
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.typeButton,
            selectedType === 'drink' && styles.activeTypeButton
          ]}
          onPress={() => {
            setSelectedType('drink');
            setSelectedCategory(null);
          }}
        >
          <Text style={[
            styles.typeButtonText,
            selectedType === 'drink' && styles.activeTypeButtonText
          ]}>
            Bevande
          </Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.categoriesContainer}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesScrollView}
        >
          <TouchableOpacity
            style={[
              styles.categoryItem,
              selectedCategory === null && styles.selectedCategoryItem
            ]}
            onPress={() => setSelectedCategory(null)}
          >
            <Text 
              style={[
                styles.categoryText,
                selectedCategory === null && styles.selectedCategoryText
              ]}
            >
              Tutti
            </Text>
          </TouchableOpacity>
          
          {filteredCategories.map(category => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryItem,
                selectedCategory === category.id && styles.selectedCategoryItem
              ]}
              onPress={() => setSelectedCategory(category.id)}
              onLongPress={() => handleEditCategory(category)}
            >
              <Text 
                style={[
                  styles.categoryText,
                  selectedCategory === category.id && styles.selectedCategoryText
                ]}
              >
                {category.name}
              </Text>
            </TouchableOpacity>
          ))}
          
          <TouchableOpacity
            style={[styles.categoryItem, styles.addCategoryButton]}
            onPress={handleAddCategory}
          >
            <Plus size={16} color={colors.primary} />
            <Text style={styles.addCategoryText}>Aggiungi</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
      
      {filteredItems.length > 0 ? (
        <FlatList
          data={filteredItems}
          keyExtractor={(item) => item.id}
          renderItem={renderMenuItem}
          contentContainerStyle={styles.menuList}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            Nessun elemento trovato. Aggiungi nuovi elementi al menu.
          </Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={handleAddMenuItem}
          >
            <Plus size={20} color={colors.white} />
            <Text style={styles.addButtonText}>Aggiungi Elemento</Text>
          </TouchableOpacity>
        </View>
      )}
      
      <MenuItemDialog
        visible={menuItemDialogVisible}
        item={selectedMenuItem}
        categories={categories}
        onClose={() => setMenuItemDialogVisible(false)}
        onSave={handleSaveMenuItem}
      />
      
      <CategoryDialog
        visible={categoryDialogVisible}
        category={selectedCategoryForEdit}
        onClose={() => setCategoryDialogVisible(false)}
        onSave={handleSaveCategory}
        onDelete={handleDeleteCategory}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.lightGray,
  },
  headerButtons: {
    flexDirection: 'row',
  },
  headerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 16,
    padding: 4,
  },
  headerButtonText: {
    marginLeft: 4,
    color: colors.primary,
    fontSize: 14,
  },
  typeSelector: {
    flexDirection: 'row',
    padding: 8,
    backgroundColor: colors.white,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 4,
    marginHorizontal: 4,
  },
  activeTypeButton: {
    backgroundColor: colors.primary,
  },
  typeButtonText: {
    color: colors.dark,
    fontWeight: '500',
  },
  activeTypeButtonText: {
    color: colors.white,
  },
  categoriesContainer: {
    backgroundColor: colors.white,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  categoriesScrollView: {
    paddingHorizontal: 16,
  },
  categoryItem: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: colors.lightGray,
  },
  selectedCategoryItem: {
    backgroundColor: colors.primary,
  },
  categoryText: {
    fontSize: 14,
    color: colors.dark,
  },
  selectedCategoryText: {
    color: colors.white,
    fontWeight: 'bold',
  },
  addCategoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.primary,
    borderStyle: 'dashed',
  },
  addCategoryText: {
    marginLeft: 4,
    color: colors.primary,
    fontSize: 14,
  },
  menuList: {
    padding: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    color: colors.gray,
    textAlign: 'center',
    marginBottom: 20,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  addButtonText: {
    color: colors.white,
    marginLeft: 8,
    fontWeight: 'bold',
  },
});