import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { colors } from '@/constants/colors';
import { Order } from '@/types';
import { formatCurrency, formatTime, getTimeDifference } from '@/utils/formatters';
import { CreditCard, Clock, ChefHat, CheckCircle, Send, DollarSign } from 'lucide-react-native';
import { printReceipt } from '@/utils/printing';

interface CashierDashboardProps {
  orders: Order[];
  onProcessPayment: (orderId: string) => void;
  refreshTrigger?: number;
}

export const CashierDashboard: React.FC<CashierDashboardProps> = ({ 
  orders, 
  onProcessPayment,
  refreshTrigger = 0
}) => {
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  
  // Filtra gli ordini
  const servedOrders = orders.filter(order => order.status === 'served');
  const paidOrders = orders.filter(order => order.status === 'paid');
  
  const todayOrders = orders.filter(order => {
    const orderDate = new Date(order.createdAt);
    const today = new Date();
    return orderDate.setHours(0, 0, 0, 0) === today.setHours(0, 0, 0, 0);
  });
  
  const todayRevenue = todayOrders
    .filter(order => order.status === 'paid')
    .reduce((sum, order) => sum + order.total, 0);
  
  const pendingRevenue = orders
    .filter(order => order.status !== 'paid')
    .reduce((sum, order) => sum + order.total, 0);
  
  // Aggiorna quando cambia refreshTrigger
  useEffect(() => {
    if (refreshTrigger > 0) {
      setLastRefresh(new Date());
    }
  }, [refreshTrigger]);
  
  const onRefresh = () => {
    setRefreshing(true);
    // Simula un'operazione di aggiornamento
    setTimeout(() => {
      setRefreshing(false);
      setLastRefresh(new Date());
    }, 1000);
  };
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock size={16} color={colors.orderPending} />;
      case 'preparing':
        return <ChefHat size={16} color={colors.orderPreparing} />;
      case 'ready':
        return <CheckCircle size={16} color={colors.orderReady} />;
      case 'served':
        return <Send size={16} color={colors.orderServed} />;
      case 'paid':
        return <DollarSign size={16} color={colors.dark} />;
      default:
        return null;
    }
  };
  
  const getStatusText = (status: string): string => {
    switch (status) {
      case 'pending':
        return 'In Attesa';
      case 'preparing':
        return 'In Preparazione';
      case 'ready':
        return 'Pronto';
      case 'served':
        return 'Servito';
      case 'paid':
        return 'Pagato';
      default:
        return '';
    }
  };
  
  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={[colors.primary]}
        />
      }
    >
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Incasso Giornaliero</Text>
          <Text style={styles.statValue}>{formatCurrency(todayRevenue)}</Text>
        </View>
        
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Incasso in Attesa</Text>
          <Text style={styles.statValue}>{formatCurrency(pendingRevenue)}</Text>
        </View>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Ordini Pronti per il Pagamento ({servedOrders.length})</Text>
        
        {servedOrders.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Nessun ordine pronto per il pagamento</Text>
          </View>
        ) : (
          servedOrders.map(order => (
            <View key={order.id} style={styles.orderCard}>
              <View style={styles.orderHeader}>
                <View>
                  <Text style={styles.tableNumber}>Tavolo {order.tableNumber}</Text>
                  <View style={styles.statusContainer}>
                    {getStatusIcon(order.status)}
                    <Text style={styles.statusText}>{getStatusText(order.status)}</Text>
                  </View>
                </View>
                <View style={styles.orderInfo}>
                  <Text style={styles.orderTime}>{formatTime(order.createdAt)}</Text>
                  <Text style={styles.orderTotal}>{formatCurrency(order.total)}</Text>
                </View>
              </View>
              
              <View style={styles.orderItems}>
                {order.items.map((item, index) => (
                  <Text key={index} style={styles.orderItemText}>
                    {item.quantity}x {item.name}
                  </Text>
                ))}
              </View>
              
              <TouchableOpacity
                style={styles.paymentButton}
                onPress={() => onProcessPayment(order.id)}
              >
                <CreditCard size={20} color={colors.white} />
                <Text style={styles.paymentButtonText}>Processa Pagamento</Text>
              </TouchableOpacity>
            </View>
          ))
        )}
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Ultimi Pagamenti</Text>
        
        {paidOrders.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Nessun pagamento recente</Text>
          </View>
        ) : (
          paidOrders.slice(0, 5).map(order => (
            <View key={order.id} style={styles.paymentCard}>
              <View>
                <Text style={styles.tableNumber}>Tavolo {order.tableNumber}</Text>
                <Text style={styles.paymentTime}>{getTimeDifference(order.updatedAt)}</Text>
              </View>
              <View style={styles.paymentInfo}>
                <Text style={styles.paymentMethod}>
                  {order.paymentMethod === 'cash' ? 'Contanti' : 
                   order.paymentMethod === 'card' ? 'Carta' : 'N/D'}
                </Text>
                <Text style={styles.paymentAmount}>{formatCurrency(order.total)}</Text>
              </View>
            </View>
          ))
        )}
      </View>
      
      <View style={styles.lastRefreshContainer}>
        <Text style={styles.lastRefreshText}>
          Ultimo aggiornamento: {lastRefresh.toLocaleTimeString()}
        </Text>
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
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statLabel: {
    fontSize: 14,
    color: colors.gray,
    marginBottom: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.dark,
  },
  section: {
    margin: 16,
    marginTop: 0,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.dark,
    marginBottom: 12,
  },
  emptyContainer: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  emptyText: {
    color: colors.gray,
  },
  orderCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    marginBottom: 16,
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
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  tableNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.dark,
    marginBottom: 4,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    marginLeft: 6,
    fontSize: 14,
    color: colors.gray,
  },
  orderInfo: {
    alignItems: 'flex-end',
  },
  orderTime: {
    fontSize: 14,
    color: colors.gray,
    marginBottom: 4,
  },
  orderTotal: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
  },
  orderItems: {
    padding: 16,
    paddingTop: 8,
    paddingBottom: 8,
  },
  orderItemText: {
    fontSize: 14,
    color: colors.dark,
    marginBottom: 4,
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
  paymentCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  paymentTime: {
    fontSize: 14,
    color: colors.gray,
  },
  paymentInfo: {
    alignItems: 'flex-end',
  },
  paymentMethod: {
    fontSize: 14,
    color: colors.gray,
    marginBottom: 4,
  },
  paymentAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.success,
  },
  lastRefreshContainer: {
    padding: 16,
    alignItems: 'center',
  },
  lastRefreshText: {
    fontSize: 12,
    color: colors.gray,
  },
});

const handlePrintReceipt = (order: Order) => {
  printReceipt(order);
};

// Aggiungi un pulsante per stampare lo scontrino
<Button title="Stampa Scontrino" onPress={() => handlePrintReceipt(order)} />