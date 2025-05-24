import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Alert } from 'react-native';
import { Stack } from 'expo-router';
import { CashierDashboard } from '@/components/CashierDashboard';
import { PaymentDialog } from '@/components/PaymentDialog';
import { useOrderStore } from '@/store/orderStore';
import { colors } from '@/constants/colors';
import { Order } from '@/types';

export default function CashierScreen() {
  const { orders, updateOrderStatus, getOrderById } = useOrderStore();
  const [paymentDialogVisible, setPaymentDialogVisible] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  // Filtra gli ordini che sono pronti per il pagamento (serviti) o già pagati
  const relevantOrders = orders.filter(order => 
    order.status === 'served' || order.status === 'paid'
  );
  
  // Aggiorna la vista ogni 10 secondi per mostrare nuovi ordini pronti per il pagamento
  useEffect(() => {
    const interval = setInterval(() => {
      setRefreshTrigger(prev => prev + 1);
    }, 10000);
    
    return () => clearInterval(interval);
  }, []);
  
  const handleProcessPayment = (orderId: string) => {
    const order = getOrderById(orderId);
    if (order) {
      setSelectedOrder(order);
      setPaymentDialogVisible(true);
    } else {
      Alert.alert('Errore', 'Ordine non trovato');
    }
  };
  
  const handlePaymentComplete = (orderId: string, paymentMethod: 'cash' | 'card') => {
    try {
      // Aggiorna lo stato dell'ordine a 'paid'
      const success = updateOrderStatus(orderId, 'paid', paymentMethod);
      
      if (success) {
        Alert.alert('Pagamento completato', 'L\'ordine è stato pagato con successo');
      } else {
        Alert.alert('Errore', 'Si è verificato un errore durante il pagamento');
      }
      
      // Chiudi il dialog
      setPaymentDialogVisible(false);
      setSelectedOrder(null);
    } catch (error) {
      console.error('Errore durante il pagamento:', error);
      Alert.alert('Errore', 'Si è verificato un errore durante il pagamento');
    }
  };
  
  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{
          title: "Cassa",
        }} 
      />
      
      <CashierDashboard 
        orders={relevantOrders} 
        onProcessPayment={handleProcessPayment} 
        refreshTrigger={refreshTrigger}
      />
      
      <PaymentDialog
        visible={paymentDialogVisible}
        order={selectedOrder}
        onClose={() => setPaymentDialogVisible(false)}
        onComplete={handlePaymentComplete}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.lightGray,
  },
});