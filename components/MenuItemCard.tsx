import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { MenuItem } from '@/types';
import { colors } from '@/constants/colors';
import { formatCurrency } from '@/utils/formatters';
import { Edit, Trash2, ToggleLeft, ToggleRight } from 'lucide-react-native';

interface MenuItemCardProps {
  item: MenuItem;
  onEdit: () => void;
  onDelete: () => void;
  onToggleAvailability: () => void;
}

export const MenuItemCard: React.FC<MenuItemCardProps> = ({ 
  item, 
  onEdit, 
  onDelete,
  onToggleAvailability
}) => {
  return (
    <View style={[
      styles.container, 
      !item.available && styles.unavailableItem
    ]}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.price}>{formatCurrency(item.price)}</Text>
        </View>
        
        <Text style={styles.description} numberOfLines={2}>
          {item.description}
        </Text>
        
        <View style={styles.typeContainer}>
          <Text style={[
            styles.typeLabel, 
            item.type === 'food' ? styles.foodLabel : styles.drinkLabel
          ]}>
            {item.type === 'food' ? 'Cibo' : 'Bevanda'}
          </Text>
        </View>
        
        {!item.available && (
          <Text style={styles.unavailableText}>Non disponibile</Text>
        )}
        
        <View style={styles.actions}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={onToggleAvailability}
          >
            {item.available ? (
              <ToggleRight size={20} color={colors.success} />
            ) : (
              <ToggleLeft size={20} color={colors.gray} />
            )}
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={onEdit}
          >
            <Edit size={20} color={colors.primary} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={onDelete}
          >
            <Trash2 size={20} color={colors.danger} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
    flexDirection: 'row',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  unavailableItem: {
    opacity: 0.7,
  },
  content: {
    flex: 1,
    padding: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.dark,
    flex: 1,
    marginRight: 8,
  },
  price: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primary,
  },
  description: {
    fontSize: 14,
    color: colors.gray,
    marginBottom: 8,
  },
  typeContainer: {
    marginBottom: 8,
  },
  typeLabel: {
    fontSize: 12,
    fontWeight: '500',
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  foodLabel: {
    backgroundColor: 'rgba(46, 204, 113, 0.1)',
    color: colors.success,
  },
  drinkLabel: {
    backgroundColor: 'rgba(52, 152, 219, 0.1)',
    color: colors.primary,
  },
  unavailableText: {
    fontSize: 14,
    color: colors.danger,
    fontWeight: '500',
    marginBottom: 8,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  actionButton: {
    padding: 8,
    marginLeft: 8,
  },
});