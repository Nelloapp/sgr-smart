import React, { useState } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, Alert } from 'react-native';
import { colors } from '@/constants/colors';
import { Order, OrderStatus, OrderItem, ItemStatus } from '@/types';
import { formatTime, getTimeDifference, formatCurrency } from '@/utils/formatters';
import { Clock, ChefHat, CheckCircle, Send, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react-native';
import { useOrderStore } from '@/store/orderStore';

interface KitchenOrdersListProps {
  orders: Order[];
  onUpdateStatus: (orderId: string, status: OrderStatus) => void;
}

export const KitchenOrdersList: React.FC<KitchenOrdersListProps> = ({ 
  orders, 
  onUpdateStatus 
}) => {
  const { updateItemStatus } = useOrderStore();
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  
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
      case 'paid':
        return 'Pagato';
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

  const renderOrderItem = ({ item }: { item: Order }) => {
    // Filtra solo gli elementi di cibo
    const foodItems = item.items.filter(orderItem => orderItem.type === 'food');
    // Filtra gli elementi pendenti
    const pendingFoodItems = foodItems.filter(orderItem => orderItem.status === 'pending');
    // Verifica se ci sono nuovi elementi da preparare
    const hasNewItems = hasNewPendingItems(item);
    // Determina se l'ordine è espanso
    const isExpanded = expandedOrderId === item.id || hasNewItems;

    return (
      <View style={[
        styles.orderCard, 
        { borderLeftColor: getStatusColor(item.foodStatus) },
        hasNewItems && styles.orderCardWithNewItems
      ]}>
        <TouchableOpacity 
          style={styles.orderHeader}
          onPress={() => toggleExpandOrder(item.id)}
        >
          <View style={styles.orderInfo}>
            <View style={styles.orderTitleRow}>
              <Text style={styles.tableNumber}>Tavolo {item.tableNumber}</Text>
              {hasNewItems && (
                <View style={styles.newItemsBadge}>
                  <Text style={styles.newItemsBadgeText}>Nuovi elementi</Text>
                </View>
              )}
              <View style={styles.iconContainer}>
                {isExpanded ? (
                  <ChevronUp size={20} color={colors.gray} />
                ) : (
                  <ChevronDown size={20} color={colors.gray} />
                )}
              </View>
            </View>
            <View style={styles.statusContainer}>
              {getStatusIcon(item.foodStatus)}
              <Text style={[styles.statusText, { color: getStatusColor(item.foodStatus) }]}>
                {getStatusText(item.foodStatus)}
              </Text>
            </View>
          </View>
          <View style={styles.timeInfo}>
            <Text style={styles.timeText}>{formatTime(item.createdAt)}</Text>
            <Text style={styles.timeAgo}>{getTimeDifference(item.createdAt)}</Text>
          </View>
        </TouchableOpacity>

        {isExpanded && (
          <View style={styles.itemsContainer}>
            {foodItems.map((orderItem) => {
              const isPending = orderItem.status === 'pending';
              
              return (
                <View 
                  key={orderItem.id} 
                  style={[
                    styles.orderItem,
                    isPending && styles.pendingOrderItem
                  ]}
                >
                  <View style={styles.itemHeader}>
                    <View style={styles.itemInfo}>
                      <Text style={styles.itemQuantity}>{orderItem.quantity}x</Text>
                      <Text style={styles.itemName}>{orderItem.name}</Text>
                    </View>
                    <View style={[styles.itemStatusBadge, { backgroundColor: getStatusColor(orderItem.status) }]}>
                      {getStatusIcon(orderItem.status)}
                      <Text style={styles.itemStatusText}>{getStatusText(orderItem.status)}</Text>
                    </View>
                  </View>
                  
                  {orderItem.notes && (
                    <Text style={styles.itemNotes}>{orderItem.notes}</Text>
                  )}
                  
                  <View style={styles.itemActions}>
                    {orderItem.status === 'pending' && (
                      <TouchableOpacity
                        style={[styles.itemActionButton, { backgroundColor: colors.itemServed }]}
                        onPress={() => handleUpdateItemStatus(item.id, orderItem.id, 'served')}
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
        {isExpanded && pendingFoodItems.length > 0 && (
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
                        pendingFoodItems.forEach(orderItem => {
                          handleUpdateItemStatus(item.id, orderItem.id, 'served');
                        });
                      } 
                    }
                  ]
                );
              }}
            >
              <Text style={styles.actionButtonText}>
                Segna tutti come serviti
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Mostra il pulsante per aggiornare lo stato dell'intero ordine solo se non ci sono elementi pendenti */}
        {isExpanded && pendingFoodItems.length === 0 && item.foodStatus !== 'served' && (
          <View style={styles.orderFooter}>
            <Text style={styles.totalText}>
              Totale Piatti: {formatCurrency(foodItems.reduce((sum, item) => sum + (item.price * item.quantity), 0))}
            </Text>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: colors.itemServed }]}
              onPress={() => onUpdateStatus(item.id, 'served')}
            >
              <Text style={styles.actionButtonText}>
                Segna Tutti come Serviti
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={orders}
        keyExtractor={(item) => item.id}
        renderItem={renderOrderItem}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.lightGray,
  },
  listContent: {
    padding: 16,
  },
  orderCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    borderLeftWidth: 6,
  },
  orderCardWithNewItems: {
    borderWidth: 2,
    borderColor: colors.warning,
    borderLeftWidth: 6,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  orderInfo: {
    flex: 1,
  },
  orderTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tableNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 8,
    color: colors.dark,
  },
  newItemsBadge: {
    backgroundColor: colors.warning,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginRight: 8,
  },
  newItemsBadgeText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  iconContainer: {
    marginLeft: 8,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  statusText: {
    marginLeft: 6,
    fontWeight: '500',
  },
  timeInfo: {
    alignItems: 'flex-end',
  },
  timeText: {
    fontSize: 14,
    color: colors.dark,
    fontWeight: '500',
  },
  timeAgo: {
    fontSize: 12,
    color: colors.gray,
    marginTop: 2,
  },
  itemsContainer: {
    padding: 16,
  },
  orderItem: {
    marginBottom: 16,
    backgroundColor: colors.lightGray,
    borderRadius: 8,
    padding: 12,
  },
  pendingOrderItem: {
    borderLeftWidth: 4,
    borderLeftColor: colors.warning,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  itemInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  itemQuantity: {
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 8,
    color: colors.dark,
  },
  itemName: {
    fontSize: 16,
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
    fontSize: 14,
    color: colors.gray,
    marginBottom: 8,
    fontStyle: 'italic',
    paddingLeft: 8,
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
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
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
    padding: 16,
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
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: colors.lightGray,
  },
  totalText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.dark,
  },
  actionButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  actionButtonText: {
    color: colors.white,
    fontWeight: '600',
  },
});