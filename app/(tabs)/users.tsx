import React, { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  Alert,
  Modal,
  TextInput,
  ScrollView
} from 'react-native';
import { Stack } from 'expo-router';
import { useAuthStore, User, UserRole } from '@/store/authStore';
import { usePrinterStore } from '@/store/printerStore';
import { PrintingService, PrinterConfig } from '@/utils/printing';
import { colors } from '@/constants/colors';
import { 
  UserPlus, 
  Edit, 
  Trash, 
  X, 
  Save, 
  ChevronDown, 
  ChevronUp,
  Shield,
  Coffee,
  CreditCard,
  ChefHat,
  User as UserIcon,
  Printer,
  Settings,
  CheckCircle as CheckIcon
} from 'lucide-react-native';

export default function UsersScreen() {
  const { users, deleteUser, updateUser, register, currentUser } = useAuthStore();
  const { printers, addPrinter, updatePrinter, deletePrinter, setDefaultPrinter } = usePrinterStore();
  
  const [modalVisible, setModalVisible] = useState(false);
  const [printerModalVisible, setPrinterModalVisible] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedPrinter, setSelectedPrinter] = useState<PrinterConfig | null>(null);
  const [activeTab, setActiveTab] = useState<'users' | 'printers'>('users');
  
  // Form state for users
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('waiter');
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [error, setError] = useState('');
  
  // Form state for printers
  const [printerName, setPrinterName] = useState('');
  const [printerType, setPrinterType] = useState<'kitchen' | 'bar'>('kitchen');
  const [printerModel, setPrinterModel] = useState('');
  const [printerConnection, setPrinterConnection] = useState<'usb' | 'network' | 'bluetooth'>('network');
  const [printerAddress, setPrinterAddress] = useState('');
  const [printerIsDefault, setPrinterIsDefault] = useState(false);
  const [printerIsEnabled, setPrinterIsEnabled] = useState(true);
  const [showPrinterTypeDropdown, setShowPrinterTypeDropdown] = useState(false);
  const [showConnectionDropdown, setShowConnectionDropdown] = useState(false);
  const [testingConnection, setTestingConnection] = useState(false);
  
  const roles: { value: UserRole; label: string; icon: React.ReactNode }[] = [
    { value: 'admin', label: 'Amministratore', icon: <Shield size={16} color={colors.primary} /> },
    { value: 'waiter', label: 'Cameriere', icon: <UserIcon size={16} color={colors.primary} /> },
    { value: 'chef', label: 'Chef', icon: <ChefHat size={16} color={colors.primary} /> },
    { value: 'bartender', label: 'Barista', icon: <Coffee size={16} color={colors.primary} /> },
    { value: 'cashier', label: 'Cassiere', icon: <CreditCard size={16} color={colors.primary} /> }
  ];
  
  const printerTypes = [
    { value: 'kitchen', label: 'Cucina' },
    { value: 'bar', label: 'Bar' }
  ];
  
  const connectionTypes = [
    { value: 'network', label: 'Rete' },
    { value: 'usb', label: 'USB' },
    { value: 'bluetooth', label: 'Bluetooth' }
  ];
  
  const getRoleLabel = (roleValue: UserRole): string => {
    return roles.find(r => r.value === roleValue)?.label || '';
  };
  
  const getRoleIcon = (roleValue: UserRole): React.ReactNode => {
    return roles.find(r => r.value === roleValue)?.icon || null;
  };
  
  const handleAddUser = () => {
    setEditMode(false);
    setSelectedUser(null);
    resetUserForm();
    setModalVisible(true);
  };
  
  const handleEditUser = (user: User) => {
    setEditMode(true);
    setSelectedUser(user);
    setUsername(user.username);
    setName(user.name);
    setEmail(user.email || '');
    setRole(user.role);
    setPassword('');
    setConfirmPassword('');
    setModalVisible(true);
  };
  
  const handleDeleteUser = (user: User) => {
    // Non permettere di eliminare se stessi
    if (user.id === currentUser?.id) {
      Alert.alert('Errore', 'Non puoi eliminare il tuo account');
      return;
    }
    
    Alert.alert(
      'Conferma eliminazione',
      `Sei sicuro di voler eliminare l'utente ${user.name}?`,
      [
        { text: 'Annulla', style: 'cancel' },
        { 
          text: 'Elimina', 
          style: 'destructive',
          onPress: () => {
            try {
              const success = deleteUser(user.id);
              if (!success) {
                Alert.alert('Errore', 'Non è stato possibile eliminare l\'utente');
              }
            } catch (error) {
              Alert.alert('Errore', (error as Error).message);
            }
          }
        }
      ]
    );
  };
  
  const resetUserForm = () => {
    setUsername('');
    setPassword('');
    setConfirmPassword('');
    setName('');
    setEmail('');
    setRole('waiter');
    setError('');
  };
  
  const validateUserForm = (): boolean => {
    setError('');
    
    if (!username || !name) {
      setError('Nome utente e nome completo sono obbligatori');
      return false;
    }
    
    if (!editMode && !password) {
      setError('La password è obbligatoria per i nuovi utenti');
      return false;
    }
    
    if (password && password !== confirmPassword) {
      setError('Le password non corrispondono');
      return false;
    }
    
    if (password && password.length < 6) {
      setError('La password deve contenere almeno 6 caratteri');
      return false;
    }
    
    if (email && !isValidEmail(email)) {
      setError('Inserisci un indirizzo email valido');
      return false;
    }
    
    return true;
  };
  
  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };
  
  const handleSaveUser = () => {
    if (!validateUserForm()) return;
    
    try {
      if (editMode && selectedUser) {
        // Update existing user
        const updates: Partial<User> = {
          username,
          name,
          role,
          email: email || undefined
        };
        
        if (password) {
          updates.password = password;
        }
        
        const success = updateUser(selectedUser.id, updates);
        
        if (success) {
          setModalVisible(false);
          resetUserForm();
        }
      } else {
        // Create new user
        const success = register(username, password, name, role, email || undefined);
        
        if (success) {
          setModalVisible(false);
          resetUserForm();
        }
      }
    } catch (error) {
      setError((error as Error).message);
    }
  };
  
  // Printer management
  const handleAddPrinter = () => {
    setEditMode(false);
    setSelectedPrinter(null);
    resetPrinterForm();
    setPrinterModalVisible(true);
  };
  
  const handleEditPrinter = (printer: PrinterConfig) => {
    setEditMode(true);
    setSelectedPrinter(printer);
    setPrinterName(printer.name);
    setPrinterType(printer.type);
    setPrinterModel(printer.model);
    setPrinterConnection(printer.connection);
    setPrinterAddress(printer.address);
    setPrinterIsDefault(printer.isDefault);
    setPrinterIsEnabled(printer.isEnabled);
    setPrinterModalVisible(true);
  };
  
  const handleDeletePrinter = (printer: PrinterConfig) => {
    Alert.alert(
      'Conferma eliminazione',
      `Sei sicuro di voler eliminare la stampante ${printer.name}?`,
      [
        { text: 'Annulla', style: 'cancel' },
        { 
          text: 'Elimina', 
          style: 'destructive',
          onPress: () => {
            try {
              const success = deletePrinter(printer.id);
              if (!success) {
                Alert.alert('Errore', 'Non è stato possibile eliminare la stampante');
              }
            } catch (error) {
              Alert.alert('Errore', (error as Error).message);
            }
          }
        }
      ]
    );
  };
  
  const resetPrinterForm = () => {
    setPrinterName('');
    setPrinterType('kitchen');
    setPrinterModel('');
    setPrinterConnection('network');
    setPrinterAddress('');
    setPrinterIsDefault(false);
    setPrinterIsEnabled(true);
    setError('');
  };
  
  const validatePrinterForm = (): boolean => {
    setError('');
    
    if (!printerName) {
      setError('Il nome della stampante è obbligatorio');
      return false;
    }
    
    if (!printerModel) {
      setError('Il modello della stampante è obbligatorio');
      return false;
    }
    
    if (!printerAddress) {
      setError('L\'indirizzo della stampante è obbligatorio');
      return false;
    }
    
    return true;
  };
  
  const handleSavePrinter = () => {
    if (!validatePrinterForm()) return;
    
    try {
      if (editMode && selectedPrinter) {
        // Update existing printer
        const updates: Partial<PrinterConfig> = {
          name: printerName,
          type: printerType,
          model: printerModel,
          connection: printerConnection,
          address: printerAddress,
          isDefault: printerIsDefault,
          isEnabled: printerIsEnabled
        };
        
        const success = updatePrinter(selectedPrinter.id, updates);
        
        if (success) {
          setPrinterModalVisible(false);
          resetPrinterForm();
          Alert.alert('Successo', 'Stampante aggiornata correttamente');
        }
      } else {
        // Create new printer
        const newPrinter: Omit<PrinterConfig, 'id'> = {
          name: printerName,
          type: printerType,
          model: printerModel,
          connection: printerConnection,
          address: printerAddress,
          isDefault: printerIsDefault,
          isEnabled: printerIsEnabled
        };
        
        const newPrinterId = addPrinter(newPrinter);
        
        if (newPrinterId) {
          setPrinterModalVisible(false);
          resetPrinterForm();
          Alert.alert('Successo', 'Stampante aggiunta correttamente');
        }
      }
    } catch (error) {
      setError((error as Error).message);
    }
  };
  
  const handleSetDefaultPrinter = (printer: PrinterConfig) => {
    const success = setDefaultPrinter(printer.id, printer.type);
    if (success) {
      Alert.alert('Successo', `${printer.name} impostata come stampante predefinita per ${printer.type === 'kitchen' ? 'la cucina' : 'il bar'}`);
    } else {
      Alert.alert('Errore', 'Non è stato possibile impostare la stampante come predefinita');
    }
  };
  
  const handleTestPrinterConnection = async (printer: PrinterConfig) => {
    setTestingConnection(true);
    try {
      const success = await PrintingService.testPrinterConnection(printer);
      Alert.alert(
        'Test connessione',
        success 
          ? 'Connessione alla stampante riuscita!' 
          : 'Impossibile connettersi alla stampante. Verifica le impostazioni.'
      );
    } catch (error) {
      Alert.alert('Errore', 'Si è verificato un errore durante il test della connessione');
    } finally {
      setTestingConnection(false);
    }
  };
  
  const renderUserItem = ({ item }: { item: User }) => {
    return (
      <View style={styles.userCard}>
        <View style={styles.userInfo}>
          <View style={styles.userHeader}>
            <Text style={styles.userName}>{item.name}</Text>
            <View style={styles.roleContainer}>
              {getRoleIcon(item.role)}
              <Text style={styles.roleText}>{getRoleLabel(item.role)}</Text>
            </View>
          </View>
          <Text style={styles.userUsername}>@{item.username}</Text>
          {item.email && <Text style={styles.userEmail}>{item.email}</Text>}
        </View>
        
        <View style={styles.userActions}>
          <TouchableOpacity 
            style={styles.editButton}
            onPress={() => handleEditUser(item)}
          >
            <Edit size={20} color={colors.primary} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.deleteButton}
            onPress={() => handleDeleteUser(item)}
          >
            <Trash size={20} color={colors.danger} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };
  
  const renderPrinterItem = ({ item }: { item: PrinterConfig }) => {
    return (
      <View style={styles.printerCard}>
        <View style={styles.printerInfo}>
          <View style={styles.printerHeader}>
            <Text style={styles.printerName}>{item.name}</Text>
            <View style={styles.printerTypeContainer}>
              <Text style={styles.printerTypeText}>
                {item.type === 'kitchen' ? 'Cucina' : 'Bar'}
              </Text>
            </View>
          </View>
          <Text style={styles.printerModel}>{item.model}</Text>
          <Text style={styles.printerConnection}>
            {item.connection === 'network' ? 'Rete' : 
             item.connection === 'usb' ? 'USB' : 'Bluetooth'}: {item.address}
          </Text>
          <View style={styles.printerStatusContainer}>
            {item.isDefault && (
              <View style={styles.defaultBadge}>
                <Text style={styles.defaultBadgeText}>Predefinita</Text>
              </View>
            )}
            {!item.isEnabled && (
              <View style={styles.disabledBadge}>
                <Text style={styles.disabledBadgeText}>Disabilitata</Text>
              </View>
            )}
          </View>
        </View>
        
        <View style={styles.printerActions}>
          <TouchableOpacity 
            style={styles.printerActionButton}
            onPress={() => handleTestPrinterConnection(item)}
          >
            <Printer size={20} color={colors.primary} />
          </TouchableOpacity>
          
          {!item.isDefault && (
            <TouchableOpacity 
              style={styles.printerActionButton}
              onPress={() => handleSetDefaultPrinter(item)}
            >
              <Settings size={20} color={colors.primary} />
            </TouchableOpacity>
          )}
          
          <TouchableOpacity 
            style={styles.printerActionButton}
            onPress={() => handleEditPrinter(item)}
          >
            <Edit size={20} color={colors.primary} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.printerActionButton}
            onPress={() => handleDeletePrinter(item)}
          >
            <Trash size={20} color={colors.danger} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };
  
  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{
          title: "Amministrazione",
        }} 
      />
      
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'users' && styles.activeTab]}
          onPress={() => setActiveTab('users')}
        >
          <Text style={[styles.tabText, activeTab === 'users' && styles.activeTabText]}>
            Utenti
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'printers' && styles.activeTab]}
          onPress={() => setActiveTab('printers')}
        >
          <Text style={[styles.tabText, activeTab === 'printers' && styles.activeTabText]}>
            Stampanti
          </Text>
        </TouchableOpacity>
      </View>
      
      {activeTab === 'users' ? (
        <FlatList
          data={users}
          keyExtractor={(item) => item.id}
          renderItem={renderUserItem}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={
            <View style={styles.header}>
              <Text style={styles.headerTitle}>Utenti ({users.length})</Text>
              <TouchableOpacity 
                style={styles.addButton}
                onPress={handleAddUser}
              >
                <UserPlus size={20} color={colors.white} />
                <Text style={styles.addButtonText}>Nuovo Utente</Text>
              </TouchableOpacity>
            </View>
          }
        />
      ) : (
        <FlatList
          data={printers}
          keyExtractor={(item) => item.id}
          renderItem={renderPrinterItem}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={
            <View style={styles.header}>
              <Text style={styles.headerTitle}>Stampanti ({printers.length})</Text>
              <TouchableOpacity 
                style={styles.addButton}
                onPress={handleAddPrinter}
              >
                <Printer size={20} color={colors.white} />
                <Text style={styles.addButtonText}>Nuova Stampante</Text>
              </TouchableOpacity>
            </View>
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Nessuna stampante configurata</Text>
              <TouchableOpacity 
                style={[styles.addButton, {marginTop: 16}]}
                onPress={handleAddPrinter}
              >
                <Printer size={20} color={colors.white} />
                <Text style={styles.addButtonText}>Aggiungi Stampante</Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}
      
      {/* User Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editMode ? 'Modifica Utente' : 'Nuovo Utente'}
              </Text>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setModalVisible(false)}
              >
                <X size={24} color={colors.dark} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.formContainer}>
              {error ? <Text style={styles.errorText}>{error}</Text> : null}
              
              <View style={styles.formGroup}>
                <Text style={styles.label}>Nome utente *</Text>
                <TextInput
                  style={styles.input}
                  value={username}
                  onChangeText={setUsername}
                  placeholder="Nome utente"
                  autoCapitalize="none"
                />
              </View>
              
              <View style={styles.formGroup}>
                <Text style={styles.label}>Nome completo *</Text>
                <TextInput
                  style={styles.input}
                  value={name}
                  onChangeText={setName}
                  placeholder="Nome completo"
                />
              </View>
              
              <View style={styles.formGroup}>
                <Text style={styles.label}>Email</Text>
                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="Email (opzionale)"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
              
              <View style={styles.formGroup}>
                <Text style={styles.label}>Password {editMode ? '(lascia vuoto per non modificare)' : '*'}</Text>
                <TextInput
                  style={styles.input}
                  value={password}
                  onChangeText={setPassword}
                  placeholder={editMode ? "Nuova password (opzionale)" : "Password"}
                  secureTextEntry
                />
              </View>
              
              <View style={styles.formGroup}>
                <Text style={styles.label}>Conferma password</Text>
                <TextInput
                  style={styles.input}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="Conferma password"
                  secureTextEntry
                />
              </View>
              
              <View style={styles.formGroup}>
                <Text style={styles.label}>Ruolo *</Text>
                <TouchableOpacity 
                  style={styles.dropdownButton}
                  onPress={() => setShowRoleDropdown(!showRoleDropdown)}
                >
                  <View style={styles.dropdownButtonContent}>
                    {getRoleIcon(role)}
                    <Text style={styles.dropdownButtonText}>{getRoleLabel(role)}</Text>
                  </View>
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
                        <View style={styles.dropdownItemContent}>
                          {roleOption.icon}
                          <Text 
                            style={[
                              styles.dropdownItemText,
                              role === roleOption.value && styles.dropdownItemTextSelected
                            ]}
                          >
                            {roleOption.label}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            </ScrollView>
            
            <View style={styles.modalFooter}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Annulla</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.saveButton}
                onPress={handleSaveUser}
              >
                <Save size={20} color={colors.white} />
                <Text style={styles.saveButtonText}>Salva</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      
      {/* Printer Modal */}
      <Modal
        visible={printerModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setPrinterModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editMode ? 'Modifica Stampante' : 'Nuova Stampante'}
              </Text>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setPrinterModalVisible(false)}
              >
                <X size={24} color={colors.dark} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.formContainer}>
              {error ? <Text style={styles.errorText}>{error}</Text> : null}
              
              <View style={styles.formGroup}>
                <Text style={styles.label}>Nome stampante *</Text>
                <TextInput
                  style={styles.input}
                  value={printerName}
                  onChangeText={setPrinterName}
                  placeholder="Nome stampante"
                />
              </View>
              
              <View style={styles.formGroup}>
                <Text style={styles.label}>Tipo *</Text>
                <TouchableOpacity 
                  style={styles.dropdownButton}
                  onPress={() => setShowPrinterTypeDropdown(!showPrinterTypeDropdown)}
                >
                  <View style={styles.dropdownButtonContent}>
                    <Text style={styles.dropdownButtonText}>
                      {printerType === 'kitchen' ? 'Cucina' : 'Bar'}
                    </Text>
                  </View>
                  {showPrinterTypeDropdown ? (
                    <ChevronUp size={20} color={colors.dark} />
                  ) : (
                    <ChevronDown size={20} color={colors.dark} />
                  )}
                </TouchableOpacity>
                
                {showPrinterTypeDropdown && (
                  <View style={styles.dropdownMenu}>
                    {printerTypes.map((typeOption) => (
                      <TouchableOpacity
                        key={typeOption.value}
                        style={[
                          styles.dropdownItem,
                          printerType === typeOption.value && styles.dropdownItemSelected
                        ]}
                        onPress={() => {
                          setPrinterType(typeOption.value as 'kitchen' | 'bar');
                          setShowPrinterTypeDropdown(false);
                        }}
                      >
                        <Text 
                          style={[
                            styles.dropdownItemText,
                            printerType === typeOption.value && styles.dropdownItemTextSelected
                          ]}
                        >
                          {typeOption.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
              
              <View style={styles.formGroup}>
                <Text style={styles.label}>Modello *</Text>
                <TextInput
                  style={styles.input}
                  value={printerModel}
                  onChangeText={setPrinterModel}
                  placeholder="Modello stampante"
                />
              </View>
              
              <View style={styles.formGroup}>
                <Text style={styles.label}>Tipo di connessione *</Text>
                <TouchableOpacity 
                  style={styles.dropdownButton}
                  onPress={() => setShowConnectionDropdown(!showConnectionDropdown)}
                >
                  <View style={styles.dropdownButtonContent}>
                    <Text style={styles.dropdownButtonText}>
                      {printerConnection === 'network' ? 'Rete' : 
                       printerConnection === 'usb' ? 'USB' : 'Bluetooth'}
                    </Text>
                  </View>
                  {showConnectionDropdown ? (
                    <ChevronUp size={20} color={colors.dark} />
                  ) : (
                    <ChevronDown size={20} color={colors.dark} />
                  )}
                </TouchableOpacity>
                
                {showConnectionDropdown && (
                  <View style={styles.dropdownMenu}>
                    {connectionTypes.map((connectionOption) => (
                      <TouchableOpacity
                        key={connectionOption.value}
                        style={[
                          styles.dropdownItem,
                          printerConnection === connectionOption.value && styles.dropdownItemSelected
                        ]}
                        onPress={() => {
                          setPrinterConnection(connectionOption.value as 'network' | 'usb' | 'bluetooth');
                          setShowConnectionDropdown(false);
                        }}
                      >
                        <Text 
                          style={[
                            styles.dropdownItemText,
                            printerConnection === connectionOption.value && styles.dropdownItemTextSelected
                          ]}
                        >
                          {connectionOption.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
              
              <View style={styles.formGroup}>
                <Text style={styles.label}>
                  {printerConnection === 'network' ? 'Indirizzo IP *' : 
                   printerConnection === 'usb' ? 'Porta USB *' : 'Indirizzo MAC *'}
                </Text>
                <TextInput
                  style={styles.input}
                  value={printerAddress}
                  onChangeText={setPrinterAddress}
                  placeholder={
                    printerConnection === 'network' ? 'Es. 192.168.1.100' : 
                    printerConnection === 'usb' ? 'Es. COM3 o /dev/usb/lp0' : 'Es. 00:11:22:33:44:55'
                  }
                />
              </View>
              
              <View style={styles.checkboxContainer}>
                <TouchableOpacity
                  style={[styles.checkbox, printerIsDefault && styles.checkboxChecked]}
                  onPress={() => setPrinterIsDefault(!printerIsDefault)}
                >
                  {printerIsDefault && <CheckIcon size={16} color={colors.white} />}
                </TouchableOpacity>
                <Text style={styles.checkboxLabel}>Imposta come stampante predefinita</Text>
              </View>
              
              <View style={styles.checkboxContainer}>
                <TouchableOpacity
                  style={[styles.checkbox, printerIsEnabled && styles.checkboxChecked]}
                  onPress={() => setPrinterIsEnabled(!printerIsEnabled)}
                >
                  {printerIsEnabled && <CheckIcon size={16} color={colors.white} />}
                </TouchableOpacity>
                <Text style={styles.checkboxLabel}>Abilitata</Text>
              </View>
            </ScrollView>
            
            <View style={styles.modalFooter}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => setPrinterModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Annulla</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.saveButton}
                onPress={handleSavePrinter}
                disabled={testingConnection}
              >
                <Save size={20} color={colors.white} />
                <Text style={styles.saveButtonText}>
                  {testingConnection ? 'Test in corso...' : 'Salva'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.lightGray,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
  },
  tabText: {
    fontSize: 16,
    color: colors.gray,
  },
  activeTabText: {
    color: colors.primary,
    fontWeight: '600',
  },
  listContent: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.dark,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  addButtonText: {
    color: colors.white,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  userCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  userInfo: {
    flex: 1,
  },
  userHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.dark,
  },
  roleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.lightGray,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  roleText: {
    fontSize: 12,
    color: colors.dark,
    marginLeft: 4,
  },
  userUsername: {
    fontSize: 14,
    color: colors.gray,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: colors.gray,
  },
  userActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  editButton: {
    padding: 8,
    marginRight: 8,
  },
  deleteButton: {
    padding: 8,
  },
  // Printer card styles
  printerCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  printerInfo: {
    flex: 1,
  },
  printerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  printerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.dark,
  },
  printerTypeContainer: {
    backgroundColor: colors.lightGray,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  printerTypeText: {
    fontSize: 12,
    color: colors.dark,
  },
  printerModel: {
    fontSize: 14,
    color: colors.dark,
    marginBottom: 4,
  },
  printerConnection: {
    fontSize: 14,
    color: colors.gray,
    marginBottom: 4,
  },
  printerStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  defaultBadge: {
    backgroundColor: colors.primary,
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 4,
    marginRight: 8,
  },
  defaultBadgeText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  disabledBadge: {
    backgroundColor: colors.danger,
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 4,
  },
  disabledBadgeText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  printerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  printerActionButton: {
    padding: 8,
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors.white,
    borderRadius: 12,
    width: '90%',
    maxWidth: 500,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.dark,
  },
  closeButton: {
    padding: 4,
  },
  formContainer: {
    padding: 16,
    maxHeight: 400,
  },
  errorText: {
    color: colors.danger,
    marginBottom: 16,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: colors.dark,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.lightGray,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: colors.lightGray,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  dropdownButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dropdownButtonText: {
    fontSize: 16,
    color: colors.dark,
    marginLeft: 8,
  },
  dropdownMenu: {
    borderWidth: 1,
    borderColor: colors.lightGray,
    borderRadius: 8,
    marginTop: 4,
    backgroundColor: colors.white,
  },
  dropdownItem: {
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  dropdownItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dropdownItemSelected: {
    backgroundColor: colors.lightGray,
  },
  dropdownItemText: {
    fontSize: 16,
    color: colors.dark,
    marginLeft: 8,
  },
  dropdownItemTextSelected: {
    fontWeight: 'bold',
    color: colors.primary,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 4,
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
  },
  checkboxLabel: {
    fontSize: 16,
    color: colors.dark,
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: colors.lightGray,
  },
  cancelButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: colors.lightGray,
    borderRadius: 8,
  },
  cancelButtonText: {
    color: colors.dark,
    fontSize: 16,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  saveButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  emptyContainer: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: colors.gray,
    marginBottom: 8,
  },
});