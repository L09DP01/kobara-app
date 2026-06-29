import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft } from 'lucide-react-native';

export default function NatCashWaitingScreen() {
  const { referenceCode, amount } = useLocalSearchParams<{ referenceCode: string, amount: string }>();
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <ChevronLeft size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Retour</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.card}>
          <View style={styles.iconContainer}>
            <Text style={styles.iconText}>NC</Text>
          </View>
          
          <Text style={styles.title}>Paiement NatCash</Text>
          <Text style={styles.subtitle}>
            Pour finaliser votre abonnement ({amount} HTG), veuillez effectuer le transfert NatCash depuis votre téléphone :
          </Text>
          
          <View style={styles.instructionBox}>
            <Text style={styles.instructionText}>
              Utilisez votre application NatCash ou faites <Text style={styles.instructionBold}>*202#</Text> pour faire le transfert.
            </Text>
            <Text style={styles.refLabel}>Code de référence à inclure :</Text>
            <Text style={styles.refCode} selectable={true}>
              {referenceCode}
            </Text>
            <Text style={styles.refFooter}>
              Le transfert sera détecté automatiquement. Ne quittez pas cet écran.
            </Text>
          </View>

          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#F97316" style={{ marginRight: 12 }} />
            <Text style={styles.loadingText}>En attente du transfert SMS...</Text>
          </View>

          <TouchableOpacity 
            onPress={() => router.replace('/(tabs)/profile')}
            style={styles.closeButton}
          >
            <Text style={styles.closeButtonText}>Fermer (J'ai payé)</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0F1C',
  },
  header: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  backButton: {
    width: 40,
    height: 40,
    backgroundColor: '#121A2F',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 18,
    marginLeft: 16,
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  card: {
    backgroundColor: '#121A2F',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  iconContainer: {
    width: 64,
    height: 64,
    backgroundColor: 'rgba(249, 115, 22, 0.15)', // Orange tint for NatCash
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  iconText: {
    color: '#F97316',
    fontWeight: '900',
    fontSize: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    color: '#94A3B8',
    fontSize: 14,
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 20,
  },
  instructionBox: {
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 32,
    width: '100%',
  },
  instructionText: {
    color: '#CBD5E1',
    fontSize: 14,
    marginBottom: 16,
    textAlign: 'center',
    lineHeight: 20,
  },
  instructionBold: {
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  refLabel: {
    color: '#64748B',
    fontSize: 14,
    marginBottom: 8,
    textAlign: 'center',
  },
  refCode: {
    fontSize: 28,
    fontWeight: '900',
    color: '#F97316',
    letterSpacing: 2,
    textAlign: 'center',
  },
  refFooter: {
    color: '#64748B',
    fontSize: 12,
    marginTop: 16,
    textAlign: 'center',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  loadingText: {
    color: '#F97316',
    fontWeight: '500',
  },
  closeButton: {
    width: '100%',
    paddingVertical: 14,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#CBD5E1',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
