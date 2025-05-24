import React from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity } from 'react-native';
import { colors } from '@/constants/colors';
import { Order } from '@/types';
import { formatTime, formatCurrency } from '@/utils/formatters';
import { CreditCard } from 'lucide-react-native';

interface CashierOrdersListProps {
  orders: Order[];
  onProcessPayment: (orderId: string) => void;
}

export const CashierOrdersList: React.FC<CashierOrdersListProps> = ({ 
  orders, 
  onProcessPayment 
}) => {
  const renderOrderItem = ({ item }: { item: Order }) => {
    return (
      <View style={styles.orderCard}>
        <View style={styles.orderHeader}>
          <View style={styles.orderInfo}>
            <Text style={styles.tableNumber}>Tavolo {item.tableNumber}</Text>
            <Text style={styles.orderTime}>{formatTime(item.createdAt)}</Text>
          </View>
          <Text style={styles.totalAmount}>{formatCurrency(item.total)}</Text>
        </View>

        <View style={styles.itemsContainer}>
          {item.items.map((orderItem, index) => (
            <View key={`${orderItem.id}-${index}`} style={styles.orderItem}>
              <Text style={styles.itemQuantity}>{orderItem.quantity}x</Text>
              <Text style={styles.itemName}>{orderItem.name}</Text>
              <Text style={styles.itemPrice}>
                {formatCurrency(orderItem.price * orderItem.quantity)}
              </Text>
            </View>
          ))}
        </View>

        <TouchableOpacity
          style={styles.paymentButton}
          onPress={() => onProcessPayment(item.id)}
        >
          <CreditCard size={20} color={colors.white} />
          <Text style={styles.paymentButtonText}>Processa Pagamento</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {orders.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Nessun ordine pronto per il pagamento</Text>
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item.id}
          renderItem={renderOrderItem}
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.lightGray,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: colors.gray,
    textAlign: 'center',
  },
  listContent: {
    padding: 16,
  },
  orderCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  orderInfo: {
    flex: 1,
  },
  tableNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
    color: colors.dark,
  },
  orderTime: {
    fontSize: 14,
    color: colors.gray,
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
  },
  itemsContainer: {
    padding: 16,
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
  paymentButton: {
    backgroundColor: colors.success,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  paymentButtonText: {
    color: colors.white,
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 8,
  },
});