import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  Modal, 
  TouchableOpacity, 
  FlatList, 
  TextInput,
  Alert,
  ScrollView,
  Platform,
  Dimensions
} from 'react-native';
import { X, Trash, Plus, Minus, MessageSquare, Check } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { useMenuStore } from '@/store/menuStore';
import { useOrderStore } from '@/store/orderStore';
import { MenuItem, OrderItem, Category, Table } from '@/types';
import { formatCurrency } from '@/utils/formatters';
import { v4 as generateId } from '@/utils/uuid';

interface OrderDialogProps {
  visible: boolean;
  table: Table | null;
  existingOrderItems?: OrderItem[];
  onClose: () => void;
  onSave: (items: OrderItem[]) => void;
  onUpdateTableSeats?: (tableId: string, seats: number) => void;
}

const { width, height } = Dimensions.get('window');
const isSmallScreen = width < 768;

export const OrderDialog: React.FC<OrderDialogProps> = ({ 
  visible, 
  table, 
  existingOrderItems = [],
  onClose, 
  onSave,
  onUpdateTableSeats
}) => {
  // Get menu data directly from the store
  const { 
    menuItems, 
    categories, 
    getCategoriesByType, 
    getMenuItemsByCategory 
  } = useMenuStore();
  
  const { printOrder } = useOrderStore();
  
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [notesModalVisible, setNotesModalVisible] = useState(false);
  const [currentItemId, setCurrentItemId] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [activeType, setActiveType] = useState<'food' | 'drink'>('food');
  const [searchText, setSearchText] = useState('');
  
  // Reset state when dialog is opened
  useEffect(() => {
    if (visible) {
      setOrderItems(existingOrderItems || []);
      
      // Reset selected category when dialog opens
      const foodCategories = getCategoriesByType('food');
      if (foodCategories.length > 0) {
        setSelectedCategory(foodCategories[0].id);
      } else {
        setSelectedCategory(null);
      }
      
      setActiveType('food');
      setSearchText('');
    }
  }, [visible, existingOrderItems, getCategoriesByType]);
  
  // Get filtered categories based on active type
  const filteredCategories = getCategoriesByType(activeType);
  
  // Get filtered menu items based on selected category, active type, and search text
  const getFilteredItems = () => {
    // If search text is provided, search across all items of the active type
    if (searchText.trim().length > 0) {
      return menuItems.filter(item => 
        item.type === activeType && 
        item.available &&
        (item.name.toLowerCase().includes(searchText.toLowerCase()) ||
         (item.description && item.description.toLowerCase().includes(searchText.toLowerCase())))
      );
    }
    
    // Otherwise filter by selected category
    if (!selectedCategory) return [];
    
    // Get items for the selected category
    const items = getMenuItemsByCategory(selectedCategory);
    
    // Filter by type and availability
    return items.filter(item => 
      item.type === activeType && 
      item.available
    );
  };
  
  const filteredItems = getFilteredItems();
  
  const totalAmount = orderItems.reduce(
    (sum, item) => sum + (item.price * item.quantity), 
    0
  );
  
  const handleAddItem = (menuItem: MenuItem) => {
    // Check if item already exists in order
    const existingItemIndex = orderItems.findIndex(
      item => item.menuItemId === menuItem.id
    );
    
    if (existingItemIndex >= 0) {
      // Increment quantity if item already exists
      const updatedItems = [...orderItems];
      updatedItems[existingItemIndex] = {
        ...updatedItems[existingItemIndex],
        quantity: updatedItems[existingItemIndex].quantity + 1
      };
      setOrderItems(updatedItems);
    } else {
      // Add new item to order
      const newItem: OrderItem = {
        id: generateId(),
        menuItemId: menuItem.id,
        name: menuItem.name,
        price: menuItem.price,
        quantity: 1,
        type: menuItem.type,
        status: 'pending'
      };
      setOrderItems([...orderItems, newItem]);
    }
  };
  
  const handleRemoveItem = (itemId: string) => {
    setOrderItems(orderItems.filter(item => item.id !== itemId));
  };
  
  const handleUpdateQuantity = (itemId: string, increment: boolean) => {
    const updatedItems = orderItems.map(item => {
      if (item.id === itemId) {
        const newQuantity = increment ? item.quantity + 1 : Math.max(1, item.quantity - 1);
        return { ...item, quantity: newQuantity };
      }
      return item;
    });
    setOrderItems(updatedItems);
  };
  
  const handleAddNotes = (itemId: string) => {
    const item = orderItems.find(item => item.id === itemId);
    if (item) {
      setCurrentItemId(itemId);
      setNotes(item.notes || '');
      setNotesModalVisible(true);
    }
  };
  
  const handleSaveNotes = () => {
    if (currentItemId) {
      const updatedItems = orderItems.map(item => {
        if (item.id === currentItemId) {
          return { ...item, notes: notes.trim() };
        }
        return item;
      });
      setOrderItems(updatedItems);
    }
    setNotesModalVisible(false);
    setCurrentItemId(null);
    setNotes('');
  };
  
  const handleConfirmOrder = () => {
    if (orderItems.length === 0) {
      Alert.alert('Errore', 'Aggiungi almeno un elemento all\'ordine');
      return;
    }
    
    try {
      // Save the order
      onSave(orderItems);
    } catch (error) {
      Alert.alert('Errore', 'Si è verificato un errore durante la creazione dell\'ordine');
    }
  };
  
  const renderCategoryItem = ({ item }: { item: Category }) => (
    <TouchableOpacity
      style={[
        styles.categoryItem,
        selectedCategory === item.id && styles.selectedCategoryItem
      ]}
      onPress={() => setSelectedCategory(item.id)}
    >
      <Text 
        style={[
          styles.categoryText,
          selectedCategory === item.id && styles.selectedCategoryText
        ]}
      >
        {item.name}
      </Text>
    </TouchableOpacity>
  );
  
  const renderMenuItem = ({ item }: { item: MenuItem }) => (
    <TouchableOpacity 
      style={styles.menuItem}
      onPress={() => handleAddItem(item)}
    >
      <View style={styles.menuItemContent}>
        <Text style={styles.menuItemName}>{item.name}</Text>
        <Text style={styles.menuItemPrice}>{formatCurrency(item.price)}</Text>
      </View>
      <Text style={styles.menuItemDescription} numberOfLines={2}>
        {item.description}
      </Text>
    </TouchableOpacity>
  );
  
  const renderOrderItem = ({ item }: { item: OrderItem }) => (
    <View style={styles.orderItem}>
      <View style={styles.orderItemHeader}>
        <Text style={styles.orderItemName}>{item.name}</Text>
        <TouchableOpacity
          style={styles.removeButton}
          onPress={() => handleRemoveItem(item.id)}
        >
          <Trash size={18} color={colors.danger} />
        </TouchableOpacity>
      </View>
      
      <View style={styles.orderItemDetails}>
        <View style={styles.quantityContainer}>
          <TouchableOpacity
            style={styles.quantityButton}
            onPress={() => handleUpdateQuantity(item.id, false)}
          >
            <Minus size={16} color={colors.dark} />
          </TouchableOpacity>
          
          <Text style={styles.quantityText}>{item.quantity}</Text>
          
          <TouchableOpacity
            style={styles.quantityButton}
            onPress={() => handleUpdateQuantity(item.id, true)}
          >
            <Plus size={16} color={colors.dark} />
          </TouchableOpacity>
        </View>
        
        <Text style={styles.orderItemPrice}>
          {formatCurrency(item.price * item.quantity)}
        </Text>
        
        <TouchableOpacity
          style={styles.notesButton}
          onPress={() => handleAddNotes(item.id)}
        >
          <View style={styles.notesButtonContent}>
            <MessageSquare size={16} color={colors.primary} />
            <Text style={styles.notesButtonText}>
              {item.notes ? 'Modifica note' : 'Aggiungi note'}
            </Text>
          </View>
        </TouchableOpacity>
      </View>
      
      {item.notes && (
        <View style={styles.notesContainer}>
          <Text style={styles.notesText}>{item.notes}</Text>
        </View>
      )}
    </View>
  );
  
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Ordine Tavolo {table?.number}</Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <X size={24} color={colors.dark} />
            </TouchableOpacity>
          </View>
          
          <View style={[styles.modalBody, isSmallScreen && styles.modalBodySmall]}>
            <View style={[styles.menuSection, isSmallScreen && styles.menuSectionSmall]}>
              <View style={styles.typeSelector}>
                <TouchableOpacity
                  style={[
                    styles.typeButton,
                    activeType === 'food' && styles.activeTypeButton
                  ]}
                  onPress={() => {
                    setActiveType('food');
                    setSearchText('');
                    // Reset selected category when changing type
                    const foodCategories = getCategoriesByType('food');
                    setSelectedCategory(foodCategories.length > 0 ? foodCategories[0].id : null);
                  }}
                >
                  <Text style={[
                    styles.typeButtonText,
                    activeType === 'food' && styles.activeTypeButtonText
                  ]}>
                    Cibo
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.typeButton,
                    activeType === 'drink' && styles.activeTypeButton
                  ]}
                  onPress={() => {
                    setActiveType('drink');
                    setSearchText('');
                    // Reset selected category when changing type
                    const drinkCategories = getCategoriesByType('drink');
                    setSelectedCategory(drinkCategories.length > 0 ? drinkCategories[0].id : null);
                  }}
                >
                  <Text style={[
                    styles.typeButtonText,
                    activeType === 'drink' && styles.activeTypeButtonText
                  ]}>
                    Bevande
                  </Text>
                </TouchableOpacity>
              </View>
              
              {/* Search bar */}
              <View style={styles.searchContainer}>
                <TextInput
                  style={styles.searchInput}
                  placeholder={`Cerca ${activeType === 'food' ? 'piatti' : 'bevande'}...`}
                  value={searchText}
                  onChangeText={setSearchText}
                />
                {searchText.length > 0 && (
                  <TouchableOpacity 
                    style={styles.clearSearchButton}
                    onPress={() => setSearchText('')}
                  >
                    <X size={16} color={colors.gray} />
                  </TouchableOpacity>
                )}
              </View>
              
              {searchText.length === 0 && filteredCategories.length > 0 && (
                <FlatList
                  horizontal
                  data={filteredCategories}
                  keyExtractor={(item) => item.id}
                  renderItem={renderCategoryItem}
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.categoriesList}
                />
              )}
              
              {(searchText.length > 0 || selectedCategory) && (
                <FlatList
                  data={filteredItems}
                  keyExtractor={(item) => item.id}
                  renderItem={renderMenuItem}
                  showsVerticalScrollIndicator={true}
                  contentContainerStyle={styles.menuList}
                  ListEmptyComponent={
                    <View style={styles.emptyMenuContainer}>
                      <Text style={styles.emptyMenuText}>
                        {searchText.length > 0 
                          ? 'Nessun risultato trovato' 
                          : 'Nessun elemento disponibile in questa categoria'}
                      </Text>
                    </View>
                  }
                />
              )}
            </View>
            
            <View style={[styles.orderSection, isSmallScreen && styles.orderSectionSmall]}>
              <Text style={styles.sectionTitle}>Riepilogo Ordine</Text>
              
              {orderItems.length === 0 ? (
                <View style={styles.emptyOrderContainer}>
                  <Text style={styles.emptyOrderText}>
                    Nessun elemento aggiunto all'ordine
                  </Text>
                </View>
              ) : (
                <FlatList
                  data={orderItems}
                  keyExtractor={(item) => item.id}
                  renderItem={renderOrderItem}
                  showsVerticalScrollIndicator={true}
                  contentContainerStyle={styles.orderList}
                />
              )}
              
              <View style={styles.totalContainer}>
                <Text style={styles.totalLabel}>Totale</Text>
                <Text style={styles.totalAmount}>{formatCurrency(totalAmount)}</Text>
              </View>
              
              <TouchableOpacity
                style={[
                  styles.confirmButton,
                  orderItems.length === 0 && styles.disabledButton
                ]}
                onPress={handleConfirmOrder}
                disabled={orderItems.length === 0}
              >
                <Check size={20} color={colors.white} />
                <Text style={styles.confirmButtonText}>Conferma Ordine</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
      
      {/* Notes Modal */}
      <Modal
        visible={notesModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setNotesModalVisible(false)}
      >
        <View style={styles.notesModalContainer}>
          <View style={styles.notesModalContent}>
            <View style={styles.notesModalHeader}>
              <Text style={styles.notesModalTitle}>Note</Text>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setNotesModalVisible(false)}
              >
                <X size={20} color={colors.dark} />
              </TouchableOpacity>
            </View>
            
            <TextInput
              style={styles.notesInput}
              value={notes}
              onChangeText={setNotes}
              placeholder="Inserisci note per questo elemento..."
              multiline
              maxLength={200}
            />
            
            <TouchableOpacity
              style={styles.saveNotesButton}
              onPress={handleSaveNotes}
            >
              <Text style={styles.saveNotesButtonText}>Salva</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors.white,
    borderRadius: 12,
    width: '95%',
    height: '90%',
    overflow: 'hidden',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
    backgroundColor: colors.primary,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.white,
  },
  closeButton: {
    padding: 4,
  },
  modalBody: {
    flex: 1,
    flexDirection: 'row',
  },
  modalBodySmall: {
    flexDirection: 'column',
  },
  menuSection: {
    flex: 3,
    borderRightWidth: 1,
    borderRightColor: colors.lightGray,
  },
  menuSectionSmall: {
    flex: 1,
    borderRightWidth: 0,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  typeSelector: {
    flexDirection: 'row',
    padding: 8,
    backgroundColor: colors.white,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 12,
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
    fontSize: 16,
  },
  activeTypeButtonText: {
    color: colors.white,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  searchInput: {
    flex: 1,
    height: 40,
    backgroundColor: colors.lightGray,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
  },
  clearSearchButton: {
    position: 'absolute',
    right: 24,
    padding: 4,
  },
  categoriesList: {
    paddingHorizontal: 16,
    paddingVertical: 12,
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
  menuList: {
    padding: 16,
    paddingTop: 0,
  },
  menuItem: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: colors.lightGray,
    marginBottom: 8,
  },
  menuItemContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  menuItemName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.dark,
    flex: 1,
  },
  menuItemPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primary,
  },
  menuItemDescription: {
    fontSize: 14,
    color: colors.gray,
  },
  orderSection: {
    flex: 2,
    padding: 16,
    backgroundColor: colors.white,
  },
  orderSectionSmall: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.dark,
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
    paddingBottom: 8,
  },
  emptyMenuContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyMenuText: {
    color: colors.gray,
    textAlign: 'center',
    fontSize: 16,
  },
  emptyOrderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyOrderText: {
    color: colors.gray,
    textAlign: 'center',
    fontSize: 16,
  },
  orderList: {
    flexGrow: 1,
  },
  orderItem: {
    backgroundColor: colors.white,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.lightGray,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
  orderItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  orderItemName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.dark,
    flex: 1,
  },
  removeButton: {
    padding: 4,
  },
  orderItemDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: isSmallScreen ? 8 : 0,
  },
  quantityButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.dark,
    marginHorizontal: 12,
  },
  orderItemPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: isSmallScreen ? 8 : 0,
  },
  notesButton: {
    marginLeft: 8,
  },
  notesButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  notesButtonText: {
    fontSize: 14,
    color: colors.primary,
    marginLeft: 4,
  },
  notesContainer: {
    backgroundColor: colors.lightGray,
    borderRadius: 4,
    padding: 8,
    marginTop: 8,
  },
  notesText: {
    fontSize: 14,
    color: colors.dark,
    fontStyle: 'italic',
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: colors.lightGray,
    marginTop: 8,
  },
  totalLabel: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.dark,
  },
  totalAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
  },
  confirmButton: {
    backgroundColor: colors.success,
    borderRadius: 8,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  disabledButton: {
    backgroundColor: colors.gray,
    opacity: 0.7,
  },
  confirmButtonText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  notesModalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  notesModalContent: {
    backgroundColor: colors.white,
    borderRadius: 12,
    width: '80%',
    padding: 16,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  notesModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  notesModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.dark,
  },
  notesInput: {
    borderWidth: 1,
    borderColor: colors.lightGray,
    borderRadius: 8,
    padding: 12,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  saveNotesButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  saveNotesButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
});