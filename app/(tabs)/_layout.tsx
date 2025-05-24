import React from "react";
import { Tabs } from "expo-router";
import { LayoutAnimation, Platform, UIManager } from "react-native";
import { colors } from "@/constants/colors";
import { 
  LayoutGrid, 
  ChefHat, 
  CreditCard, 
  BarChart3,
  BookOpen,
  Wine,
  LogOut,
  User
} from "lucide-react-native";
import { useAuthStore } from "@/store/authStore";
import { TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";

// Abilita LayoutAnimation per Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function TabLayout() {
  const { currentUser, logout, hasPermission } = useAuthStore();
  const router = useRouter();
  
  const handleLogout = () => {
    logout();
    router.replace('/login');
  };
  
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.gray,
        tabBarStyle: {
          borderTopColor: colors.lightGray,
        },
        headerStyle: {
          backgroundColor: colors.white,
        },
        headerTitleStyle: {
          fontWeight: 'bold',
          color: colors.dark,
        },
        headerRight: () => (
          <TouchableOpacity 
            onPress={handleLogout}
            style={{ marginRight: 16 }}
          >
            <LogOut size={24} color={colors.dark} />
          </TouchableOpacity>
        ),
      }}
    >
      {/* Tavoli - visibile a tutti */}
      <Tabs.Screen
        name="index"
        options={{
          title: "Tavoli",
          tabBarIcon: ({ color }) => <LayoutGrid size={24} color={color} />,
          headerTitle: currentUser ? `Tavoli - ${currentUser.name}` : "Tavoli",
        }}
      />
      
      {/* Cucina - visibile solo a chef e admin */}
      {(hasPermission(['chef', 'admin'])) && (
        <Tabs.Screen
          name="kitchen"
          options={{
            title: "Cucina",
            tabBarIcon: ({ color }) => <ChefHat size={24} color={color} />,
          }}
        />
      )}
      
      {/* Bar - visibile solo a bartender e admin */}
      {(hasPermission(['bartender', 'admin'])) && (
        <Tabs.Screen
          name="bar"
          options={{
            title: "Bar",
            tabBarIcon: ({ color }) => <Wine size={24} color={color} />,
          }}
        />
      )}
      
      {/* Cassa - visibile solo a cashier e admin */}
      {(hasPermission(['cashier', 'admin'])) && (
        <Tabs.Screen
          name="cashier"
          options={{
            title: "Cassa",
            tabBarIcon: ({ color }) => <CreditCard size={24} color={color} />,
          }}
        />
      )}
      
      {/* Menu - visibile a tutti */}
      <Tabs.Screen
        name="menu"
        options={{
          title: "Menu",
          tabBarIcon: ({ color }) => <BookOpen size={24} color={color} />,
        }}
      />
      
      {/* Statistiche - visibile solo ad admin */}
      {hasPermission('admin') && (
        <Tabs.Screen
          name="reports"
          options={{
            title: "Statistiche",
            tabBarIcon: ({ color }) => <BarChart3 size={24} color={color} />,
          }}
        />
      )}
      
      {/* Utenti - visibile solo ad admin */}
      {hasPermission('admin') && (
        <Tabs.Screen
          name="users"
          options={{
            title: "Utenti",
            tabBarIcon: ({ color }) => <User size={24} color={color} />,
          }}
        />
      )}
    </Tabs>
  );
}