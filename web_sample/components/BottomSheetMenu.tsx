import { theme } from '@/constants/theme';
import BottomSheet, {
    BottomSheetBackdrop,
    BottomSheetBackdropProps,
    BottomSheetScrollView,
} from '@gorhom/bottom-sheet';
import React, { forwardRef, useCallback, useImperativeHandle, useMemo, useRef } from 'react';
import {
    Dimensions,
    StyleSheet,
    Text,
    useColorScheme,
    View
} from 'react-native';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export interface BottomSheetMenuRef {
  expand: () => void;
  collapse: () => void;
  close: () => void;
  snapToIndex: (index: number) => void;
}

interface BottomSheetMenuProps {
  children?: React.ReactNode;
  title?: string;
  initialSnapPoint?: number; // 0 = 60%, 1 = closed
  onClose?: () => void;
  showHandle?: boolean;
  enablePanDownToClose?: boolean;
}

const BottomSheetMenu = forwardRef<BottomSheetMenuRef, BottomSheetMenuProps>(
  (
    {
      children,
      title,
      initialSnapPoint = 0,
      onClose,
      showHandle = true,
      enablePanDownToClose = true,
    },
    ref
  ) => {
    const bottomSheetRef = useRef<BottomSheet>(null);
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    // Snap points: 60% of screen, closed
    const snapPoints = useMemo(() => ['60%', '90%'], []);

    // Expose methods to parent
    useImperativeHandle(ref, () => ({
      expand: () => bottomSheetRef.current?.snapToIndex(1),
      collapse: () => bottomSheetRef.current?.snapToIndex(0),
      close: () => bottomSheetRef.current?.close(),
      snapToIndex: (index: number) => bottomSheetRef.current?.snapToIndex(index),
    }));

    // Backdrop component
    const renderBackdrop = useCallback(
      (props: BottomSheetBackdropProps) => (
        <BottomSheetBackdrop
          {...props}
          disappearsOnIndex={-1}
          appearsOnIndex={0}
          opacity={0.5}
          pressBehavior="close"
        />
      ),
      []
    );

    // Handle component with pill indicator
    const renderHandle = useCallback(() => {
      if (!showHandle) return null;

      return (
        <View style={styles.handleContainer}>
          <View
            style={[
              styles.handleIndicator,
              {
                backgroundColor: isDark
                  ? theme.colors.gray[600]
                  : theme.colors.gray[300],
              },
            ]}
          />
        </View>
      );
    }, [showHandle, isDark]);

    const handleSheetChange = useCallback(
      (index: number) => {
        if (index === -1 && onClose) {
          onClose();
        }
      },
      [onClose]
    );

    return (
      <BottomSheet
        ref={bottomSheetRef}
        index={initialSnapPoint}
        snapPoints={snapPoints}
        onChange={handleSheetChange}
        enablePanDownToClose={enablePanDownToClose}
        backdropComponent={renderBackdrop}
        handleComponent={renderHandle}
        backgroundStyle={[
          styles.background,
          {
            backgroundColor: isDark
              ? theme.colors.card.dark
              : theme.colors.card.light,
          },
        ]}
        style={styles.sheet}
      >
        <BottomSheetScrollView
          style={styles.contentContainer}
          contentContainerStyle={styles.scrollContent}
        >
          {title && (
            <Text
              style={[
                styles.title,
                {
                  color: isDark
                    ? theme.colors.text.dark
                    : theme.colors.text.light,
                },
              ]}
            >
              {title}
            </Text>
          )}
          {children}
        </BottomSheetScrollView>
      </BottomSheet>
    );
  }
);

BottomSheetMenu.displayName = 'BottomSheetMenu';

const styles = StyleSheet.create({
  sheet: {
    zIndex: 100,
  },
  background: {
    borderTopLeftRadius: theme.borderRadius.xl,
    borderTopRightRadius: theme.borderRadius.xl,
    ...theme.shadow.lg,
  },
  handleContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.sm,
  },
  handleIndicator: {
    width: 40,
    height: 4,
    borderRadius: 2,
  },
  contentContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
  },
  title: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
    marginBottom: theme.spacing.md,
    textAlign: 'center',
  },
});

export default BottomSheetMenu;
