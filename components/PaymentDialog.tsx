import React, { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  Modal, 
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  TextInput,
  Alert
} from 'react-native';
import { X, CreditCard, Banknote, CheckCircle, Printer, Users, DivideCircle } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { Order, OrderType } from '@/types';
import { formatCurrency } from '@/utils/formatters';
import { printReceipt } from '@/utils/printing';

interface PaymentDialogProps {
  visible: boolean;
  order: Order | null;
  onClose: () => void;
  onComplete: (orderId: string, paymentMethod: 'cash' | 'card') => void;
}

export const PaymentDialog: React.FC<PaymentDialogProps> = ({ 
  visible, 
  order, 
  onClose, 
  onComplete 
}) => {
  const [processing, setProcessing] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | null>(null);
  const [splitBill, setSplitBill] = useState(false);
  const [numberOfPeople, setNumberOfPeople] = useState('1');
  const [printReceiptOption, setPrintReceiptOption] = useState(true);
  
  const handlePayment = (method: 'cash' | 'card') => {
    if (!order) return;
    
    setPaymentMethod(method);
    setProcessing(true);
    
    // Simula elaborazione pagamento
    setTimeout(() => {
      setProcessing(false);
      setCompleted(true);
      
      if (printReceiptOption) {
        // Print receipt
        printReceipt(order);
      }
      
      // Chiusura automatica dopo completamento pagamento
      setTimeout(() => {
        onComplete(order.id, method);
        setCompleted(false);
        setPaymentMethod(null);
        setSplitBill(false);
        setNumberOfPeople('1');
        setPrintReceiptOption(true);
      }, 1500);
    }, 1500);
  };
  
  const calculateSplitAmount = () => {
    if (!order) return 0;
    const people = parseInt(numberOfPeople);
    if (isNaN(people) || people < 1) return order.total;
    return order.total / people;
  };
  
  // Raggruppa gli elementi dell'ordine per tipo
  const groupItemsByType = (order: Order) => {
    const foodItems = order.items.filter(item => item.type === 'food');
    const drinkItems = order.items.filter(item => item.type === 'drink');
    
    return { foodItems, drinkItems };
  };
  
  if (!order) return null;
  
  const { foodItems, drinkItems } = groupItemsByType(order);
  
  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          {!processing && !completed ? (
            <>
              <View style={styles.header}>
                <Text style={styles.title}>Pagamento per Tavolo {order.tableNumber}</Text>
                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                  <X size={24} color={colors.dark} />
                </TouchableOpacity>
              </View>
              
              <ScrollView style={styles.scrollContent}>
                <View style={styles.orderSummary}>
                  <Text style={styles.summaryTitle}>Riepilogo Ordine</Text>
                  
                  {foodItems.length > 0 && (
                    <View style={styles.sectionContainer}>
                      <Text style={styles.sectionTitle}>Cibo</Text>
                      <View style={styles.itemsContainer}>
                        {foodItems.map(item => (
                          <View key={item.id} style={styles.orderItem}>
                            <Text style={styles.itemQuantity}>{item.quantity}x</Text>
                            <Text style={styles.itemName}>{item.name}</Text>
                            <Text style={styles.itemPrice}>
                              {formatCurrency(item.price * item.quantity)}
                            </Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  )}
                  
                  {drinkItems.length > 0 && (
                    <View style={styles.sectionContainer}>
                      <Text style={styles.sectionTitle}>Bevande</Text>
                      <View style={styles.itemsContainer}>
                        {drinkItems.map(item => (
                          <View key={item.id} style={styles.orderItem}>
                            <Text style={styles.itemQuantity}>{item.quantity}x</Text>
                            <Text style={styles.itemName}>{item.name}</Text>
                            <Text style={styles.itemPrice}>
                              {formatCurrency(item.price * item.quantity)}
                            </Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  )}
                  
                  <View style={styles.totalContainer}>
                    <Text style={styles.totalLabel}>Importo Totale:</Text>
                    <Text style={styles.totalAmount}>{formatCurrency(order.total)}</Text>
                  </View>
                </View>
                
                <View style={styles.optionsContainer}>
                  <View style={styles.optionRow}>
                    <View style={styles.optionLabelContainer}>
                      <Printer size={20} color={colors.dark} />
                      <Text style={styles.optionLabel}>Stampa Ricevuta</Text>
                    </View>
                    <TouchableOpacity 
                      style={[
                        styles.toggleButton, 
                        printReceiptOption && styles.toggleButtonActive
                      ]}
                      onPress={() => setPrintReceiptOption(!printReceiptOption)}
                    >
                      <View style={[
                        styles.toggleIndicator, 
                        printReceiptOption && styles.toggleIndicatorActive
                      ]} />
                    </TouchableOpacity>
                  </View>
                  
                  <View style={styles.optionRow}>
                    <View style={styles.optionLabelContainer}>
                      <DivideCircle size={20} color={colors.dark} />
                      <Text style={styles.optionLabel}>Dividi Conto</Text>
                    </View>
                    <TouchableOpacity 
                      style={[
                        styles.toggleButton, 
                        splitBill && styles.toggleButtonActive
                      ]}
                      onPress={() => setSplitBill(!splitBill)}
                    >
                      <View style={[
                        styles.toggleIndicator, 
                        splitBill && styles.toggleIndicatorActive
                      ]} />
                    </TouchableOpacity>
                  </View>
                  
                  {splitBill && (
                    <View style={styles.splitContainer}>
                      <View style={styles.peopleInputContainer}>
                        <Users size={20} color={colors.dark} />
                        <TextInput
                          style={styles.peopleInput}
                          value={numberOfPeople}
                          onChangeText={setNumberOfPeople}
                          keyboardType="number-pad"
                          placeholder="Numero di persone"
                        />
                      </View>
                      
                      <View style={styles.splitResultContainer}>
                        <Text style={styles.splitLabel}>Importo per persona:</Text>
                        <Text style={styles.splitAmount}>
                          {formatCurrency(calculateSplitAmount())}
                        </Text>
                      </View>
                    </View>
                  )}
                </View>
                
                <View style={styles.paymentOptions}>
                  <Text style={styles.paymentTitle}>Seleziona Metodo di Pagamento</Text>
                  
                  <View style={styles.paymentButtons}>
                    <TouchableOpacity 
                      style={styles.paymentButton}
                      onPress={() => handlePayment('card')}
                    >
                      <CreditCard size={32} color={colors.primary} />
                      <Text style={styles.paymentButtonText}>Carta</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                      style={styles.paymentButton}
                      onPress={() => handlePayment('cash')}
                    >
                      <Banknote size={32} color={colors.primary} />
                      <Text style={styles.paymentButtonText}>Contanti</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </ScrollView>
            </>
          ) : (
            <View style={styles.processingContainer}>
              {processing ? (
                <>
                  <ActivityIndicator size="large" color={colors.primary} />
                  <Text style={styles.processingText}>
                    Elaborazione Pagamento {paymentMethod === 'card' ? 'con Carta' : 'in Contanti'}...
                  </Text>
                </>
              ) : (
                <>
                  <CheckCircle size={64} color={colors.success} />
                  <Text style={styles.completedText}>Pagamento Completato!</Text>
                  {printReceiptOption && (
                    <Text style={styles.printingText}>Stampa ricevuta in corso...</Text>
                  )}
                </>
              )}
            </View>
          )}
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
  scrollContent: {
    maxHeight: '80%',
  },
  orderSummary: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    color: colors.dark,
  },
  sectionContainer: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.dark,
    marginBottom: 8,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  itemsContainer: {
    marginBottom: 8,
  },
  orderItem: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  itemQuantity: {
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 8,
    color: colors.dark,
    width: 30,
  },
  itemName: {
    fontSize: 16,
    color: colors.dark,
    flex: 1,
  },
  itemPrice: {
    fontSize: 16,
    color: colors.dark,
    fontWeight: '500',
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.lightGray,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.dark,
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
  },
  optionsContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  optionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  optionLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionLabel: {
    fontSize: 16,
    color: colors.dark,
    marginLeft: 8,
  },
  toggleButton: {
    width: 50,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.lightGray,
    padding: 2,
    justifyContent: 'center',
  },
  toggleButtonActive: {
    backgroundColor: colors.primary,
  },
  toggleIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.white,
  },
  toggleIndicatorActive: {
    alignSelf: 'flex-end',
  },
  splitContainer: {
    backgroundColor: colors.lightGray,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  peopleInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  peopleInput: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    fontSize: 16,
  },
  splitResultContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  splitLabel: {
    fontSize: 16,
    color: colors.dark,
  },
  splitAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
  },
  paymentOptions: {
    padding: 16,
  },
  paymentTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 16,
    color: colors.dark,
  },
  paymentButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  paymentButton: {
    alignItems: 'center',
    padding: 16,
    borderWidth: 1,
    borderColor: colors.lightGray,
    borderRadius: 8,
    width: '45%',
  },
  paymentButtonText: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: '500',
    color: colors.dark,
  },
  processingContainer: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  processingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.dark,
    textAlign: 'center',
  },
  completedText: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.success,
    textAlign: 'center',
  },
  printingText: {
    marginTop: 8,
    fontSize: 14,
    color: colors.gray,
    textAlign: 'center',
  },
});