import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, Modal, Animated, Dimensions, StyleSheet, TextInput, ActivityIndicator, KeyboardAvoidingView, Platform, Keyboard } from 'react-native';
import { X, Link } from 'lucide-react-native';
import { apiClient } from '@/api/client';
import { useAuthStore } from '@/store/useAuthStore';

interface CreatePaymentLinkSheetProps {
  visible: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const { height } = Dimensions.get('window');

export function CreatePaymentLinkSheet({ visible, onClose, onSuccess }: CreatePaymentLinkSheetProps) {
  const slideAnim = useRef(new Animated.Value(height)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (visible) {
      setError(null);
      Animated.parallel([
        Animated.timing(slideAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
        Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
      ]).start();
    } else {
      Keyboard.dismiss();
      Animated.parallel([
        Animated.timing(slideAnim, { toValue: height, duration: 250, useNativeDriver: true }),
        Animated.timing(fadeAnim, { toValue: 0, duration: 250, useNativeDriver: true }),
      ]).start(() => {
        // Reset state after animation completes
        setTitle('');
        setAmount('');
        setDescription('');
        setIsLoading(false);
        setError(null);
      });
    }
  }, [visible, slideAnim, fadeAnim]);

  const handleCreate = async () => {
    if (!title.trim()) {
      setError("Le titre est requis");
      return;
    }
    if (!amount.trim() || isNaN(Number(amount)) || Number(amount) <= 0) {
      setError("Veuillez entrer un montant valide");
      return;
    }

    Keyboard.dismiss();
    setIsLoading(true);
    setError(null);

    try {
      // POST to /api/mobile/payment-links
      // Wait, is there a mobile endpoint for this? Yes, we will hit /api/mobile/payment-links
      // Let's assume the API exists or we will use the existing web one if needed.
      // We'll use /api/mobile/payment-links as we have done for other mobile endpoints.
      const response = await apiClient.post('/payment-links', {
        title: title.trim(),
        description: description.trim(),
        amount: Number(amount),
        currency: 'HTG'
      });

      if (response.data && response.data.success) {
        onSuccess?.();
        onClose();
      } else {
        setError(response.data?.error || "Une erreur est survenue");
      }
    } catch (err: any) {
      setError(err.response?.data?.error || "Impossible de se connecter au serveur");
    } finally {
      setIsLoading(false);
    }
  };

  if (!visible && fadeAnim._value === 0) return null;

  return (
    <Modal transparent visible={visible} onRequestClose={onClose} animationType="none">
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <View style={styles.overlay}>
          <Animated.View style={[styles.backdrop, { opacity: fadeAnim }]}>
            <TouchableOpacity style={{ flex: 1 }} onPress={onClose} activeOpacity={1} />
          </Animated.View>
          
          <Animated.View style={[styles.sheet, { transform: [{ translateY: slideAnim }] }]}>
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-white text-xl font-bold">Créer un lien</Text>
              <TouchableOpacity onPress={onClose} className="p-2 rounded-full bg-white/5">
                <X size={20} color="#9CA3AF" />
              </TouchableOpacity>
            </View>

            {error && (
              <View className="bg-red-500/10 border border-red-500/20 p-3 rounded-xl mb-4">
                <Text className="text-red-400 text-sm text-center">{error}</Text>
              </View>
            )}

            <View className="mb-4">
              <Text className="text-white text-sm font-medium mb-2">Titre de l'article ou service</Text>
              <TextInput
                style={styles.input}
                placeholder="Ex: T-shirt noir, Consultation..."
                placeholderTextColor="#6B7280"
                value={title}
                onChangeText={setTitle}
                editable={!isLoading}
              />
            </View>

            <View className="mb-4">
              <Text className="text-white text-sm font-medium mb-2">Montant (HTG)</Text>
              <TextInput
                style={styles.input}
                placeholder="0.00"
                placeholderTextColor="#6B7280"
                keyboardType="numeric"
                value={amount}
                onChangeText={setAmount}
                editable={!isLoading}
              />
            </View>

            <View className="mb-6">
              <Text className="text-[#9CA3AF] text-sm font-medium mb-2">Description (Optionnelle)</Text>
              <TextInput
                style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
                placeholder="Détails du produit..."
                placeholderTextColor="#6B7280"
                multiline
                value={description}
                onChangeText={setDescription}
                editable={!isLoading}
              />
            </View>

            <TouchableOpacity
              onPress={handleCreate}
              disabled={isLoading}
              className={`flex-row items-center justify-center p-4 rounded-xl ${
                isLoading ? 'bg-[#FF7A00]/50' : 'bg-[#FF7A00]'
              }`}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <Link size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
                  <Text className="text-white font-bold text-base">Générer le lien</Text>
                </>
              )}
            </TouchableOpacity>
            
          </Animated.View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0, 0, 0, 0.5)' },
  sheet: {
    backgroundColor: '#050B18',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
  },
  input: {
    backgroundColor: '#101827',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    color: '#FFFFFF',
    padding: 14,
    fontSize: 16,
  }
});
