import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { Table } from '@/types';
import { colors } from '@/constants/colors';
import { Users } from 'lucide-react-native';

interface TableCardProps {
  table: Table;
  onPress: (table: Table) => void;
  onLongPress?: (table: Table) => void;
  size?: number;
}

export const TableCard: React.FC<TableCardProps> = ({ 
  table, 
  onPress,
  onLongPress,
  size
}) => {
  const getStatusColor = () => {
    switch (table.status) {
      case 'available':
        return colors.tableAvailable;
      case 'occupied':
        return colors.tableOccupied;
      case 'readyToPay':
        return colors.tableReadyToPay;
      case 'reserved':
        return colors.tableReserved;
      default:
        return colors.gray;
    }
  };

  const getStatusText = () => {
    switch (table.status) {
      case 'available':
        return 'Libero';
      case 'occupied':
        return 'Occupato';
      case 'readyToPay':
        return 'Pronto per Pagare';
      case 'reserved':
        return 'Prenotato';
      default:
        return 'Sconosciuto';
    }
  };

  const getActionText = () => {
    switch (table.status) {
      case 'available':
        return 'Occupa';
      case 'occupied':
        return 'Vedi Ordine';
      case 'readyToPay':
        return 'Processa Pagamento';
      case 'reserved':
        return 'Gestisci';
      default:
        return 'Vedi';
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.container, 
        { borderColor: getStatusColor() },
        size ? { width: size } : null
      ]}
      onPress={() => onPress(table)}
      onLongPress={() => onLongPress && onLongPress(table)}
      delayLongPress={500}
    >
      <View style={[styles.statusBar, { backgroundColor: getStatusColor() }]} />
      <View style={styles.content}>
        <Text style={styles.tableNumber}>Tavolo {table.number}</Text>
        <View style={styles.infoRow}>
          <Users size={16} color={colors.dark} />
          <Text style={styles.seats}>{table.seats} posti</Text>
        </View>
        <Text style={[styles.status, { color: getStatusColor() }]}>
          {getStatusText()}
        </Text>
        
        {table.reservationName && (
          <Text style={styles.reservationInfo}>
            {table.reservationName} - {table.reservationTime}
          </Text>
        )}
      </View>
      <TouchableOpacity
        style={[styles.actionButton, { backgroundColor: getStatusColor() }]}
        onPress={() => onPress(table)}
      >
        <Text style={styles.actionButtonText}>{getActionText()}</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderRadius: 12,
    borderWidth: 2,
    overflow: 'hidden',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 16,
    width: '48%',
  },
  statusBar: {
    height: 8,
    width: '100%',
  },
  content: {
    padding: 16,
  },
  tableNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    color: colors.dark,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  seats: {
    marginLeft: 8,
    fontSize: 16,
    color: colors.dark,
  },
  status: {
    fontSize: 16,
    fontWeight: '500',
  },
  reservationInfo: {
    fontSize: 14,
    color: colors.gray,
    marginTop: 4,
    fontStyle: 'italic',
  },
  actionButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  actionButtonText: {
    color: colors.white,
    fontWeight: '600',
    fontSize: 16,
  },
});