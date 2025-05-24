import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, Alert } from 'react-native';
import { Stack } from 'expo-router';
import { KitchenDashboard } from '@/components/KitchenDashboard';
import { useOrderStore } from '@/store/orderStore';
import { colors } from '@/constants/colors';
import { Order, OrderStatus } from '@/types';

export default function KitchenScreen() {
  const { orders, updateOrderTypeStatus } = useOrderStore();
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  // Local function to get food orders that are not served
  const getFoodOrders = () => {
    return orders.filter(order => {
      // Check if order has food items and food is not served
      const hasFoodItems = order.items.some(item => item.type === 'food');
      return hasFoodItems && order.foodStatus !== 'served' && order.status !== 'paid';
    });
  };
  
  // Get food orders
  const foodOrders = getFoodOrders();
  
  // Refresh orders every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setRefreshTrigger(prev => prev + 1);
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);
  
  const handleUpdateOrderStatus = (orderId: string, status: OrderStatus) => {
    try {
      updateOrderTypeStatus(orderId, 'food', status);
      
      // Show confirmation for served orders
      if (status === 'served') {
        Alert.alert('Ordine Completato', 'L\'ordine è stato contrassegnato come servito');
      }
    } catch (error) {
      console.error('Errore durante l\'aggiornamento dello stato dell\'ordine:', error);
      Alert.alert('Errore', 'Si è verificato un errore durante l\'aggiornamento dello stato dell\'ordine');
    }
  };
  
  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{
          title: "Cucina",
        }} 
      />
      
      <KitchenDashboard 
        orders={foodOrders} 
        onUpdateStatus={handleUpdateOrderStatus} 
        refreshTrigger={refreshTrigger}
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