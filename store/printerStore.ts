import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PrinterConfig } from '@/utils/printing';
import { v4 as uuidv4 } from '@/utils/uuid';

// Configurazioni di stampante predefinite
const DEFAULT_PRINTERS: PrinterConfig[] = [
  {
    id: 'printer-kitchen-1',
    name: 'Stampante Cucina',
    type: 'kitchen',
    model: 'Epson TM-T20',
    connection: 'network',
    address: '192.168.1.100',
    isDefault: true,
    isEnabled: true
  },
  {
    id: 'printer-bar-1',
    name: 'Stampante Bar',
    type: 'bar',
    model: 'Epson TM-T20',
    connection: 'network',
    address: '192.168.1.101',
    isDefault: true,
    isEnabled: true
  }
];

interface PrinterState {
  printers: PrinterConfig[];
  getDefaultPrinter: (type: 'kitchen' | 'bar') => PrinterConfig | undefined;
  getPrinterById: (id: string) => PrinterConfig | undefined;
  addPrinter: (printer: Omit<PrinterConfig, 'id'>) => string;
  updatePrinter: (id: string, updates: Partial<PrinterConfig>) => boolean;
  deletePrinter: (id: string) => boolean;
  setDefaultPrinter: (id: string, type: 'kitchen' | 'bar') => boolean;
  resetPrinters: () => void;
}

export const usePrinterStore = create<PrinterState>()(
  persist(
    (set, get) => ({
      printers: DEFAULT_PRINTERS,
      
      getDefaultPrinter: (type: 'kitchen' | 'bar') => {
        const printers = get().printers;
        return printers.find(printer => printer.type === type && printer.isDefault && printer.isEnabled);
      },
      
      getPrinterById: (id: string) => {
        const printers = get().printers;
        return printers.find(printer => printer.id === id);
      },
      
      addPrinter: (printer: Omit<PrinterConfig, 'id'>) => {
        const newPrinterId = `printer-${uuidv4()}`;
        
        // Se è impostata come predefinita, rimuovi l'impostazione predefinita dalle altre stampanti dello stesso tipo
        if (printer.isDefault) {
          set(state => ({
            printers: state.printers.map(p => 
              p.type === printer.type ? { ...p, isDefault: false } : p
            )
          }));
        }
        
        // Aggiungi la nuova stampante
        set(state => ({
          printers: [...state.printers, { ...printer, id: newPrinterId }]
        }));
        
        return newPrinterId;
      },
      
      updatePrinter: (id: string, updates: Partial<PrinterConfig>) => {
        const printer = get().getPrinterById(id);
        if (!printer) return false;
        
        // Se stiamo impostando questa stampante come predefinita, rimuovi l'impostazione predefinita dalle altre stampanti dello stesso tipo
        if (updates.isDefault) {
          set(state => ({
            printers: state.printers.map(p => 
              p.type === printer.type && p.id !== id ? { ...p, isDefault: false } : p
            )
          }));
        }
        
        // Aggiorna la stampante
        set(state => ({
          printers: state.printers.map(p => 
            p.id === id ? { ...p, ...updates } : p
          )
        }));
        
        return true;
      },
      
      deletePrinter: (id: string) => {
        const printer = get().getPrinterById(id);
        if (!printer) return false;
        
        // Rimuovi la stampante
        set(state => ({
          printers: state.printers.filter(p => p.id !== id)
        }));
        
        // Se era la stampante predefinita, imposta un'altra stampante dello stesso tipo come predefinita
        if (printer.isDefault) {
          const printersOfSameType = get().printers.filter(p => p.type === printer.type && p.id !== id);
          if (printersOfSameType.length > 0) {
            get().setDefaultPrinter(printersOfSameType[0].id, printer.type);
          }
        }
        
        return true;
      },
      
      setDefaultPrinter: (id: string, type: 'kitchen' | 'bar') => {
        const printer = get().getPrinterById(id);
        if (!printer || printer.type !== type) return false;
        
        // Rimuovi l'impostazione predefinita dalle altre stampanti dello stesso tipo
        set(state => ({
          printers: state.printers.map(p => 
            p.type === type ? { ...p, isDefault: p.id === id } : p
          )
        }));
        
        return true;
      },
      
      resetPrinters: () => {
        set({ printers: DEFAULT_PRINTERS });
      },
    }),
    {
      name: 'printer-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);