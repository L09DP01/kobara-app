import React, { forwardRef, useCallback, useMemo } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import BottomSheet, { BottomSheetBackdrop } from '@gorhom/bottom-sheet';

interface FilterOption {
  id: string;
  label: string;
}

interface PaymentFilterSheetProps {
  currentFilter: string;
  onSelectFilter: (filterId: string) => void;
  options: FilterOption[];
  title?: string;
}

export const PaymentFilterSheet = forwardRef<BottomSheet, PaymentFilterSheetProps>(
  ({ currentFilter, onSelectFilter, options, title = "Filtrer par statut" }, ref) => {
    // variables
    const snapPoints = useMemo(() => ['40%', '60%'], []);

    // callbacks
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
          <Text className="text-white font-bold text-xl mb-6">{title}</Text>
          
          <View className="flex-col gap-3">
            {options.map((option) => {
              const isSelected = currentFilter === option.id;
              return (
                <TouchableOpacity
                  key={option.id}
                  onPress={() => {
                    onSelectFilter(option.id);
                    if (ref && 'current' in ref && ref.current) {
                      ref.current.close();
                    }
                  }}
                  className={`flex-row items-center justify-between p-4 rounded-xl border ${
                    isSelected ? 'bg-orange-500/10 border-orange-500' : 'bg-white/5 border-transparent'
                  }`}
                >
                  <Text className={`font-medium ${isSelected ? 'text-orange-500' : 'text-slate-300'}`}>
                    {option.label}
                  </Text>
                  {isSelected && (
                    <View className="w-4 h-4 rounded-full bg-orange-500 items-center justify-center">
                      <View className="w-1.5 h-1.5 rounded-full bg-white" />
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </BottomSheet>
    );
  }
);
