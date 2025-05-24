import React, { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  KeyboardAvoidingView, 
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useAuthStore, UserRole } from '@/store/authStore';
import { colors } from '@/constants/colors';
import { Lock, User, Mail, UserCircle, ChevronDown, ChevronUp } from 'lucide-react-native';

export default function RegisterScreen() {
  const router = useRouter();
  const { register } = useAuthStore();
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('waiter');
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const roles: { value: UserRole; label: string }[] = [
    { value: 'admin', label: 'Amministratore' },
    { value: 'waiter', label: 'Cameriere' },
    { value: 'chef', label: 'Chef' },
    { value: 'bartender', label: 'Barista' },
    { value: 'cashier', label: 'Cassiere' }
  ];
  
  const getRoleLabel = (roleValue: UserRole): string => {
    return roles.find(r => r.value === roleValue)?.label || '';
  };
  
  const handleRegister = () => {
    setError('');
    
    // Validation
    if (!username || !password || !confirmPassword || !name) {
      setError('Tutti i campi obbligatori devono essere compilati');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('Le password non corrispondono');
      return;
    }
    
    if (password.length < 6) {
      setError('La password deve contenere almeno 6 caratteri');
      return;
    }
    
    if (email && !isValidEmail(email)) {
      setError('Inserisci un indirizzo email valido');
      return;
    }
    
    setIsLoading(true);
    
    // Simulate network delay
    setTimeout(() => {
      const success = register(username, password, name, role, email);
      
      if (success) {
        Alert.alert(
          'Registrazione completata',
          'Il tuo account è stato creato con successo. Ora puoi accedere.',
          [{ text: 'OK', onPress: () => router.replace('/login') }]
        );
      } else {
        setIsLoading(false);
      }
    }, 1000);
  };
  
  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };
  
  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Stack.Screen 
        options={{
          title: "Registrazione",
          headerBackTitle: "Indietro"
        }} 
      />
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Crea un nuovo account</Text>
        
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
        
        <View style={styles.inputContainer}>
          <User size={20} color={colors.gray} />
          <TextInput
            style={styles.input}
            placeholder="Nome utente *"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            editable={!isLoading}
          />
        </View>
        
        <View style={styles.inputContainer}>
          <UserCircle size={20} color={colors.gray} />
          <TextInput
            style={styles.input}
            placeholder="Nome completo *"
            value={name}
            onChangeText={setName}
            editable={!isLoading}
          />
        </View>
        
        <View style={styles.inputContainer}>
          <Mail size={20} color={colors.gray} />
          <TextInput
            style={styles.input}
            placeholder="Email (opzionale)"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            editable={!isLoading}
          />
        </View>
        
        <View style={styles.inputContainer}>
          <Lock size={20} color={colors.gray} />
          <TextInput
            style={styles.input}
            placeholder="Password *"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            editable={!isLoading}
          />
        </View>
        
        <View style={styles.inputContainer}>
          <Lock size={20} color={colors.gray} />
          <TextInput
            style={styles.input}
            placeholder="Conferma password *"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            editable={!isLoading}
          />
        </View>
        
        <View style={styles.dropdownContainer}>
          <Text style={styles.dropdownLabel}>Ruolo:</Text>
          <TouchableOpacity 
            style={styles.dropdownButton}
            onPress={() => setShowRoleDropdown(!showRoleDropdown)}
            disabled={isLoading}
          >
            <Text style={styles.dropdownButtonText}>{getRoleLabel(role)}</Text>
            {showRoleDropdown ? (
              <ChevronUp size={20} color={colors.dark} />
            ) : (
              <ChevronDown size={20} color={colors.dark} />
            )}
          </TouchableOpacity>
          
          {showRoleDropdown && (
            <View style={styles.dropdownMenu}>
              {roles.map((roleOption) => (
                <TouchableOpacity
                  key={roleOption.value}
                  style={[
                    styles.dropdownItem,
                    role === roleOption.value && styles.dropdownItemSelected
                  ]}
                  onPress={() => {
                    setRole(roleOption.value);
                    setShowRoleDropdown(false);
                  }}
                >
                  <Text 
                    style={[
                      styles.dropdownItemText,
                      role === roleOption.value && styles.dropdownItemTextSelected
                    ]}
                  >
                    {roleOption.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
        
        <TouchableOpacity 
          style={styles.registerButton}
          onPress={handleRegister}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <Text style={styles.registerButtonText}>Registrati</Text>
          )}
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.loginButton}
          onPress={() => router.back()}
          disabled={isLoading}
        >
          <Text style={styles.loginButtonText}>Hai già un account? Accedi</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  scrollContent: {
    padding: 20,
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
  dropdownContainer: {
    marginBottom: 16,
  },
  dropdownLabel: {
    fontSize: 16,
    color: colors.dark,
    marginBottom: 8,
  },
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: colors.lightGray,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  dropdownButtonText: {
    fontSize: 16,
    color: colors.dark,
  },
  dropdownMenu: {
    borderWidth: 1,
    borderColor: colors.lightGray,
    borderRadius: 8,
    marginTop: 4,
    backgroundColor: colors.white,
  },
  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  dropdownItemSelected: {
    backgroundColor: colors.lightGray,
  },
  dropdownItemText: {
    fontSize: 16,
    color: colors.dark,
  },
  dropdownItemTextSelected: {
    fontWeight: 'bold',
    color: colors.primary,
  },
  registerButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  registerButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  loginButton: {
    marginTop: 16,
    alignItems: 'center',
  },
  loginButtonText: {
    color: colors.primary,
    fontSize: 14,
  },
});