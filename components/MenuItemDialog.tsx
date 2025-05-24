import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  Modal, 
  TouchableOpacity, 
  TextInput,
  ScrollView,
  Alert
} from 'react-native';
import { X, Trash2 } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { MenuItem, Category, OrderType } from '@/types';

interface MenuItemDialogProps {
  visible: boolean;
  item: MenuItem | null;
  categories: Category[];
  onClose: () => void;
  onSave: (item: Omit<MenuItem, 'id'>) => void;
}

export const MenuItemDialog: React.FC<MenuItemDialogProps> = ({ 
  visible, 
  item,
  categories,
  onClose, 
  onSave
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [type, setType] = useState<OrderType>('food');
  const [available, setAvailable] = useState(true);
  
  useEffect(() => {
    if (item) {
      setName(item.name);
      setDescription(item.description);
      setPrice(item.price.toString());
      setCategoryId(item.categoryId);
      setType(item.type);
      setAvailable(item.available);
    } else {
      setName('');
      setDescription('');
      setPrice('');
      setCategoryId(categories.length > 0 ? categories[0].id : '');
      setType('food');
      setAvailable(true);
    }
  }, [item, categories, visible]);
  
  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert('Errore', 'Il nome è obbligatorio');
      return;
    }
    
    if (!description.trim()) {
      Alert.alert('Errore', 'La descrizione è obbligatoria');
      return;
    }
    
    const priceValue = parseFloat(price);
    if (isNaN(priceValue) || priceValue <= 0) {
      Alert.alert('Errore', 'Il prezzo deve essere un numero positivo');
      return;
    }
    
    if (!categoryId) {
      Alert.alert('Errore', 'Seleziona una categoria');
      return;
    }
    
    onSave({
      name: name.trim(),
      description: description.trim(),
      price: priceValue,
      categoryId,
      type,
      available
    });
    
    // Reset form
    setName('');
    setDescription('');
    setPrice('');
    setCategoryId(categories.length > 0 ? categories[0].id : '');
    setType('food');
    setAvailable(true);
  };
  
  // Filter categories based on selected type
  const filteredCategories = categories.filter(category => category.type === type);
  
  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.title}>
              {item ? 'Modifica Elemento' : 'Nuovo Elemento'}
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color={colors.dark} />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.formContainer}>
            <Text style={styles.label}>Nome</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Nome dell'elemento"
            />
            
            <Text style={styles.label}>Descrizione</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={description}
              onChangeText={setDescription}
              placeholder="Descrizione dell'elemento"
              multiline
              numberOfLines={3}
            />
            
            <Text style={styles.label}>Prezzo (€)</Text>
            <TextInput
              style={styles.input}
              value={price}
              onChangeText={setPrice}
              placeholder="0.00"
              keyboardType="numeric"
            />
            
            <Text style={styles.label}>Tipo</Text>
            <View style={styles.typeContainer}>
              <TouchableOpacity
                style={[
                  styles.typeButton,
                  type === 'food' && styles.selectedType
                ]}
                onPress={() => {
                  setType('food');
                  // Reset category when changing type
                  const foodCategories = categories.filter(cat => cat.type === 'food');
                  setCategoryId(foodCategories.length > 0 ? foodCategories[0].id : '');
                }}
              >
                <Text 
                  style={[
                    styles.typeText,
                    type === 'food' && styles.selectedTypeText
                  ]}
                >
                  Cibo
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.typeButton,
                  type === 'drink' && styles.selectedType
                ]}
                onPress={() => {
                  setType('drink');
                  // Reset category when changing type
                  const drinkCategories = categories.filter(cat => cat.type === 'drink');
                  setCategoryId(drinkCategories.length > 0 ? drinkCategories[0].id : '');
                }}
              >
                <Text 
                  style={[
                    styles.typeText,
                    type === 'drink' && styles.selectedTypeText
                  ]}
                >
                  Bevanda
                </Text>
              </TouchableOpacity>
            </View>
            
            <Text style={styles.label}>Categoria</Text>
            {filteredCategories.length > 0 ? (
              <View style={styles.categoriesContainer}>
                {filteredCategories.map((category) => (
                  <TouchableOpacity
                    key={category.id}
                    style={[
                      styles.categoryButton,
                      categoryId === category.id && styles.selectedCategory
                    ]}
                    onPress={() => setCategoryId(category.id)}
                  >
                    <Text 
                      style={[
                        styles.categoryText,
                        categoryId === category.id && styles.selectedCategoryText
                      ]}
                    >
                      {category.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <Text style={styles.noCategories}>
                Nessuna categoria disponibile per questo tipo. Crea prima una categoria.
              </Text>
            )}
            
            <Text style={styles.label}>Disponibilità</Text>
            <View style={styles.availabilityContainer}>
              <TouchableOpacity
                style={[
                  styles.availabilityButton,
                  available && styles.selectedAvailability
                ]}
                onPress={() => setAvailable(true)}
              >
                <Text 
                  style={[
                    styles.availabilityText,
                    available && styles.selectedAvailabilityText
                  ]}
                >
                  Disponibile
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.availabilityButton,
                  !available && styles.selectedAvailability
                ]}
                onPress={() => setAvailable(false)}
              >
                <Text 
                  style={[
                    styles.availabilityText,
                    !available && styles.selectedAvailabilityText
                  ]}
                >
                  Non Disponibile
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
          
          <View style={styles.footer}>
            <TouchableOpacity 
              style={styles.cancelButton}
              onPress={onClose}
            >
              <Text style={styles.cancelButtonText}>Annulla</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.saveButton}
              onPress={handleSave}
            >
              <Text style={styles.saveButtonText}>Salva</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
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
    width: '90%',
    maxWidth: 500,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.dark,
  },
  closeButton: {
    padding: 4,
  },
  formContainer: {
    padding: 16,
    maxHeight: 500,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.dark,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.lightGray,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  typeContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.lightGray,
    marginHorizontal: 4,
  },
  selectedType: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  typeText: {
    color: colors.dark,
    fontWeight: '500',
  },
  selectedTypeText: {
    color: colors.white,
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    margin: 4,
    borderRadius: 20,
    backgroundColor: colors.lightGray,
  },
  selectedCategory: {
    backgroundColor: colors.primary,
  },
  categoryText: {
    color: colors.dark,
  },
  selectedCategoryText: {
    color: colors.white,
  },
  noCategories: {
    color: colors.danger,
    marginBottom: 16,
  },
  availabilityContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  availabilityButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.lightGray,
    marginHorizontal: 4,
  },
  selectedAvailability: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  availabilityText: {
    color: colors.dark,
    fontWeight: '500',
  },
  selectedAvailabilityText: {
    color: colors.white,
  },
  footer: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: colors.lightGray,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    marginRight: 8,
    borderWidth: 1,
    borderColor: colors.lightGray,
    borderRadius: 8,
  },
  cancelButtonText: {
    color: colors.dark,
    fontWeight: '500',
  },
  saveButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 8,
  },
  saveButtonText: {
    color: colors.white,
    fontWeight: '500',
  },
});