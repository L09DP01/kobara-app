import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput, KeyboardAvoidingView, Platform, ActivityIndicator, Alert, TouchableWithoutFeedback, Keyboard, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft, ArrowDownCircle, CheckCircle2 } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { balanceService } from '../../services/balance';
import { useQueryClient } from '@tanstack/react-query';

const WITHDRAWAL_METHODS = [
  { id: 'moncash', name: 'MonCash', icon: '📱' },
  { id: 'natcash', name: 'Natcash', icon: '💵' },
  { id: 'zelle', name: 'Zelle', icon: '🏦' },
];

export default function WithdrawalScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [amount, setAmount] = useState('');
  const [reference, setReference] = useState('');
  const [method, setMethod] = useState(WITHDRAWAL_METHODS[0].id);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleWithdraw = async () => {
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) return;
    if (!reference) return;
    
    if (method === 'zelle' && Number(amount) < 3125) {
      setError("Le montant minimum pour Zelle est de 3125 HTG (20 $).");
      return;
    } else if (method !== 'zelle' && Number(amount) < 150) {
      setError("Le montant minimum est de 150 HTG.");
      return;
    }

    setIsLoading(true);
    setError(null);
    
    // Check biometrics
    try {
      const { storage: SecureStore } = await import('@/utils/storage');
      const LocalAuthentication = await import('expo-local-authentication');
      
      const bioEnabled = await SecureStore.getItemAsync('kobara_biometrics_enabled');
      if (bioEnabled === 'true') {
        const hasHardware = await LocalAuthentication.hasHardwareAsync();
        const isEnrolled = await LocalAuthentication.isEnrolledAsync();
        
        if (hasHardware && isEnrolled) {
          /*
          (global as any).isAuthenticatingBiometrics = true;
          const result = await LocalAuthentication.authenticateAsync({
            promptMessage: 'Confirmez votre identité pour valider ce retrait',
            fallbackLabel: 'Utiliser le code',
          });
          (global as any).isAuthenticatingBiometrics = false;
          
          if (!result.success) {
            setIsLoading(false);
            return;
          }
          */
        }
      }
    } catch (e) {
      console.error(e);
    }
    
    const result = await balanceService.requestWithdrawal(method, Number(amount), reference);
    
    setIsLoading(false);
    
    if (result.success) {
      queryClient.invalidateQueries({ queryKey: ['balance'] });
      
      const isInstantSuccess = result.withdrawal?.status === 'completed';
      const successMessage = isInstantSuccess 
        ? "Votre retrait a été effectué avec succès."
        : "Votre demande de retrait a été envoyée et est en cours de traitement.";
        
      Alert.alert("Succès", successMessage, [
        { text: "OK", onPress: () => router.back() }
      ]);
    } else {
      setError(result.error || "Une erreur s'est produite");
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ChevronLeft size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Retrait de fonds</Text>
        <View style={styles.placeholder} />
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView style={styles.content} keyboardShouldPersistTaps="handled">
            <View style={styles.card}>
              {error && (
                <View style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', borderColor: 'rgba(239, 68, 68, 0.2)', borderWidth: 1, padding: 12, borderRadius: 12, marginBottom: 16 }}>
                  <Text style={{ color: '#F87171', fontSize: 14, textAlign: 'center' }}>{error}</Text>
                </View>
              )}

              <Text style={styles.label}>Méthode de retrait</Text>
              <View style={styles.methodsContainer}>
                {WITHDRAWAL_METHODS.map((m) => (
                  <TouchableOpacity
                    key={m.id}
                    style={[styles.methodCard, method === m.id && styles.methodCardActive]}
                    onPress={() => setMethod(m.id)}
                  >
                    <Text style={styles.methodIcon}>{m.icon}</Text>
                    <Text style={[styles.methodName, method === m.id && styles.methodNameActive]}>{m.name}</Text>
                    {method === m.id && (
                      <View style={styles.checkIcon}>
                        <CheckCircle2 size={16} color="#FF7A00" />
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.label}>
                {method === 'zelle' ? 'Email ou Téléphone Zelle' : 'Numéro de téléphone'}
              </Text>
              <TextInput
                style={styles.inputBox}
                placeholder={method === 'zelle' ? 'email@exemple.com' : 'Ex: 34000000'}
                placeholderTextColor="#6B7280"
                value={reference}
                onChangeText={setReference}
                editable={!isLoading}
                keyboardType={method === 'zelle' ? 'email-address' : 'phone-pad'}
              />

              <Text style={styles.label}>Montant (HTG)</Text>
              <TextInput
                style={styles.amountInput}
                placeholder="0.00"
                placeholderTextColor="#6B7280"
                value={amount}
                showSoftInputOnFocus={false}
                editable={!isLoading}
                onFocus={() => { Keyboard.dismiss(); }}
              />

              <View style={styles.feeNotice}>
                {method === 'zelle' ? (
                  <Text style={styles.feeText}>Frais: 0 HTG (Gratuit)</Text>
                ) : (
                  <Text style={styles.feeText}>
                    Frais (5%) : {amount && !isNaN(Number(amount)) ? (Number(amount) * 0.05).toFixed(2) : '0.00'} HTG
                  </Text>
                )}
              </View>

              {/* Custom Numeric Pad */}
              <View style={styles.padContainer}>
                {[
                  ['1', '2', '3'],
                  ['4', '5', '6'],
                  ['7', '8', '9'],
                  ['.', '0', '⌫']
                ].map((row, rowIndex) => (
                  <View key={rowIndex} style={styles.padRow}>
                    {row.map((key) => (
                      <TouchableOpacity
                        key={key}
                        style={styles.padKey}
                        disabled={isLoading}
                        onPress={() => {
                          if (key === '⌫') {
                            setAmount(prev => prev.slice(0, -1));
                          } else {
                            if (key === '.' && amount.includes('.')) return;
                            setAmount(prev => prev + key);
                          }
                        }}
                      >
                        <Text style={styles.padKeyText}>{key}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                ))}
              </View>

              <TouchableOpacity
                onPress={handleWithdraw}
                disabled={isLoading || !amount || !reference}
                style={[
                  styles.withdrawButton,
                  (isLoading || !amount || !reference) ? styles.withdrawButtonDisabled : null
                ]}
              >
                {isLoading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <>
                    <ArrowDownCircle size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
                    <Text style={styles.withdrawButtonText}>Confirmer le retrait</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#050B18' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' },
  backButton: { padding: 8, marginLeft: -8 },
  headerTitle: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold' },
  placeholder: { width: 40 },
  content: { flex: 1, padding: 24 },
  card: { backgroundColor: '#101827', borderRadius: 16, padding: 24, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  label: { color: '#9CA3AF', fontSize: 14, fontWeight: '500', marginBottom: 8, marginTop: 16 },
  methodsContainer: { flexDirection: 'row', gap: 12, marginBottom: 8 },
  methodCard: { flex: 1, backgroundColor: '#050B18', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', borderRadius: 12, padding: 12, alignItems: 'center', position: 'relative' },
  methodCardActive: { borderColor: '#FF7A00', backgroundColor: 'rgba(255, 122, 0, 0.05)' },
  methodIcon: { fontSize: 24, marginBottom: 4 },
  methodName: { color: '#9CA3AF', fontSize: 12, fontWeight: '600' },
  methodNameActive: { color: '#FF7A00' },
  checkIcon: { position: 'absolute', top: 4, right: 4 },
  inputBox: { backgroundColor: '#050B18', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', borderRadius: 12, color: '#FFFFFF', padding: 16, fontSize: 16 },
  amountInput: { backgroundColor: '#050B18', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', borderRadius: 12, color: '#FFFFFF', padding: 16, fontSize: 24, fontWeight: 'bold', textAlign: 'center' },
  feeNotice: { marginTop: 12, marginBottom: 24, alignItems: 'center' },
  feeText: { color: '#6B7280', fontSize: 12 },
  withdrawButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FF7A00', padding: 16, borderRadius: 12 },
  withdrawButtonDisabled: { opacity: 0.5 },
  withdrawButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
  padContainer: { marginTop: 8, marginBottom: 24, gap: 12 },
  padRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  padKey: { flex: 1, backgroundColor: '#050B18', paddingVertical: 16, borderRadius: 12, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  padKeyText: { color: '#FFFFFF', fontSize: 24, fontWeight: 'bold' }
});
