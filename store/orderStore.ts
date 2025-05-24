import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Order, OrderItem, OrderStatus, ItemStatus, OrderType } from '@/types';
import { v4 as uuidv4 } from '@/utils/uuid';
import { printOrderToKitchen, printOrderToBar, printReceipt } from '@/utils/printing';
import { useTableStore } from './tableStore';

interface OrderState {
  orders: Order[];
  getOrderById: (id: string) => Order | undefined;
  getOrdersByTableId: (tableId: string) => Order[];
  getActiveOrderByTableId: (tableId: string) => Order | undefined;
  getOrdersByType: (type: OrderType, status?: OrderStatus) => Order[];
  createOrder: (tableId: string, tableNumber: number, items: OrderItem[]) => string;
  updateOrderStatus: (id: string, status: OrderStatus, paymentMethod?: 'cash' | 'card') => boolean;
  updateOrderTypeStatus: (id: string, type: OrderType, status: OrderStatus) => void;
  addItemToOrder: (orderId: string, item: OrderItem) => void;
  updateItemQuantity: (orderId: string, itemId: string, quantity: number) => void;
  updateItemStatus: (orderId: string, itemId: string, status: ItemStatus) => void;
  removeItemFromOrder: (orderId: string, itemId: string) => void;
  deleteOrder: (id: string) => void;
  canModifyOrder: (id: string) => boolean;
  printOrder: (id: string) => void;
  getTodayOrders: () => Order[];
  getTodayRevenue: () => number;
  getPendingRevenue: () => number;
  getOrdersByDateRange: (startDate: Date, endDate: Date) => Order[];
  checkAndUpdateTableStatus: (orderId: string) => void;
}

