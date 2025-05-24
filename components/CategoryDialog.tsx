import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  Modal, 
  TouchableOpacity, 
  TextInput,
  Alert
} from 'react-native';
import { X, Trash2 } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { Category, OrderType } from '@/types';

interface CategoryDialogProps {
  visible: boolean;
  category: Category | null;
  onClose: () => void;
  onSave: (name: string, type: OrderType) => void;
  onDelete: (id: string) => void;
}

export const CategoryDialog: React.FC<CategoryDialogProps> = ({ 
  visible, 
  category,
  onClose, 
  onSave,
  onDelete
}) => {
  const [name, setName] = useState('');
  const [type, setType] = useState<OrderType>('food');
  
  useEffect(() => {
    if (category) {
      setName(category.name);
      setType(category.type);
    } else {
      setName('');
      setType('food');
    }
  }, [category, visible]);
  
  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert('Errore', 'Il nome è obbligatorio');
      return;
    }
    
    onSave(name.trim(), type);
    setName('');
    setType('food');
  };
  
  const handleDelete = () => {
    if (category) {
      onDelete(category.id);
    }
  };
  
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
              {category ? 'Modifica Categoria' : 'Nuova Categoria'}
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color={colors.dark} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.formContainer}>
            <Text style={styles.label}>Nome Categoria</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Nome della categoria"
            />
            
            <Text style={styles.label}>Tipo</Text>
            <View style={styles.typeContainer}>
              <TouchableOpacity
                style={[
                  styles.typeButton,
                  type === 'food' && styles.selectedType
                ]}
                onPress={() => setType('food')}
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
                onPress={() => setType('drink')}
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
          </View>
          
          <View style={styles.footer}>
            {category && (
              <TouchableOpacity 
                style={styles.deleteButton}
                onPress={handleDelete}
              >
                <Trash2 size={20} color={colors.white} />
              </TouchableOpacity>
            )}
            
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
    maxWidth: 400,
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
  footer: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: colors.lightGray,
  },
  deleteButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.danger,
    borderRadius: 8,
    marginRight: 8,
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