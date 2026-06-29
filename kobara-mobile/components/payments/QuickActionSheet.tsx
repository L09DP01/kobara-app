import React, { forwardRef, useCallback, useMemo } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import BottomSheet, { BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import { Link2, Receipt, CalendarClock } from 'lucide-react-native';

interface QuickActionSheetProps {
  onActionSelect: (action: string) => void;
}

export const QuickActionSheet = forwardRef<BottomSheet, QuickActionSheetProps>(
  ({ onActionSelect }, ref) => {
    const snapPoints = useMemo(() => ['45%'], []);

    const renderBackdrop = useCallback(
      (props: any) => (
        <BottomSheetBackdrop
          {...props}
          disappearsOnIndex={-1}
          appearsOnIndex={0}
          opacity={0.7}
        />
      ),
      []
    );

    const handlePress = (action: string) => {
      onActionSelect(action);
      if (ref && 'current' in ref && ref.current) {
        ref.current.close();
      }
    };

    return (
      <BottomSheet
        ref={ref}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose
        backdropComponent={renderBackdrop}
        backgroundStyle={{ backgroundColor: '#121A2F' }}
        handleIndicatorStyle={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
      >
        <View className="flex-1 p-6">
          <Text className="text-white font-bold text-xl mb-6">Créer un nouveau</Text>
          
          <View className="flex-col gap-4">
            <TouchableOpacity
              onPress={() => handlePress('link')}
              className="flex-row items-center p-4 rounded-2xl bg-white/5 active:bg-white/10"
            >
              <View className="w-12 h-12 rounded-full bg-orange-500/10 items-center justify-center mr-4">
                <Link2 size={24} color="#F97316" />
              </View>
              <View>
                <Text className="text-white font-semibold text-base mb-1">Lien de paiement</Text>
                <Text className="text-slate-400 text-xs">Créer un lien réutilisable</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => handlePress('subscription')}
              className="flex-row items-center p-4 rounded-2xl bg-white/5 active:bg-white/10"
            >
              <View className="w-12 h-12 rounded-full bg-purple-500/10 items-center justify-center mr-4">
                <CalendarClock size={24} color="#A855F7" />
              </View>
              <View>
                <Text className="text-white font-semibold text-base mb-1">Plan d'abonnement</Text>
                <Text className="text-slate-400 text-xs">Créer un paiement récurrent</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </BottomSheet>
    );
  }
);