export const useOrderStore = create<OrderState>()(
  persist(
    (set, get) => ({
      orders: [],
      
      getOrderById: (id: string) => {
        return get().orders.find(order => order.id === id);
      },
      
      getOrdersByTableId: (tableId: string) => {
        return get().orders.filter(order => order.tableId === tableId);
      },
      
      getActiveOrderByTableId: (tableId: string) => {
        return get().orders.find(
          order => order.tableId === tableId && order.status !== 'paid'
        );
      },
      
      getOrdersByType: (type: OrderType, status?: OrderStatus) => {
        return get().orders.filter(order => {
          // If status is specified, filter by status
          if (status && order.status !== status) {
            return false;
          }
          
          // For food orders, check if there are food items and food is not served
          if (type === 'food') {
            const hasFoodItems = order.items.some(item => item.type === 'food');
            return hasFoodItems && order.foodStatus !== 'served';
          }
          
          // For drink orders, check if there are drink items and drinks are not served
          if (type === 'drink') {
            const hasDrinkItems = order.items.some(item => item.type === 'drink');
            return hasDrinkItems && order.drinkStatus !== 'served';
          }
          
          return false;
        });
      },
      
      createOrder: (tableId: string, tableNumber: number, items: OrderItem[]) => {
        const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        
        const foodItems = items.filter(item => item.type === 'food');
        const drinkItems = items.filter(item => item.type === 'drink');
        
        const now = new Date().toISOString();
        
        const newOrder: Order = {
          id: `order-${uuidv4()}`,
          tableId,
          tableNumber,
          items,
          total,
          status: 'pending',
          foodStatus: foodItems.length > 0 ? 'pending' : 'served',
          drinkStatus: drinkItems.length > 0 ? 'pending' : 'served',
          createdAt: now,
          updatedAt: now
        };
        
        set(state => ({
          orders: [...state.orders, newOrder]
        }));
        
        // Update table status to occupied
        const tableStore = useTableStore.getState();
        tableStore.updateTableStatus(tableId, 'occupied', newOrder.id);
        
        return newOrder.id;
      },
      
      updateOrderStatus: (id: string, status: OrderStatus, paymentMethod?: 'cash' | 'card') => {
        let success = false;
        
        set(state => {
          const updatedOrders = state.orders.map(order => {
            if (order.id === id) {
              success = true;
              
              // If order is being paid, print receipt
              if (status === 'paid' && order.status !== 'paid') {
                printReceipt(order);
              }
              
              return {
                ...order,
                status,
                paymentMethod: status === 'paid' ? paymentMethod : order.paymentMethod,
                updatedAt: new Date().toISOString()
              };
            }
            return order;
          });
          
          return { orders: updatedOrders };
        });
        
        // If order is paid, update table status to available
        if (status === 'paid' && success) {
          const order = get().getOrderById(id);
          if (order) {
            const tableStore = useTableStore.getState();
            tableStore.updateTableStatus(order.tableId, 'available');
          }
        }
        
        return success;
      },
      
      updateOrderTypeStatus: (id: string, type: OrderType, status: OrderStatus) => {
        set(state => {
          const updatedOrders = state.orders.map(order => {
            if (order.id === id) {
              if (type === 'food') {
                // Update all food items status
                const updatedItems = order.items.map(item => {
                  if (item.type === 'food') {
                    return {
                      ...item,
                      status: status === 'served' ? ('served' as ItemStatus) : ('pending' as ItemStatus)
                    };
                  }
                  return item;
                });
                
                // Check if all items are served
                const allFoodServed = status === 'served';
                const allDrinkServed = order.drinkStatus === 'served';
                const allServed = allFoodServed && allDrinkServed;
                
                const updatedOrder = {
                  ...order,
                  items: updatedItems,
                  foodStatus: status,
                  status: allServed ? 'served' : order.status,
                  updatedAt: new Date().toISOString()
                };
                
                // Check if we need to update table status
                if (allServed) {
                  get().checkAndUpdateTableStatus(order.id);
                }
                
                return updatedOrder;
              } else if (type === 'drink') {
                // Update all drink items status
                const updatedItems = order.items.map(item => {
                  if (item.type === 'drink') {
                    return {
                      ...item,
                      status: status === 'served' ? ('served' as ItemStatus) : ('pending' as ItemStatus)
                    };
                  }
                  return item;
                });
                
                // Check if all items are served
                const allFoodServed = order.foodStatus === 'served';
                const allDrinkServed = status === 'served';
                const allServed = allFoodServed && allDrinkServed;
                
                const updatedOrder = {
                  ...order,
                  items: updatedItems,
                  drinkStatus: status,
                  status: allServed ? 'served' : order.status,
                  updatedAt: new Date().toISOString()
                };
                
                // Check if we need to update table status
                if (allServed) {
                  get().checkAndUpdateTableStatus(order.id);
                }
                
                return updatedOrder;
              }
              return order;
            }
            return order;
          });
          
          return { orders: updatedOrders };
        });
      },
      
      checkAndUpdateTableStatus: (orderId: string) => {
        const order = get().getOrderById(orderId);
        if (!order) return;
        
        // If both food and drinks are served, update table status to readyToPay
        if (order.foodStatus === 'served' && order.drinkStatus === 'served') {
          const tableStore = useTableStore.getState();
          tableStore.updateTableStatus(order.tableId, 'readyToPay', order.id);
        }
      },
      
      addItemToOrder: (orderId: string, item: OrderItem) => {
        set(state => {
          const updatedOrders = state.orders.map(order => {
            if (order.id === orderId) {
              // Check if item already exists
              const existingItemIndex = order.items.findIndex(
                i => i.menuItemId === item.menuItemId
              );
              
              let updatedItems;
              
              if (existingItemIndex >= 0) {
                // Update quantity if item exists
                updatedItems = order.items.map((i, index) => {
                  if (index === existingItemIndex) {
                    return {
                      ...i,
                      quantity: i.quantity + item.quantity
                    };
                  }
                  return i;
                });
              } else {
                // Add new item
                updatedItems = [...order.items, item];
              }
              
              // Recalculate total
              const total = updatedItems.reduce(
                (sum, i) => sum + (i.price * i.quantity), 
                0
              );
              
              // Check if we need to update food or drink status
              const hasFoodItems = updatedItems.some(i => i.type === 'food');
              const hasDrinkItems = updatedItems.some(i => i.type === 'drink');
              
              // If new food items were added, set foodStatus to pending
              const foodStatus = hasFoodItems && 
                (order.foodStatus === 'served' || !order.items.some(i => i.type === 'food')) 
                ? 'pending' 
                : order.foodStatus;
              
              // If new drink items were added, set drinkStatus to pending
              const drinkStatus = hasDrinkItems && 
                (order.drinkStatus === 'served' || !order.items.some(i => i.type === 'drink')) 
                ? 'pending' 
                : order.drinkStatus;
              
              // If any status changed to pending, set order status to pending
              const status = (foodStatus === 'pending' || drinkStatus === 'pending') 
                ? 'pending' 
                : order.status;
              
              return {
                ...order,
                items: updatedItems,
                total,
                foodStatus,
                drinkStatus,
                status,
                updatedAt: new Date().toISOString()
              };
            }
            return order;
          });
          
          return { orders: updatedOrders };
        });
      },
      
      updateItemQuantity: (orderId: string, itemId: string, quantity: number) => {
        set(state => {
          const updatedOrders = state.orders.map(order => {
            if (order.id === orderId) {
              const updatedItems = order.items.map(item => {
                if (item.id === itemId) {
                  return {
                    ...item,
                    quantity: Math.max(1, quantity)
                  };
                }
                return item;
              });
              
              // Recalculate total
              const total = updatedItems.reduce(
                (sum, item) => sum + (item.price * item.quantity), 
                0
              );
              
              return {
                ...order,
                items: updatedItems,
                total,
                updatedAt: new Date().toISOString()
              };
            }
            return order;
          });
          
          return { orders: updatedOrders };
        });
      },
      
      updateItemStatus: (orderId: string, itemId: string, status: ItemStatus) => {
        set(state => {
          const updatedOrders = state.orders.map(order => {
            if (order.id === orderId) {
              const updatedItems = order.items.map(item => {
                if (item.id === itemId) {
                  return {
                    ...item,
                    status
                  };
                }
                return item;
              });
              
              // Check if all items are served
              const allServed = updatedItems.every(item => item.status === 'served');
              
              // Check if all food items are served
              const foodItems = updatedItems.filter(item => item.type === 'food');
              const allFoodServed = foodItems.length > 0 && 
                foodItems.every(item => item.status === 'served');
              
              // Check if all drink items are served
              const drinkItems = updatedItems.filter(item => item.type === 'drink');
              const allDrinkServed = drinkItems.length > 0 && 
                drinkItems.every(item => item.status === 'served');
              
              const updatedOrder = {
                ...order,
                items: updatedItems,
                status: allServed ? 'served' : order.status,
                foodStatus: allFoodServed ? 'served' : order.foodStatus,
                drinkStatus: allDrinkServed ? 'served' : order.drinkStatus,
                updatedAt: new Date().toISOString()
              };
              
              // Check if we need to update table status
              if (allFoodServed && allDrinkServed) {
                get().checkAndUpdateTableStatus(order.id);
              }
              
              return updatedOrder;
            }
            return order;
          });
          
          return { orders: updatedOrders };
        });
      },
      
      removeItemFromOrder: (orderId: string, itemId: string) => {
        set(state => {
          const updatedOrders = state.orders.map(order => {
            if (order.id === orderId) {
              const updatedItems = order.items.filter(item => item.id !== itemId);
              
              // Recalculate total
              const total = updatedItems.reduce(
                (sum, item) => sum + (item.price * item.quantity), 
                0
              );
              
              // Check if there are any food or drink items left
              const hasFoodItems = updatedItems.some(item => item.type === 'food');
              const hasDrinkItems = updatedItems.some(item => item.type === 'drink');
              
              return {
                ...order,
                items: updatedItems,
                total,
                foodStatus: hasFoodItems ? order.foodStatus : 'served',
                drinkStatus: hasDrinkItems ? order.drinkStatus : 'served',
                updatedAt: new Date().toISOString()
              };
            }
            return order;
          });
          
          return { orders: updatedOrders };
        });
      },
      
      deleteOrder: (id: string) => {
        // Get the order before deleting it
        const order = get().getOrderById(id);
        
        set(state => ({
          orders: state.orders.filter(order => order.id !== id)
        }));
        
        // If order exists, update table status
        if (order) {
          const tableStore = useTableStore.getState();
          tableStore.updateTableStatus(order.tableId, 'available');
        }
      },
      
      canModifyOrder: (id: string) => {
        const order = get().getOrderById(id);
        if (!order) return false;
        
        // Can modify orders that are not paid
        return order.status !== 'paid';
      },
      
      printOrder: (id: string) => {
        const order = get().getOrderById(id);
        if (!order) return;
        
        // Print food items to kitchen
        const foodItems = order.items.filter(item => item.type === 'food');
        if (foodItems.length > 0) {
          printOrderToKitchen(order, foodItems);
        }
        
        // Print drink items to bar
        const drinkItems = order.items.filter(item => item.type === 'drink');
        if (drinkItems.length > 0) {
          printOrderToBar(order, drinkItems);
        }
      },
      
      getTodayOrders: () => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        return get().orders.filter(order => {
          const orderDate = new Date(order.createdAt);
          orderDate.setHours(0, 0, 0, 0);
          return orderDate.getTime() === today.getTime();
        });
      },
      
      getTodayRevenue: () => {
        const todayOrders = get().getTodayOrders();
        return todayOrders
          .filter(order => order.status === 'paid')
          .reduce((sum, order) => sum + order.total, 0);
      },
      
      getPendingRevenue: () => {
        return get().orders
          .filter(order => order.status !== 'paid')
          .reduce((sum, order) => sum + order.total, 0);
      },
      
      getOrdersByDateRange: (startDate: Date, endDate: Date) => {
        return get().orders.filter(order => {
          const orderDate = new Date(order.createdAt);
          return orderDate >= startDate && orderDate <= endDate;
        });
      }
    }),
    {
      name: 'order-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);