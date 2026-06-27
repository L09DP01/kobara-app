import { View, Text } from 'react-native';

export default function HomeScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-neutral-50">
      <Text className="text-primary text-xl font-bold">Kobara Merchant Home</Text>
      <Text className="text-neutral-500 mt-2">Architecture Workspace Active</Text>
    </View>
  );
}
