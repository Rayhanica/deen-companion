import type { PropsWithChildren, ReactNode } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useColorScheme,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors, Spacing } from '@/constants/theme';

export function Screen({
  title,
  eyebrow,
  children,
}: PropsWithChildren<{ title: string; eyebrow: string }>) {
  const colors = useScreenColors();
  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.brandHeader}>
          <Image
            accessibilityLabel="Deen Companion"
            source={require('@/assets/brand/icon.png')}
            style={styles.brandMark}
          />
          <View style={styles.brandText}>
            <Text style={[styles.eyebrow, { color: colors.primary }]}>{eyebrow}</Text>
            <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
          </View>
        </View>
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

export function SearchField({
  value,
  onChangeText,
  placeholder = 'Search Quran, hadith, duas, courses, and notes',
}: {
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
}) {
  const colors = useScreenColors();
  return (
    <TextInput
      accessibilityLabel="Global search"
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={colors.textSecondary}
      style={[
        styles.search,
        {
          color: colors.text,
          backgroundColor: colors.backgroundElement,
          borderColor: colors.border,
        },
      ]}
    />
  );
}

export function Panel({
  title,
  body,
  meta,
  action,
  onPress,
  children,
}: PropsWithChildren<{
  title: string;
  body?: string;
  meta?: string;
  action?: string;
  onPress?: () => void;
}>) {
  const colors = useScreenColors();
  const content: ReactNode = (
    <>
      {meta ? <Text style={[styles.meta, { color: colors.accent }]}>{meta}</Text> : null}
      <Text style={[styles.panelTitle, { color: colors.text }]}>{title}</Text>
      {body ? <Text style={[styles.body, { color: colors.textSecondary }]}>{body}</Text> : null}
      {children}
      {action ? <Text style={[styles.action, { color: colors.primary }]}>{action}</Text> : null}
    </>
  );

  if (onPress) {
    return (
      <Pressable
        accessibilityRole="button"
        onPress={onPress}
        style={({ pressed }) => [
          styles.panel,
          {
            backgroundColor: colors.backgroundElement,
            borderColor: colors.border,
            opacity: pressed ? 0.72 : 1,
          },
        ]}>
        {content}
      </Pressable>
    );
  }

  return (
    <View
      style={[
        styles.panel,
        { backgroundColor: colors.backgroundElement, borderColor: colors.border },
      ]}>
      {content}
    </View>
  );
}

export function SectionTitle({ children }: PropsWithChildren) {
  const colors = useScreenColors();
  return <Text style={[styles.sectionTitle, { color: colors.text }]}>{children}</Text>;
}

export function useScreenColors() {
  const scheme = useColorScheme();
  return Colors[scheme === 'dark' ? 'dark' : 'light'];
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: {
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.two,
    paddingBottom: 96,
    gap: Spacing.three,
  },
  eyebrow: {
    textTransform: 'uppercase',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0,
    marginBottom: 6,
  },
  brandHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  brandMark: {
    width: 46,
    height: 46,
    borderRadius: 9,
  },
  brandText: {
    flex: 1,
    minWidth: 0,
  },
  title: { fontSize: 28, lineHeight: 34, fontWeight: '800', letterSpacing: 0 },
  search: {
    minHeight: 48,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 14,
    fontSize: 15,
  },
  panel: {
    borderWidth: 1,
    borderRadius: 8,
    padding: Spacing.three,
    gap: 6,
  },
  meta: { fontSize: 12, fontWeight: '800', textTransform: 'uppercase' },
  panelTitle: { fontSize: 18, lineHeight: 24, fontWeight: '800' },
  body: { fontSize: 14, lineHeight: 21 },
  action: { fontSize: 14, fontWeight: '800', marginTop: 8 },
  sectionTitle: { fontSize: 19, lineHeight: 24, fontWeight: '800', marginTop: 4 },
});
