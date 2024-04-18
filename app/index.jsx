import { StatusBar } from "expo-status-bar";
import { Text, View } from "react-native";
import {Link} from 'expo-router'

export default function App() {
  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Text className="text-5xl font-pregular">Aora</Text>
      <Link href="/home" className="text-red-800">GO to Home</Link>
      <StatusBar style="auto" />
    </View>
  );
}
