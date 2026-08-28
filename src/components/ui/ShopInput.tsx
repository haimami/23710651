import React, { memo } from 'react';
import {
  View,
  TextInput,
  TextInputProps,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { Typography } from './Typography';
import { useTheme } from '@contexts/ThemeContext';
import { SIZES, FONTS } from '@constants/theme';

export interface ShopInputProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  error?: string;
  containerStyle?: ViewStyle;
  value: string;
  onChangeText: (text: string) => void;
}

const ShopInputComponent: React.FC<ShopInputProps> = ({
  label,
  error,
  containerStyle,
  value,
  onChangeText,
  placeholder,
  ...props
}) => {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, containerStyle]}>
      {label ? (
        <Typography
          variant="subtitle"
          color={colors.text}
          style={styles.label}
        >
          {label}
        </Typography>
      ) : null}

      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textLight}
        style={[
          styles.input,
          {
            backgroundColor: colors.surface,
            color: colors.text,
            borderColor: error ? colors.error : colors.border,
          },
        ]}
        {...props}
      />

      {error ? (
        <Typography
          variant="caption"
          color={colors.error}
          style={styles.error}
        >
          {error}
        </Typography>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  label: {
    marginBottom: SIZES.xs,
  },
  input: {
    borderWidth: 1.5,
    borderRadius: SIZES.radiusMd,
    paddingHorizontal: SIZES.lg,
    paddingVertical: SIZES.md,
    fontSize: FONTS.body.fontSize,
  },
  error: {
    marginTop: SIZES.xs,
  },
});

export const ShopInput = memo(ShopInputComponent);
