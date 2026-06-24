import { Tabs } from 'expo-router';
import { StyleSheet, Text, useColorScheme } from 'react-native';

import { Colors } from '@/constants/theme';

const icons: Record<string, string> = {
  index: 'H',
  quran: 'Q',
  learn: 'L',
  community: 'C',
  profile: 'P',
};

export default function AppTabs() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'unspecified' ? 'light' : scheme];

  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.backgroundElement,
          borderTopColor: colors.border,
          height: 68,
          paddingTop: 6,
          paddingBottom: 8,
        },
        tabBarLabelStyle: styles.label,
        tabBarIcon: ({ color, focused }) => (
          <Text
            accessibilityElementsHidden
            style={[
              styles.icon,
              {
                color: focused ? colors.backgroundElement : color,
                backgroundColor: focused ? colors.primary : 'transparent',
              },
            ]}>
            {icons[route.name] ?? '•'}
          </Text>
        ),
      })}>
      <Tabs.Screen name="index" options={{ title: 'Home' }} />
      <Tabs.Screen name="quran" options={{ title: 'Quran' }} />
      <Tabs.Screen name="learn" options={{ title: 'Learn' }} />
      <Tabs.Screen name="community" options={{ title: 'Community' }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile' }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  icon: {
    width: 26,
    height: 26,
    borderRadius: 7,
    textAlign: 'center',
    lineHeight: 26,
    fontSize: 15,
    fontWeight: '800',
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
  },
});
