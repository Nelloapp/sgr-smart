import React, { useState, useEffect } from "react";
import { StyleSheet, View, TouchableOpacity, Alert, Text } from "react-native";
import { Stack, useRouter } from "expo-router";
import { TablesGrid } from "@/components/TablesGrid";
import { OrderDialog } from "@/components/OrderDialog";
import { PaymentDialog } from "@/components/PaymentDialog";
import { TableDialog } from "@/components/TableDialog";
import { useTableStore } from "@/store/tableStore";
import { useOrderStore } from "@/store/orderStore";
import { useMenuStore } from "@/store/menuStore";
import { Table, OrderItem } from "@/types";
import { colors } from "@/constants/colors";
import { RefreshCw, Plus } from "lucide-react-native";

export default function TablesScreen() {
  const router = useRouter();
  const { tables, updateTableStatus, addTable, updateTable, deleteTable } = useTableStore();
  const { 
    orders, 
    getOrderById, 
    getActiveOrderByTableId,
    createOrder, 
    updateOrderStatus,
    addItemToOrder,
    removeItemFromOrder,
    updateItemQuantity,
    canModifyOrder,
    printOrder
  } = useOrderStore();
  
  // Make sure menu store is initialized
  const { menuItems, categories } = useMenuStore();
  
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [orderDialogVisible, setOrderDialogVisible] = useState(false);
  const [paymentDialogVisible, setPaymentDialogVisible] = useState(false);
  const [tableDialogVisible, setTableDialogVisible] = useState(false);
  const [existingOrderItems, setExistingOrderItems] = useState<OrderItem[]>([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  // Refresh tables every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setRefreshTrigger(prev => prev + 1);
    }, 10000);
    
    return () => clearInterval(interval);
  }, []);
  
  const handleTablePress = (table: Table) => {
    setSelectedTable(table);
    
    if (table.status === 'available') {
      // New order for available table
      setExistingOrderItems([]);
      setOrderDialogVisible(true);
    } else if (table.status === 'occupied' || table.status === 'readyToPay') {
      // Get active order for this table
      const activeOrder = getActiveOrderByTableId(table.id);
      
      if (activeOrder) {
        if (table.status === 'readyToPay') {
          // If table is ready to pay, show payment dialog
          setPaymentDialogVisible(true);
        } else {
          // If table is occupied, allow adding more items
          setExistingOrderItems(activeOrder.items);
          setOrderDialogVisible(true);
        }
      } else {
        // No active order found, create a new one
        setExistingOrderItems([]);
        setOrderDialogVisible(true);
      }
    }
  };
  
  const handleTableLongPress = (table: Table) => {
    setSelectedTable(table);
    setTableDialogVisible(true);
  };
  
  const handleAddTable = () => {
    setSelectedTable(null);
    setTableDialogVisible(true);
  };
  
  const handleSaveTable = (tableNumber: number, seats: number) => {
    try {
      if (selectedTable) {
        updateTable(selectedTable.id, tableNumber, seats);
      } else {
        addTable(tableNumber, seats);
      }
      setTableDialogVisible(false);
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert('Errore', error.message);
      } else {
        Alert.alert('Errore', 'Si è verificato un errore durante il salvataggio del tavolo');
      }
    }
  };
  
  const handleDeleteTable = (tableId: string) => {
    try {
      deleteTable(tableId);
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert('Errore', error.message);
      } else {
        Alert.alert('Errore', 'Si è verificato un errore durante l\'eliminazione del tavolo');
      }
    }
  };
  
  const handleUpdateTableSeats = (tableId: string, seats: number) => {
    try {
      const table = tables ? tables.find(t => t.id === tableId) : undefined;
      if (table) {
        updateTable(tableId, table.number, seats);
      }
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert('Errore', error.message);
      } else {
        Alert.alert('Errore', 'Si è verificato un errore durante l\'aggiornamento dei posti');
      }
    }
  };
  
  const handleOrderSave = (items: OrderItem[]) => {
    if (!selectedTable) return;
    
    try {
      if (selectedTable.status === 'available') {
        // Create new order
        const orderId = createOrder(selectedTable.id, selectedTable.number, items);
        
        // Print the order
        if (orderId) {
          printOrder(orderId);
        }
        
        // Show confirmation
        Alert.alert(
          'Ordine Creato',
          `L'ordine per il tavolo ${selectedTable.number} è stato inviato alla cucina e al bar.`
        );
      } else {
        // Get active order for this table
        const activeOrder = getActiveOrderByTableId(selectedTable.id);
        
        if (activeOrder) {
          // Remove all existing items
          const existingItems = [...activeOrder.items];
          
          // Find items that were removed
          const removedItems = existingItems.filter(existingItem => 
            !items.some(newItem => newItem.id === existingItem.id)
          );
          
          // Remove items that were deleted
          removedItems.forEach(item => {
            removeItemFromOrder(activeOrder.id, item.id);
          });
          
          // Update or add new items
          items.forEach(newItem => {
            const existingItem = existingItems.find(item => item.id === newItem.id);
            
            if (existingItem) {
              // Update quantity if changed
              if (existingItem.quantity !== newItem.quantity) {
                updateItemQuantity(activeOrder.id, newItem.id, newItem.quantity);
              }
            } else {
              // Add new item
              addItemToOrder(activeOrder.id, newItem);
            }
          });
          
          // Print the updated order
          printOrder(activeOrder.id);
          
          // Show confirmation
          Alert.alert(
            'Ordine Aggiornato',
            `L'ordine per il tavolo ${selectedTable.number} è stato aggiornato e inviato alla cucina e al bar.`
          );
        } else {
          // Create new order if no active order exists
          const orderId = createOrder(selectedTable.id, selectedTable.number, items);
          
          // Print the order
          if (orderId) {
            printOrder(orderId);
          }
          
          // Show confirmation
          Alert.alert(
            'Nuovo Ordine',
            `Un nuovo ordine per il tavolo ${selectedTable.number} è stato inviato alla cucina e al bar.`
          );
        }
      }
      
      setOrderDialogVisible(false);
    } catch (error) {
      console.error('Error saving order:', error);
      Alert.alert('Errore', 'Si è verificato un errore durante il salvataggio dell\'ordine');
    }
  };
  
  const handlePaymentComplete = (orderId: string, paymentMethod: 'cash' | 'card') => {
    updateOrderStatus(orderId, 'paid', paymentMethod);
    setPaymentDialogVisible(false);
  };
  
  // Get order for selected table
  const selectedOrder = selectedTable?.orderId 
    ? (getOrderById(selectedTable.orderId) || null)
    : null;
  
  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{
          title: "Tavoli",
          headerRight: () => (
            <View style={styles.headerButtons}>
              <TouchableOpacity 
                style={styles.headerButton}
                onPress={handleAddTable}
              >
                <Plus size={20} color={colors.primary} />
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.headerButton}
                onPress={() => {
                  // Force a re-render to refresh data
                  setRefreshTrigger(prev => prev + 1);
                }}
              >
                <RefreshCw size={20} color={colors.primary} />
              </TouchableOpacity>
            </View>
          ),
        }} 
      />
      
      <TablesGrid 
        tables={tables || []} 
        onTablePress={handleTablePress} 
        onTableLongPress={handleTableLongPress}
        onAddTable={handleAddTable}
        refreshTrigger={refreshTrigger}
      />
      
      <OrderDialog
        visible={orderDialogVisible}
        table={selectedTable}
        existingOrderItems={existingOrderItems}
        onClose={() => setOrderDialogVisible(false)}
        onSave={handleOrderSave}
        onUpdateTableSeats={handleUpdateTableSeats}
      />
      
      <PaymentDialog
        visible={paymentDialogVisible}
        order={selectedOrder}
        onClose={() => setPaymentDialogVisible(false)}
        onComplete={handlePaymentComplete}
      />
      
      <TableDialog
        visible={tableDialogVisible}
        table={selectedTable}
        onClose={() => setTableDialogVisible(false)}
        onSave={handleSaveTable}
        onDelete={handleDeleteTable}
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
    marginLeft: 16,
    padding: 4,
  },
});