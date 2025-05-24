import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Table, TableStatus } from '@/types';
import { SAMPLE_TABLES } from '@/mocks/data';
import { v4 as uuidv4 } from '@/utils/uuid';

interface TableState {
  tables: Table[];
  getTableById: (id: string) => Table | undefined;
  getTableByNumber: (number: number) => Table | undefined;
  addTable: (number: number, seats: number) => string;
  updateTable: (id: string, number: number, seats: number) => void;
  updateTableStatus: (id: string, status: TableStatus, orderId?: string) => void;
  deleteTable: (id: string) => void;
  reserveTable: (id: string, name: string, time: string) => void;
  cancelReservation: (id: string) => void;
  checkTableReadyToPay: (tableId: string) => boolean;
}

export const useTableStore = create<TableState>()(
  persist(
    (set, get) => ({
      tables: SAMPLE_TABLES,
      
      getTableById: (id: string) => {
        return get().tables.find(table => table.id === id);
      },
      
      getTableByNumber: (number: number) => {
        return get().tables.find(table => table.number === number);
      },
      
      addTable: (number: number, seats: number) => {
        // Check if table number already exists
        const existingTable = get().getTableByNumber(number);
        if (existingTable) {
          throw new Error(`Tavolo ${number} già esistente`);
        }
        
        const newTable: Table = {
          id: `table-${uuidv4()}`,
          number,
          seats,
          status: 'available'
        };
        
        set(state => ({
          tables: [...state.tables, newTable]
        }));
        
        return newTable.id;
      },
      
      updateTable: (id: string, number: number, seats: number) => {
        // Check if table number already exists and it's not the same table
        const existingTable = get().getTableByNumber(number);
        if (existingTable && existingTable.id !== id) {
          throw new Error(`Tavolo ${number} già esistente`);
        }
        
        set(state => ({
          tables: state.tables.map(table => 
            table.id === id ? { ...table, number, seats } : table
          )
        }));
      },
      
      updateTableStatus: (id: string, status: TableStatus, orderId?: string) => {
        set(state => ({
          tables: state.tables.map(table => {
            if (table.id === id) {
              return { 
                ...table, 
                status,
                orderId: orderId !== undefined ? orderId : table.orderId
              };
            }
            return table;
          })
        }));
      },
      
      deleteTable: (id: string) => {
        // Check if table is occupied or has a reservation
        const table = get().getTableById(id);
        if (table && (table.status === 'occupied' || table.status === 'reserved')) {
          throw new Error(`Non puoi eliminare un tavolo ${table.status === 'occupied' ? 'occupato' : 'prenotato'}`);
        }
        
        set(state => ({
          tables: state.tables.filter(table => table.id !== id)
        }));
      },
      
      reserveTable: (id: string, name: string, time: string) => {
        set(state => ({
          tables: state.tables.map(table => {
            if (table.id === id) {
              return { 
                ...table, 
                status: 'reserved',
                reservationName: name,
                reservationTime: time
              };
            }
            return table;
          })
        }));
      },
      
      cancelReservation: (id: string) => {
        set(state => ({
          tables: state.tables.map(table => {
            if (table.id === id && table.status === 'reserved') {
              return { 
                ...table, 
                status: 'available',
                reservationName: undefined,
                reservationTime: undefined
              };
            }
            return table;
          })
        }));
      },
      
      // Check if all items in the order are served and table can be marked as ready to pay
      checkTableReadyToPay: (tableId: string) => {
        const table = get().getTableById(tableId);
        if (!table || !table.orderId) return false;
        
        // This would need to check with the orderStore if all items are served
        // For now, we'll return true as a placeholder
        // In a real implementation, you would inject the orderStore and check the status of all items
        return true;
      }
    }),
    {
      name: 'table-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);