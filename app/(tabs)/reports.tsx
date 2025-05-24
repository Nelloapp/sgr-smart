import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity,
  Modal,
  Platform,
  Alert
} from 'react-native';
import { Stack } from 'expo-router';
import { useOrderStore } from '@/store/orderStore';
import { colors } from '@/constants/colors';
import { formatCurrency } from '@/utils/formatters';
import { Calendar, ChevronDown, ChevronUp, Search, X } from 'lucide-react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { DailyRevenue } from '@/types';
import { RevenueChart } from '@/components/RevenueChart';

export default function ReportsScreen() {
  const { orders } = useOrderStore();
  
  const [datePickerVisible, setDatePickerVisible] = useState(false);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [dateType, setDateType] = useState<'start' | 'end'>('start');
  const [searchResults, setSearchResults] = useState<{
    orders: number;
    revenue: number;
    averageOrderValue: number;
  } | null>(null);
  const [searchModalVisible, setSearchModalVisible] = useState(false);
  const [chartPeriod, setChartPeriod] = useState<'week' | 'month' | 'year'>('week');
  const [chartData, setChartData] = useState<DailyRevenue[]>([]);
  
  // Calculate today's orders and revenue
  const getTodayOrders = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return orders.filter(order => {
      const orderDate = new Date(order.createdAt);
      orderDate.setHours(0, 0, 0, 0);
      return orderDate.getTime() === today.getTime();
    });
  };
  
  const getTodayRevenue = () => {
    const todayOrders = getTodayOrders();
    return todayOrders
      .filter(order => order.status === 'paid')
      .reduce((sum, order) => sum + order.total, 0);
  };
  
  const getPendingRevenue = () => {
    return orders
      .filter(order => order.status !== 'paid')
      .reduce((sum, order) => sum + order.total, 0);
  };
  
  const getOrdersByDateRange = (start: Date, end: Date) => {
    return orders.filter(order => {
      const orderDate = new Date(order.createdAt);
      return orderDate >= start && orderDate <= end;
    });
  };
  
  const todayOrders = getTodayOrders();
  const todayRevenue = getTodayRevenue();
  const pendingRevenue = getPendingRevenue();
  
  const paidTodayOrders = todayOrders.filter(o => o.status === 'paid');
  const averageOrderValue = paidTodayOrders.length > 0 
    ? todayRevenue / paidTodayOrders.length 
    : 0;
  
  useEffect(() => {
    generateChartData();
  }, [chartPeriod, orders]);
  
  const generateChartData = () => {
    try {
      const today = new Date();
      let startDate = new Date();
      let data: DailyRevenue[] = [];
      
      // Imposta la data di inizio in base al periodo selezionato
      if (chartPeriod === 'week') {
        startDate.setDate(today.getDate() - 6); // Ultimi 7 giorni
        
        // Genera dati per ogni giorno della settimana
        for (let i = 0; i < 7; i++) {
          const date = new Date(startDate);
          date.setDate(startDate.getDate() + i);
          
          const dayOrders = orders.filter(order => {
            const orderDate = new Date(order.createdAt);
            return orderDate.toDateString() === date.toDateString() && order.status === 'paid';
          });
          
          const dayRevenue = dayOrders.reduce((sum, order) => sum + order.total, 0);
          
          data.push({
            date: date.toISOString(),
            revenue: dayRevenue,
            orders: dayOrders.length
          });
        }
      } else if (chartPeriod === 'month') {
        startDate.setDate(today.getDate() - 29); // Ultimi 30 giorni
        
        // Genera dati per ogni giorno del mese
        for (let i = 0; i < 30; i++) {
          const date = new Date(startDate);
          date.setDate(startDate.getDate() + i);
          
          const dayOrders = orders.filter(order => {
            const orderDate = new Date(order.createdAt);
            return orderDate.toDateString() === date.toDateString() && order.status === 'paid';
          });
          
          const dayRevenue = dayOrders.reduce((sum, order) => sum + order.total, 0);
          
          data.push({
            date: date.toISOString(),
            revenue: dayRevenue,
            orders: dayOrders.length
          });
        }
      } else if (chartPeriod === 'year') {
        startDate = new Date(today.getFullYear(), 0, 1); // Inizio dell'anno corrente
        
        // Genera dati per ogni mese dell'anno
        for (let i = 0; i < 12; i++) {
          const monthStart = new Date(today.getFullYear(), i, 1);
          const monthEnd = new Date(today.getFullYear(), i + 1, 0);
          
          const monthOrders = orders.filter(order => {
            const orderDate = new Date(order.createdAt);
            return orderDate >= monthStart && orderDate <= monthEnd && order.status === 'paid';
          });
          
          const monthRevenue = monthOrders.reduce((sum, order) => sum + order.total, 0);
          
          data.push({
            date: monthStart.toISOString(),
            revenue: monthRevenue,
            orders: monthOrders.length
          });
        }
      }
      
      setChartData(data);
    } catch (error) {
      console.error('Errore nella generazione dei dati del grafico:', error);
      Alert.alert('Errore', 'Si è verificato un errore nella generazione dei dati statistici');
    }
  };
  
  const handleSearch = () => {
    try {
      // Assicurati che startDate sia prima di endDate
      let start = new Date(startDate);
      let end = new Date(endDate);
      
      if (start > end) {
        const temp = start;
        start = end;
        end = temp;
      }
      
      // Imposta l'ora di fine a 23:59:59
      end.setHours(23, 59, 59, 999);
      
      const filteredOrders = getOrdersByDateRange(start, end);
      const paidOrders = filteredOrders.filter(o => o.status === 'paid');
      const totalRevenue = paidOrders.reduce((sum, order) => sum + order.total, 0);
      const avgOrderValue = paidOrders.length > 0 ? totalRevenue / paidOrders.length : 0;
      
      setSearchResults({
        orders: paidOrders.length,
        revenue: totalRevenue,
        averageOrderValue: avgOrderValue
      });
      
      setSearchModalVisible(true);
    } catch (error) {
      console.error('Errore nella ricerca:', error);
      Alert.alert('Errore', 'Si è verificato un errore durante la ricerca');
    }
  };
  
  const showDatePicker = (type: 'start' | 'end') => {
    setDateType(type);
    setDatePickerVisible(true);
  };
  
  const onDateChange = (event: any, selectedDate?: Date) => {
    setDatePickerVisible(Platform.OS === 'ios');
    
    if (selectedDate) {
      if (dateType === 'start') {
        setStartDate(selectedDate);
      } else {
        setEndDate(selectedDate);
      }
    }
  };
  
  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{
          title: "Statistiche",
        }} 
      />
      
      <ScrollView style={styles.scrollView}>
        <View style={styles.chartPeriodSelector}>
          <TouchableOpacity 
            style={[styles.periodButton, chartPeriod === 'week' && styles.activePeriodButton]}
            onPress={() => setChartPeriod('week')}
          >
            <Text style={[styles.periodButtonText, chartPeriod === 'week' && styles.activePeriodButtonText]}>
              Settimana
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.periodButton, chartPeriod === 'month' && styles.activePeriodButton]}
            onPress={() => setChartPeriod('month')}
          >
            <Text style={[styles.periodButtonText, chartPeriod === 'month' && styles.activePeriodButtonText]}>
              Mese
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.periodButton, chartPeriod === 'year' && styles.activePeriodButton]}
            onPress={() => setChartPeriod('year')}
          >
            <Text style={[styles.periodButtonText, chartPeriod === 'year' && styles.activePeriodButtonText]}>
              Anno
            </Text>
          </TouchableOpacity>
        </View>
        
        <RevenueChart data={chartData} period={chartPeriod} />
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Riepilogo Giornaliero</Text>
          
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Incasso Oggi</Text>
              <Text style={styles.statValue}>{formatCurrency(todayRevenue)}</Text>
            </View>
            
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Ordini Completati</Text>
              <Text style={styles.statValue}>{paidTodayOrders.length}</Text>
            </View>
            
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Valore Medio Ordine</Text>
              <Text style={styles.statValue}>{formatCurrency(averageOrderValue)}</Text>
            </View>
            
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Incasso in Attesa</Text>
              <Text style={styles.statValue}>{formatCurrency(pendingRevenue)}</Text>
            </View>
          </View>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ricerca per Data</Text>
          
          <View style={styles.datePickerContainer}>
            <View style={styles.dateInputContainer}>
              <Text style={styles.dateLabel}>Data Inizio:</Text>
              <TouchableOpacity 
                style={styles.dateInput}
                onPress={() => showDatePicker('start')}
              >
                <Text style={styles.dateText}>
                  {startDate.toLocaleDateString()}
                </Text>
                <Calendar size={20} color={colors.dark} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.dateInputContainer}>
              <Text style={styles.dateLabel}>Data Fine:</Text>
              <TouchableOpacity 
                style={styles.dateInput}
                onPress={() => showDatePicker('end')}
              >
                <Text style={styles.dateText}>
                  {endDate.toLocaleDateString()}
                </Text>
                <Calendar size={20} color={colors.dark} />
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity 
              style={styles.searchButton}
              onPress={handleSearch}
            >
              <Search size={20} color={colors.white} />
              <Text style={styles.searchButtonText}>Cerca</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Metodi di Pagamento</Text>
          
          <View style={styles.paymentMethodsContainer}>
            {(() => {
              const paidOrders = orders.filter(o => o.status === 'paid');
              const cashOrders = paidOrders.filter(o => o.paymentMethod === 'cash');
              const cardOrders = paidOrders.filter(o => o.paymentMethod === 'card');
              const otherOrders = paidOrders.filter(o => !o.paymentMethod);
              
              const cashTotal = cashOrders.reduce((sum, o) => sum + o.total, 0);
              const cardTotal = cardOrders.reduce((sum, o) => sum + o.total, 0);
              const otherTotal = otherOrders.reduce((sum, o) => sum + o.total, 0);
              
              const totalRevenue = cashTotal + cardTotal + otherTotal;
              
              const cashPercentage = totalRevenue > 0 ? (cashTotal / totalRevenue) * 100 : 0;
              const cardPercentage = totalRevenue > 0 ? (cardTotal / totalRevenue) * 100 : 0;
              const otherPercentage = totalRevenue > 0 ? (otherTotal / totalRevenue) * 100 : 0;
              
              return (
                <View>
                  <View style={styles.paymentMethodCard}>
                    <View style={styles.paymentMethodInfo}>
                      <Text style={styles.paymentMethodName}>Contanti</Text>
                      <Text style={styles.paymentMethodPercentage}>
                        {cashPercentage.toFixed(1)}%
                      </Text>
                    </View>
                    <View style={styles.paymentMethodBar}>
                      <View 
                        style={[
                          styles.paymentMethodFill, 
                          { width: `${cashPercentage}%`, backgroundColor: colors.success }
                        ]} 
                      />
                    </View>
                    <View style={styles.paymentMethodDetails}>
                      <Text style={styles.paymentMethodCount}>
                        {cashOrders.length} ordini
                      </Text>
                      <Text style={styles.paymentMethodTotal}>
                        {formatCurrency(cashTotal)}
                      </Text>
                    </View>
                  </View>
                  
                  <View style={styles.paymentMethodCard}>
                    <View style={styles.paymentMethodInfo}>
                      <Text style={styles.paymentMethodName}>Carta</Text>
                      <Text style={styles.paymentMethodPercentage}>
                        {cardPercentage.toFixed(1)}%
                      </Text>
                    </View>
                    <View style={styles.paymentMethodBar}>
                      <View 
                        style={[
                          styles.paymentMethodFill, 
                          { width: `${cardPercentage}%`, backgroundColor: colors.primary }
                        ]} 
                      />
                    </View>
                    <View style={styles.paymentMethodDetails}>
                      <Text style={styles.paymentMethodCount}>
                        {cardOrders.length} ordini
                      </Text>
                      <Text style={styles.paymentMethodTotal}>
                        {formatCurrency(cardTotal)}
                      </Text>
                    </View>
                  </View>
                  
                  {otherOrders.length > 0 && (
                    <View style={styles.paymentMethodCard}>
                      <View style={styles.paymentMethodInfo}>
                        <Text style={styles.paymentMethodName}>Altro</Text>
                        <Text style={styles.paymentMethodPercentage}>
                          {otherPercentage.toFixed(1)}%
                        </Text>
                      </View>
                      <View style={styles.paymentMethodBar}>
                        <View 
                          style={[
                            styles.paymentMethodFill, 
                            { width: `${otherPercentage}%`, backgroundColor: colors.gray }
                          ]} 
                        />
                      </View>
                      <View style={styles.paymentMethodDetails}>
                        <Text style={styles.paymentMethodCount}>
                          {otherOrders.length} ordini
                        </Text>
                        <Text style={styles.paymentMethodTotal}>
                          {formatCurrency(otherTotal)}
                        </Text>
                      </View>
                    </View>
                  )}
                </View>
              );
            })()}
          </View>
        </View>
      </ScrollView>
      
      {/* Date Picker Modal */}
      {datePickerVisible && (
        <DateTimePicker
          value={dateType === 'start' ? startDate : endDate}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={onDateChange}
        />
      )}
      
      {/* Search Results Modal */}
      <Modal
        visible={searchModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setSearchModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Risultati Ricerca</Text>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setSearchModalVisible(false)}
              >
                <X size={24} color={colors.dark} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.modalBody}>
              <Text style={styles.dateRangeText}>
                Dal {startDate.toLocaleDateString()} al {endDate.toLocaleDateString()}
              </Text>
              
              {searchResults && (
                <View style={styles.searchResultsContainer}>
                  <View style={styles.searchResultCard}>
                    <Text style={styles.searchResultLabel}>Ordini Completati</Text>
                    <Text style={styles.searchResultValue}>{searchResults.orders}</Text>
                  </View>
                  
                  <View style={styles.searchResultCard}>
                    <Text style={styles.searchResultLabel}>Incasso Totale</Text>
                    <Text style={styles.searchResultValue}>
                      {formatCurrency(searchResults.revenue)}
                    </Text>
                  </View>
                  
                  <View style={styles.searchResultCard}>
                    <Text style={styles.searchResultLabel}>Valore Medio Ordine</Text>
                    <Text style={styles.searchResultValue}>
                      {formatCurrency(searchResults.averageOrderValue)}
                    </Text>
                  </View>
                </View>
              )}
            </View>
            
            <TouchableOpacity 
              style={styles.closeModalButton}
              onPress={() => setSearchModalVisible(false)}
            >
              <Text style={styles.closeModalButtonText}>Chiudi</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.lightGray,
  },
  scrollView: {
    flex: 1,
  },
  chartPeriodSelector: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
    marginHorizontal: 16,
  },
  periodButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginHorizontal: 4,
    backgroundColor: colors.white,
  },
  activePeriodButton: {
    backgroundColor: colors.primary,
  },
  periodButtonText: {
    color: colors.dark,
    fontWeight: '500',
  },
  activePeriodButtonText: {
    color: colors.white,
  },
  section: {
    margin: 16,
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.dark,
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48%',
    backgroundColor: colors.lightGray,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  statLabel: {
    fontSize: 14,
    color: colors.gray,
    marginBottom: 8,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.dark,
  },
  datePickerContainer: {
    marginBottom: 8,
  },
  dateInputContainer: {
    marginBottom: 12,
  },
  dateLabel: {
    fontSize: 14,
    color: colors.dark,
    marginBottom: 8,
  },
  dateInput: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.lightGray,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  dateText: {
    fontSize: 16,
    color: colors.dark,
  },
  searchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: 12,
    marginTop: 8,
  },
  searchButtonText: {
    color: colors.white,
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 8,
  },
  paymentMethodsContainer: {
    marginTop: 8,
  },
  paymentMethodCard: {
    marginBottom: 16,
  },
  paymentMethodInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  paymentMethodName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.dark,
  },
  paymentMethodPercentage: {
    fontSize: 16,
    color: colors.dark,
  },
  paymentMethodBar: {
    height: 8,
    backgroundColor: colors.lightGray,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  paymentMethodFill: {
    height: '100%',
    borderRadius: 4,
  },
  paymentMethodDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  paymentMethodCount: {
    fontSize: 14,
    color: colors.gray,
  },
  paymentMethodTotal: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.dark,
  },
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
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.dark,
  },
  closeButton: {
    padding: 4,
  },
  modalBody: {
    padding: 16,
  },
  dateRangeText: {
    fontSize: 16,
    color: colors.dark,
    marginBottom: 16,
    textAlign: 'center',
  },
  searchResultsContainer: {
    marginTop: 8,
  },
  searchResultCard: {
    backgroundColor: colors.lightGray,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  searchResultLabel: {
    fontSize: 14,
    color: colors.gray,
    marginBottom: 8,
  },
  searchResultValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.dark,
  },
  closeModalButton: {
    backgroundColor: colors.primary,
    padding: 16,
    alignItems: 'center',
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  closeModalButtonText: {
    color: colors.white,
    fontWeight: 'bold',
    fontSize: 16,
  },
});