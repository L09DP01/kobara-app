import React, { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  withSequence,
  interpolateColor,
} from 'react-native-reanimated';

export function SkeletonLoader({ className = '' }: { className?: string }) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1000 }),
        withTiming(0, { duration: 1000 })
      ),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    const backgroundColor = interpolateColor(
      progress.value,
      [0, 1],
      ['rgba(255, 255, 255, 0.05)', 'rgba(255, 255, 255, 0.1)']
    );
    return { backgroundColor };
  });

  return (
    <Animated.View className={`rounded-xl ${className}`} style={[animatedStyle]} />
  );
}

export function TransactionSkeleton() {
  return (
    <View className="flex-row items-center justify-between p-4 mb-2 bg-[#121A2F] rounded-2xl mx-4">
      <View className="flex-row items-center gap-3">
        <SkeletonLoader className="w-12 h-12 rounded-full" />
        <View className="gap-2">
          <SkeletonLoader className="w-32 h-4" />
          <SkeletonLoader className="w-24 h-3" />
        </View>
      </View>
      <View className="items-end gap-2">
        <SkeletonLoader className="w-20 h-4" />
        <SkeletonLoader className="w-16 h-6 rounded-md" />
      </View>
    </View>
  );
}
