import React, { useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { Table, TableStatus } from '@/types';
import { TableCard } from './TableCard';
import { colors } from '@/constants/colors';
import { Plus } from 'lucide-react-native';

interface TablesGridProps {
  tables: Table[];
  onTablePress: (table: Table) => void;
  onTableLongPress: (table: Table) => void;
  onAddTable: () => void;
  refreshTrigger?: number;
}

const { width } = Dimensions.get('window');
const isSmallScreen = width < 768;
const cardSize = isSmallScreen ? (width - 48) / 2 : 160;

export const TablesGrid: React.FC<TablesGridProps> = ({ 
  tables, 
  onTablePress, 
  onTableLongPress, 
  onAddTable,
  refreshTrigger = 0
}) => {
  // Sort tables by number
  const sortedTables = [...tables].sort((a, b) => a.number - b.number);
  
  // Group tables by status
  const availableTables = sortedTables.filter(table => table.status === 'available');
  const occupiedTables = sortedTables.filter(table => table.status === 'occupied');
  const reservedTables = sortedTables.filter(table => table.status === 'reserved');
  const readyToPayTables = sortedTables.filter(table => table.status === 'readyToPay');
  
  // Force re-render when refreshTrigger changes
  useEffect(() => {
    // This effect is just to trigger a re-render
  }, [refreshTrigger]);
  
  const renderTableSection = (title: string, tables: Table[], status: TableStatus) => {
    if (tables.length === 0) return null;
    
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <View style={styles.tablesGrid}>
          {tables.map(table => (
            <TableCard
              key={table.id}
              table={table}
              onPress={() => onTablePress(table)}
              onLongPress={() => onTableLongPress(table)}
              size={cardSize}
            />
          ))}
        </View>
      </View>
    );
  };
  
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {renderTableSection('Tavoli Pronti per il Pagamento', readyToPayTables, 'readyToPay')}
      {renderTableSection('Tavoli Occupati', occupiedTables, 'occupied')}
      {renderTableSection('Tavoli Prenotati', reservedTables, 'reserved')}
      {renderTableSection('Tavoli Disponibili', availableTables, 'available')}
      
      <View style={styles.addButtonContainer}>
        <TouchableOpacity style={styles.addButton} onPress={onAddTable}>
          <Plus size={24} color={colors.white} />
          <Text style={styles.addButtonText}>Aggiungi Tavolo</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 80,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: colors.dark,
  },
  tablesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  addButtonContainer: {
    marginTop: 16,
    alignItems: 'center',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  addButtonText: {
    color: colors.white,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});