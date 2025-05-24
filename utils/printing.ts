import { Order, OrderItem } from '@/types';
import { PrintingService } from './printingService';

// Export functions that use the PrintingService singleton
export const printOrderToKitchen = (order: Order, items: OrderItem[]) => {
  const printingService = PrintingService.getInstance();
  printingService.printToKitchen(order, items);
};

export const printOrderToBar = (order: Order, items: OrderItem[]) => {
  const printingService = PrintingService.getInstance();
  printingService.printToBar(order, items);
};

export const printReceipt = (order: Order) => {
  const printingService = PrintingService.getInstance();
  printingService.printReceipt(order);
};

// Export a default object to avoid import errors
export default {
  printOrderToKitchen,
  printOrderToBar,
  printReceipt
};