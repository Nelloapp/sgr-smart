import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { colors } from '@/constants/colors';
import { Order, OrderStatus, ItemStatus } from '@/types';
import { formatTime, getTimeDifference } from '@/utils/formatters';
import { Clock, ChefHat, CheckCircle, Send, AlertCircle } from 'lucide-react-native';
import { useOrderStore } from '@/store/orderStore';

interface KitchenDashboardProps {
  orders: Order[];
  onUpdateStatus: (orderId: string, status: OrderStatus) => void;
  refreshTrigger?: number;
}

export const KitchenDashboard: React.FC<KitchenDashboardProps> = ({ 
  orders, 
  onUpdateStatus,
  refreshTrigger
}) => {
  const { updateItemStatus } = useOrderStore();
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  
  const pendingOrders = orders.filter(order => order.foodStatus === 'pending');
  const servedOrders = orders.filter(order => order.foodStatus === 'served');
  
  const getStatusIcon = (status: OrderStatus | ItemStatus) => {
    switch (status) {
      case 'pending':
        return <AlertCircle size={16} color={colors.itemPending} />;
      case 'served':
        return <CheckCircle size={16} color={colors.itemServed} />;
      default:
        return null;
    }
  };
  
  const getStatusColor = (status: OrderStatus | ItemStatus): string => {
    switch (status) {
      case 'pending':
        return colors.itemPending;
      case 'served':
        return colors.itemServed;
      default:
        return colors.gray;
    }
  };
  
  const getStatusText = (status: OrderStatus | ItemStatus): string => {
    switch (status) {
      case 'pending':
        return 'Da Preparare';
      case 'served':
        return 'Servito';
      default:
        return '';
    }
  };
  
  const handleUpdateItemStatus = (orderId: string, itemId: string, status: ItemStatus) => {
    updateItemStatus(orderId, itemId, status);
  };
  
  // Funzione per verificare se ci sono nuovi elementi da preparare
  const hasNewPendingItems = (order: Order): boolean => {
    return order.items.some(item => 
      item.type === 'food' && item.status === 'pending'
    );
  };
  
  const toggleExpandOrder = (orderId: string) => {
    setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
  };
  
  const handlePrintToKitchen = (order: Order) => {  const foodItems = order.items.filter(item => item.type === 'food');  printOrderToKitchen(order, foodItems);};
  const renderOrderCard = (order: Order) => {
    // Filtra solo gli elementi di cibo
    const foodItems = order.items.filter(item => item.type === 'food');
    // Filtra gli elementi pendenti
    const pendingFoodItems = foodItems.filter(item => item.status === 'pending');
    // Verifica se ci sono nuovi elementi da preparare
    const hasNewItems = hasNewPendingItems(order);
    
    return (
      <View key={order.id} style={styles.orderCard}>
        <TouchableOpacity 
          style={styles.orderHeader}
          onPress={() => toggleExpandOrder(order.id)}
        >
          <View style={styles.orderHeaderLeft}>
            <Text style={styles.tableNumber}>Tavolo {order.tableNumber}</Text>
            {hasNewItems && (
              <View style={styles.newItemsBadge}>
                <Text style={styles.newItemsBadgeText}>Nuovi elementi</Text>
              </View>
            )}
          </View>
          <View style={styles.timeInfo}>
            <Text style={styles.timeText}>{formatTime(order.createdAt)}</Text>
            <Text style={styles.timeAgo}>{getTimeDifference(order.createdAt)}</Text>
          </View>
        </TouchableOpacity>
        
        {(expandedOrderId === order.id || hasNewItems) && (
          <View style={styles.itemsList}>
            {foodItems.map(item => {
              const isPending = item.status === 'pending';
              
              return (
                <View 
                  key={item.id} 
                  style={[
                    styles.itemContainer,
                    isPending && styles.pendingItemContainer
                  ]}
                >
                  <View style={styles.itemRow}>
                    <Text style={styles.itemText}>
                      {item.quantity}x {item.name}
                    </Text>
                    <View style={[styles.itemStatusBadge, { backgroundColor: getStatusColor(item.status) }]}>
                      {getStatusIcon(item.status)}
                      <Text style={styles.itemStatusText}>{getStatusText(item.status)}</Text>
                    </View>
                  </View>
                  
                  {item.notes && (
                    <Text style={styles.itemNotes}>{item.notes}</Text>
                  )}
                  
                  <View style={styles.itemActions}>
                    {item.status === 'pending' && (
                      <TouchableOpacity
                        style={[styles.itemActionButton, { backgroundColor: colors.itemServed }]}
                        onPress={() => handleUpdateItemStatus(order.id, item.id, 'served')}
                      >
                        <View style={styles.itemActionButtonContent}>
                          <CheckCircle size={14} color={colors.white} />
                          <Text style={styles.itemActionButtonText}>Segna come Servito</Text>
                        </View>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        )}
        
        {/* Mostra i pulsanti di azione solo se ci sono elementi pendenti */}
        {pendingFoodItems.length > 0 && (
          <View style={styles.pendingActionsContainer}>
            <Text style={styles.pendingCountText}>
              {pendingFoodItems.length} {pendingFoodItems.length === 1 ? 'elemento' : 'elementi'} da preparare
            </Text>
            
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: colors.itemServed }]}
              onPress={() => {
                // Conferma prima di segnare tutti gli elementi come serviti
                Alert.alert(
                  "Segna come serviti",
                  `Vuoi segnare tutti i ${pendingFoodItems.length} elementi come serviti?`,
                  [
                    { text: "Annulla", style: "cancel" },
                    { 
                      text: "Conferma", 
                      onPress: () => {
                        // Aggiorna lo stato di tutti gli elementi pendenti a 'served'
                        pendingFoodItems.forEach(item => {
                          handleUpdateItemStatus(order.id, item.id, 'served');
                        });
                      } 
                    }
                  ]
                );
              }}
            >
              <View style={styles.actionButtonContent}>
                <CheckCircle size={20} color={colors.white} />
                <Text style={styles.actionButtonText}>
                  Segna tutti come serviti
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        )}
        
        {/* Mostra il pulsante per aggiornare lo stato dell'intero ordine solo se non ci sono elementi pendenti */}
        {pendingFoodItems.length === 0 && order.foodStatus !== 'served' && (
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.itemServed }]}
            onPress={() => onUpdateStatus(order.id, 'served')}
          >
            <View style={styles.actionButtonContent}>
              <Send size={20} color={colors.white} />
              <Text style={styles.actionButtonText}>
                Segna Tutti come Serviti
              </Text>
            </View>
          </TouchableOpacity>
        )}
      </View>
    );
  };
  
  return (
    <ScrollView style={styles.container}>
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{pendingOrders.length}</Text>
          <Text style={styles.statLabel}>In Attesa</Text>
        </View>
        
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{servedOrders.length}</Text>
          <Text style={styles.statLabel}>Serviti</Text>
        </View>
      </View>
      
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Clock size={20} color={colors.orderPending} />
          <Text style={styles.sectionTitle}>In Attesa ({pendingOrders.length})</Text>
        </View>
        
        <View style={styles.ordersList}>
          {pendingOrders.length === 0 ? (
            <Text style={styles.emptyText}>Nessun ordine in attesa</Text>
          ) : (
            pendingOrders.map(renderOrderCard)
          )}
        </View>
      </View>
      
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <CheckCircle size={20} color={colors.orderReady} />
          <Text style={styles.sectionTitle}>Serviti ({servedOrders.length})</Text>
        </View>
        
        <View style={styles.ordersList}>
          {servedOrders.length === 0 ? (
            <Text style={styles.emptyText}>Nessun ordine servito</Text>
          ) : (
            servedOrders.map(renderOrderCard)
          )}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.lightGray,
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 16,
    justifyContent: 'space-between',
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 4,
    alignItems: 'center',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.dark,
  },
  statLabel: {
    fontSize: 14,
    color: colors.gray,
    marginTop: 4,
  },
  section: {
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.dark,
    marginLeft: 8,
  },
  ordersList: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  emptyText: {
    textAlign: 'center',
    color: colors.gray,
    padding: 16,
  },
  orderCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    marginVertical: 8,
    overflow: 'hidden',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  orderHeaderLeft: {
    flexDirection: 'column',
  },
  tableNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.dark,
  },
  newItemsBadge: {
    backgroundColor: colors.warning,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginTop: 4,
    alignSelf: 'flex-start',
  },
  newItemsBadgeText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  timeInfo: {
    alignItems: 'flex-end',
  },
  timeText: {
    fontSize: 14,
    color: colors.dark,
  },
  timeAgo: {
    fontSize: 12,
    color: colors.gray,
  },
  itemsList: {
    padding: 12,
  },
  itemContainer: {
    marginBottom: 12,
    backgroundColor: colors.lightGray,
    borderRadius: 8,
    padding: 8,
  },
  pendingItemContainer: {
    borderLeftWidth: 4,
    borderLeftColor: colors.warning,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  itemText: {
    fontSize: 14,
    color: colors.dark,
    flex: 1,
  },
  itemStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  itemStatusText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  itemNotes: {
    fontSize: 12,
    color: colors.gray,
    fontStyle: 'italic',
    marginBottom: 4,
    paddingLeft: 4,
    borderLeftWidth: 2,
    borderLeftColor: colors.primary,
  },
  itemActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 4,
  },
  itemActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    marginLeft: 8,
  },
  itemActionButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemActionButtonText: {
    color: colors.white,
    fontWeight: '600',
    fontSize: 12,
    marginLeft: 4,
  },
  pendingActionsContainer: {
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: colors.lightGray,
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
  },
  pendingCountText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.dark,
    marginBottom: 8,
  },
  actionButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
  },
  actionButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButtonText: {
    color: colors.white,
    fontWeight: '600',
    marginLeft: 8,
  },
});
<TouchableOpacity
  style={styles.printButton}
  onPress={() => handlePrintToKitchen(order)}
>
  <Text style={styles.printButtonText}>Stampa Cucina</Text>
</TouchableOpacity>