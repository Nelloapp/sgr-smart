import { Order, OrderItem } from '@/types';
import { formatCurrency } from './formatters';

export class PrintingService {
  static instance: PrintingService;
  
  // Singleton pattern
  static getInstance(): PrintingService {
    if (!PrintingService.instance) {
      PrintingService.instance = new PrintingService();
    }
    return PrintingService.instance;
  }
  
  // Print order to kitchen
  printToKitchen(order: Order, items: OrderItem[]): void {
    console.log('Printing to kitchen printer...');
    this.formatAndPrint('KITCHEN', order, items);
  }
  
  // Print order to bar
  printToBar(order: Order, items: OrderItem[]): void {
    console.log('Printing to bar printer...');
    this.formatAndPrint('BAR', order, items);
  }
  
  // Print receipt
  printReceipt(order: Order): void {
    console.log('Printing receipt...');
    this.formatAndPrint('RECEIPT', order, order.items);
  }
  
  // Format and print order
  private formatAndPrint(destination: string, order: Order, items: OrderItem[]): void {
    // In a real app, this would connect to a printer service
    console.log(`=== ${destination} ORDER ===`);
    console.log(`Order ID: ${order.id}`);
    console.log(`Table: ${order.tableNumber}`);
    console.log(`Time: ${new Date(order.createdAt).toLocaleTimeString()}`);
    console.log('Items:');
    
    items.forEach(item => {
      console.log(`- ${item.quantity}x ${item.name} (${formatCurrency(item.price)}) ${item.notes ? `
  Note: ${item.notes}` : ''}`);
    });
    
    if (destination === 'RECEIPT') {
      console.log(`Subtotal: ${formatCurrency(order.total)}`);
      console.log(`Total: ${formatCurrency(order.total)}`);
      if (order.paymentMethod) {
        console.log(`Payment: ${order.paymentMethod === 'cash' ? 'Contanti' : 'Carta'}`);
      }
    }
    
    console.log('==================');
  }
}

export default PrintingService;