import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput, KeyboardAvoidingView, Platform, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronLeft, Send, Search, User } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { balanceService } from '../../services/balance';
import { useQueryClient } from '@tanstack/react-query';

export default function TransferScreen() {
  const { recipientId } = useLocalSearchParams<{ recipientId: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  
  const [email, setEmail] = useState('');
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [verifiedMerchant, setVerifiedMerchant] = useState<{ id: string, business_name: string, email: string } | null>(null);

  useEffect(() => {
    if (recipientId) {
      const fetchMerchant = async () => {
        setIsLoading(true);
        const result = await balanceService.lookupMerchantById(recipientId);
        setIsLoading(false);
        if (result.success && result.merchant) {
          setVerifiedMerchant(result.merchant);
        } else {
          setError("Ce code QR ne correspond à aucun marchand valide.");
        }
      };
      fetchMerchant();
    }
  }, [recipientId]);

  const handleLookup = async () => {
    if (!email || !email.includes('@')) {
      setError("Veuillez entrer une adresse email valide.");
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    const result = await balanceService.lookupMerchant(email);
    
    setIsLoading(false);
    
    if (result.success && result.merchant) {
      setVerifiedMerchant(result.merchant);
    } else {
      setError(result.error || "Marchand introuvable");
    }
  };

  const handleTransfer = async () => {
    if (!verifiedMerchant) return;
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) return;
    
    setIsLoading(true);
    setError(null);
    
    const result = await balanceService.sendB2BTransfer(verifiedMerchant.id, Number(amount));
    
    setIsLoading(false);
    
    if (result.success) {
      queryClient.invalidateQueries({ queryKey: ['balance'] });
      Alert.alert("Succès", "Transfert effectué avec succès.", [
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
        <Text style={styles.headerTitle}>Nouveau Transfert</Text>
        <View style={styles.placeholder} />
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <View style={styles.content}>
          <View style={styles.card}>
            {error && (
              <View style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', borderColor: 'rgba(239, 68, 68, 0.2)', borderWidth: 1, padding: 12, borderRadius: 12, marginBottom: 16 }}>
                <Text style={{ color: '#F87171', fontSize: 14, textAlign: 'center' }}>{error}</Text>
              </View>
            )}

            {!verifiedMerchant ? (
              <View>
                <Text style={styles.label}>Email du destinataire</Text>
                <View style={styles.emailInputContainer}>
                  <Search size={20} color="#9CA3AF" style={styles.searchIcon} />
                  <TextInput
                    style={styles.emailInput}
                    placeholder="email@marchand.com"
                    placeholderTextColor="#6B7280"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    value={email}
                    onChangeText={setEmail}
                    editable={!isLoading}
                  />
                </View>

                <TouchableOpacity
                  onPress={handleLookup}
                  disabled={isLoading || !email}
                  style={[
                    styles.primaryButton,
                    (isLoading || !email) ? styles.primaryButtonDisabled : null,
                    { marginTop: 16 }
                  ]}
                >
                  {isLoading ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text style={styles.primaryButtonText}>Rechercher le marchand</Text>
                  )}
                </TouchableOpacity>
              </View>
            ) : (
              <View>
                <Text style={styles.label}>Destinataire vérifié</Text>
                <View style={styles.verifiedBox}>
                  <View style={styles.verifiedAvatar}>
                    <User size={20} color="#FF7A00" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.verifiedName}>{verifiedMerchant.business_name}</Text>
                    <Text style={styles.verifiedEmail} numberOfLines={1} ellipsizeMode="middle">
                      {verifiedMerchant.email}
                    </Text>
                  </View>
                  {!recipientId && (
                    <TouchableOpacity onPress={() => setVerifiedMerchant(null)}>
                      <Text style={{ color: '#F87171', fontSize: 12 }}>Changer</Text>
                    </TouchableOpacity>
                  )}
                </View>

                <Text style={styles.label}>Montant (HTG)</Text>
                <TextInput
                  style={styles.amountInput}
                  placeholder="0.00"
                  placeholderTextColor="#6B7280"
                  keyboardType="numeric"
                  value={amount}
                  onChangeText={setAmount}
                  editable={!isLoading}
                />

                <TouchableOpacity
                  onPress={handleTransfer}
                  disabled={isLoading || !amount}
                  style={[
                    styles.primaryButton,
                    (isLoading || !amount) ? styles.primaryButtonDisabled : null,
                    { marginTop: 24 }
                  ]}
                >
                  {isLoading ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <>
                      <Send size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
                      <Text style={styles.primaryButtonText}>Envoyer {amount ? `${amount} HTG` : ''}</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
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
  label: { color: '#9CA3AF', fontSize: 14, fontWeight: '500', marginBottom: 8 },
  emailInputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#050B18', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', borderRadius: 12, paddingHorizontal: 16 },
  searchIcon: { marginRight: 8 },
  emailInput: { flex: 1, color: '#FFFFFF', paddingVertical: 16, fontSize: 16 },
  verifiedBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(34, 197, 94, 0.05)', borderWidth: 1, borderColor: 'rgba(34, 197, 94, 0.2)', padding: 12, borderRadius: 12, marginBottom: 24 },
  verifiedAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255, 122, 0, 0.1)', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  verifiedName: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
  verifiedEmail: { color: '#9CA3AF', fontSize: 12, marginTop: 2 },
  amountInput: { backgroundColor: '#050B18', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', borderRadius: 12, color: '#FFFFFF', padding: 16, fontSize: 24, fontWeight: 'bold', textAlign: 'center' },
  primaryButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FF7A00', padding: 16, borderRadius: 12 },
  primaryButtonDisabled: { opacity: 0.5 },
  primaryButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
});
