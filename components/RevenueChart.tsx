import React from 'react';
import { StyleSheet, View, Text, Dimensions } from 'react-native';
import { colors } from '@/constants/colors';
import { DailyRevenue } from '@/types';
import { formatCurrency } from '@/utils/formatters';
import { LineChart } from 'react-native-chart-kit';

interface RevenueChartProps {
  data: DailyRevenue[];
  period: 'week' | 'month' | 'year';
}

export const RevenueChart: React.FC<RevenueChartProps> = ({ data, period }) => {
  const screenWidth = Dimensions.get('window').width - 32;
  
  // Assicurati che ci siano dati da visualizzare
  if (!data || data.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.noDataText}>Nessun dato disponibile per il periodo selezionato</Text>
      </View>
    );
  }
  
  // Prepara i dati per il grafico
  const labels = data.map(item => {
    const date = new Date(item.date);
    if (period === 'week') {
      return date.toLocaleDateString('it', { weekday: 'short' });
    } else if (period === 'month') {
      return date.getDate().toString();
    } else {
      return date.toLocaleDateString('it', { month: 'short' });
    }
  });
  
  // Trova il valore massimo per scalare correttamente il grafico
  const maxRevenue = Math.max(...data.map(item => item.revenue));
  const maxOrders = Math.max(...data.map(item => item.orders));
  
  // Scala gli ordini per adattarli allo stesso grafico
  const scaleFactor = maxRevenue > 0 && maxOrders > 0 ? maxRevenue / maxOrders : 20;
  
  const chartData = {
    labels,
    datasets: [
      {
        data: data.map(item => item.revenue || 0),
        color: (opacity = 1) => `rgba(52, 152, 219, ${opacity})`,
        strokeWidth: 2,
      },
      {
        data: data.map(item => (item.orders || 0) * scaleFactor),
        color: (opacity = 1) => `rgba(231, 76, 60, ${opacity})`,
        strokeWidth: 2,
      },
    ],
    legend: ['Ricavi', 'Ordini'],
  };

  const chartConfig = {
    backgroundColor: colors.white,
    backgroundGradientFrom: colors.white,
    backgroundGradientTo: colors.white,
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '6',
      strokeWidth: '2',
    },
  };

  const totalRevenue = data.reduce((sum, item) => sum + (item.revenue || 0), 0);
  const totalOrders = data.reduce((sum, item) => sum + (item.orders || 0), 0);
  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  return (
    <View style={styles.container}>
      <View style={styles.summaryContainer}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Ricavo Totale</Text>
          <Text style={styles.summaryValue}>{formatCurrency(totalRevenue)}</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Ordini Totali</Text>
          <Text style={styles.summaryValue}>{totalOrders}</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Valore Medio</Text>
          <Text style={styles.summaryValue}>{formatCurrency(averageOrderValue)}</Text>
        </View>
      </View>

      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Ricavi e Ordini</Text>
        <LineChart
          data={chartData}
          width={screenWidth}
          height={220}
          chartConfig={chartConfig}
          bezier
          style={styles.chart}
          fromZero
        />
        <View style={styles.legendContainer}>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: 'rgba(52, 152, 219, 1)' }]} />
            <Text style={styles.legendText}>Ricavi</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: 'rgba(231, 76, 60, 1)' }]} />
            <Text style={styles.legendText}>Ordini</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    marginHorizontal: 16,
    marginTop: 16,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 14,
    color: colors.gray,
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.dark,
  },
  chartContainer: {
    alignItems: 'center',
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.dark,
    marginBottom: 16,
    alignSelf: 'flex-start',
  },
  chart: {
    borderRadius: 16,
  },
  legendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 12,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 6,
  },
  legendText: {
    fontSize: 14,
    color: colors.dark,
  },
  noDataText: {
    textAlign: 'center',
    color: colors.gray,
    fontSize: 16,
    padding: 20,
  },
});