import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  KeyboardAvoidingView, 
  Platform,
  Image,
  Alert,
  ActivityIndicator
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import { colors } from '@/constants/colors';
import { Lock, User, LogIn } from 'lucide-react-native';

export default function LoginScreen() {
  const router = useRouter();
  const { login, isAuthenticated, isInitialized, initialize } = useAuthStore();
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  useEffect(() => {
    // Initialize auth store if not already initialized
    if (!isInitialized) {
      initialize();
    }
    
    // Redirect to home if already authenticated
    if (isAuthenticated) {
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, isInitialized, router, initialize]);
  
  const handleLogin = () => {
    setError('');
    
    if (!username || !password) {
      setError('Inserisci nome utente e password');
      return;
    }
    
    setIsLoading(true);
    
    // Simulate network delay
    setTimeout(() => {
      const success = login(username, password);
      
      if (success) {
        router.replace('/(tabs)');
      } else {
        setError('Nome utente o password non validi');
        setIsLoading(false);
      }
    }, 1000);
  };
  
  const handleRegister = () => {
    router.push('/register');
  };
  
  const handleDemoLogin = (role: string) => {
    setIsLoading(true);
    
    let demoUsername = '';
    let demoPassword = '';
    
    switch (role) {
      case 'admin':
        demoUsername = 'admin';
        demoPassword = 'admin123';
        break;
      case 'waiter':
        demoUsername = 'waiter';
        demoPassword = 'waiter123';
        break;
      case 'chef':
        demoUsername = 'chef';
        demoPassword = 'chef123';
        break;
      case 'bartender':
        demoUsername = 'bartender';
        demoPassword = 'bar123';
        break;
      case 'cashier':
        demoUsername = 'cashier';
        demoPassword = 'cash123';
        break;
    }
    
    // Simulate network delay
    setTimeout(() => {
      const success = login(demoUsername, demoPassword);
      
      if (success) {
        router.replace('/(tabs)');
      } else {
        setError('Errore durante il login demo');
        setIsLoading(false);
      }
    }, 1000);
  };
  
  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <Stack.Screen 
        options={{
          title: "Accedi",
          headerShown: false
        }} 
      />
      
      <View style={styles.logoContainer}>
        <Text style={styles.logoText}>RistoManager</Text>
        <Text style={styles.tagline}>Gestione ristorante semplificata</Text>
      </View>
      
      <View style={styles.formContainer}>
        <Text style={styles.title}>Accedi</Text>
        
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
        
        <View style={styles.inputContainer}>
          <User size={20} color={colors.gray} />
          <TextInput
            style={styles.input}
            placeholder="Nome utente"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            editable={!isLoading}
          />
        </View>
        
        <View style={styles.inputContainer}>
          <Lock size={20} color={colors.gray} />
          <TextInput
            style={styles.input}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            editable={!isLoading}
          />
        </View>
        
        <TouchableOpacity 
          style={styles.loginButton}
          onPress={handleLogin}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <>
              <LogIn size={20} color={colors.white} />
              <Text style={styles.loginButtonText}>Accedi</Text>
            </>
          )}
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.registerButton}
          onPress={handleRegister}
          disabled={isLoading}
        >
          <Text style={styles.registerButtonText}>Non hai un account? Registrati</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.demoContainer}>
        <Text style={styles.demoTitle}>Accesso rapido demo</Text>
        
        <View style={styles.demoButtons}>
          <TouchableOpacity 
            style={styles.demoButton}
            onPress={() => handleDemoLogin('admin')}
            disabled={isLoading}
          >
            <Text style={styles.demoButtonText}>Admin</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.demoButton}
            onPress={() => handleDemoLogin('waiter')}
            disabled={isLoading}
          >
            <Text style={styles.demoButtonText}>Cameriere</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.demoButton}
            onPress={() => handleDemoLogin('chef')}
            disabled={isLoading}
          >
            <Text style={styles.demoButtonText}>Chef</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.demoButton}
            onPress={() => handleDemoLogin('bartender')}
            disabled={isLoading}
          >
            <Text style={styles.demoButtonText}>Barista</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.demoButton}
            onPress={() => handleDemoLogin('cashier')}
            disabled={isLoading}
          >
            <Text style={styles.demoButtonText}>Cassiere</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      <Text style={styles.versionText}>Versione 1.0.0</Text>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
    padding: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 60,
    marginBottom: 40,
  },
  logoText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.primary,
  },
  tagline: {
    fontSize: 16,
    color: colors.gray,
    marginTop: 8,
  },
  formContainer: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 20,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.dark,
    marginBottom: 20,
  },
  errorText: {
    color: colors.danger,
    marginBottom: 15,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.lightGray,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    fontSize: 16,
  },
  loginButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  loginButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  registerButton: {
    marginTop: 16,
    alignItems: 'center',
  },
  registerButtonText: {
    color: colors.primary,
    fontSize: 14,
  },
  demoContainer: {
    backgroundColor: colors.lightGray,
    borderRadius: 12,
    padding: 16,
  },
  demoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.dark,
    marginBottom: 12,
    textAlign: 'center',
  },
  demoButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
  },
  demoButton: {
    backgroundColor: colors.white,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.lightGray,
  },
  demoButtonText: {
    color: colors.dark,
    fontSize: 14,
  },
  versionText: {
    color: colors.gray,
    fontSize: 12,
    textAlign: 'center',
    marginTop: 20,
  },
});