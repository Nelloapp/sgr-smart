import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  Modal, 
  TouchableOpacity, 
  TextInput,
  Alert,
  Platform
} from 'react-native';
import { X, Trash2, Plus, Minus } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { Table } from '@/types';

interface TableDialogProps {
  visible: boolean;
  table: Table | null;
  onClose: () => void;
  onSave: (tableNumber: number, seats: number) => void;
  onDelete?: (tableId: string) => void;
}

export const TableDialog: React.FC<TableDialogProps> = ({ 
  visible, 
  table,
  onClose, 
  onSave,
  onDelete
}) => {
  const [tableNumber, setTableNumber] = useState('');
  const [seats, setSeats] = useState('');
  
  useEffect(() => {
    if (table) {
      setTableNumber(table.number.toString());
      setSeats(table.seats.toString());
    } else {
      setTableNumber('');
      setSeats('4'); // Valore predefinito
    }
  }, [table, visible]);
  
  const handleSave = () => {
    const tableNumberInt = parseInt(tableNumber);
    const seatsInt = parseInt(seats);
    
    if (isNaN(tableNumberInt) || tableNumberInt <= 0) {
      Alert.alert('Errore', 'Inserisci un numero di tavolo valido');
      return;
    }
    
    if (isNaN(seatsInt) || seatsInt <= 0) {
      Alert.alert('Errore', 'Inserisci un numero di posti valido');
      return;
    }
    
    onSave(tableNumberInt, seatsInt);
    setTableNumber('');
    setSeats('4');
  };
  
  const handleDelete = () => {
    if (table && onDelete) {
      Alert.alert(
        "Conferma eliminazione",
        `Sei sicuro di voler eliminare il tavolo ${table.number}?`,
        [
          { text: "Annulla", style: "cancel" },
          { 
            text: "Elimina", 
            style: "destructive",
            onPress: () => {
              onDelete(table.id);
              onClose();
            }
          }
        ]
      );
    }
  };
  
  const incrementSeats = () => {
    const currentSeats = parseInt(seats);
    if (!isNaN(currentSeats)) {
      setSeats((currentSeats + 1).toString());
    }
  };
  
  const decrementSeats = () => {
    const currentSeats = parseInt(seats);
    if (!isNaN(currentSeats) && currentSeats > 1) {
      setSeats((currentSeats - 1).toString());
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
              {table ? `Modifica Tavolo ${table.number}` : 'Nuovo Tavolo'}
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color={colors.dark} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.formContainer}>
            <Text style={styles.label}>Numero Tavolo</Text>
            <TextInput
              style={styles.input}
              value={tableNumber}
              onChangeText={setTableNumber}
              placeholder="Numero del tavolo"
              keyboardType="number-pad"
            />
            
            <Text style={styles.label}>Numero Posti</Text>
            <View style={styles.seatsContainer}>
              <TouchableOpacity 
                style={styles.seatsButton}
                onPress={decrementSeats}
              >
                <Minus size={20} color={colors.white} />
              </TouchableOpacity>
              
              <TextInput
                style={styles.seatsInput}
                value={seats}
                onChangeText={setSeats}
                keyboardType="number-pad"
                textAlign="center"
              />
              
              <TouchableOpacity 
                style={styles.seatsButton}
                onPress={incrementSeats}
              >
                <Plus size={20} color={colors.white} />
              </TouchableOpacity>
            </View>
          </View>
          
          <View style={styles.footer}>
            {table && onDelete && (
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
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
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
  seatsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  seatsButton: {
    width: 40,
    height: 40,
    backgroundColor: colors.primary,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  seatsInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.lightGray,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginHorizontal: 8,
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