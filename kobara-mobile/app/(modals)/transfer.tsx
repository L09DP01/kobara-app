import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput, KeyboardAvoidingView, Platform, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronLeft, Send } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { balanceService } from '../../services/balance';
import { useQueryClient } from '@tanstack/react-query';

export default function TransferScreen() {
  const { recipientId } = useLocalSearchParams<{ recipientId: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleTransfer = async () => {
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) return;
    
    setIsLoading(true);
    setError(null);
    
    const result = await balanceService.sendB2BTransfer(recipientId, Number(amount));
    
    setIsLoading(false);
    
    if (result.success) {
      // Invalidate balance query so it refreshes immediately on return
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
            <Text style={styles.label}>Destinataire (ID)</Text>
            <View style={styles.recipientBox}>
              <Text style={styles.recipientText} numberOfLines={1} ellipsizeMode="middle">
                {recipientId || "Aucun destinataire sélectionné"}
              </Text>
            </View>

            <Text style={styles.label}>Montant (HTG)</Text>
            <TextInput
              style={styles.input}
              placeholder="0.00"
              placeholderTextColor="#6B7280"
              keyboardType="numeric"
              value={amount}
              onChangeText={setAmount}
              editable={!isLoading}
              autoFocus
            />

            <TouchableOpacity
              onPress={handleTransfer}
              disabled={isLoading || !amount || !recipientId}
              style={[
                styles.transferButton,
                (isLoading || !amount || !recipientId) ? styles.transferButtonDisabled : null
              ]}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <Send size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
                  <Text style={styles.transferButtonText}>Transférer</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050B18',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 24,
  },
  card: {
    backgroundColor: '#101827',
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  label: {
    color: '#9CA3AF',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  recipientBox: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  recipientText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'monospace',
  },
  input: {
    backgroundColor: '#050B18',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    color: '#FFFFFF',
    padding: 16,
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 32,
    textAlign: 'center',
  },
  transferButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF7A00',
    padding: 16,
    borderRadius: 12,
  },
  transferButtonDisabled: {
    opacity: 0.5,
  },
  transferButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  }
});
