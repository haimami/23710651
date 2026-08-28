import React, { memo } from 'react';
import {
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { Typography } from './Typography';
import { useTheme } from '@contexts/ThemeContext';
import { SIZES } from '@constants/theme';

export interface ShopButtonProps {
  title: string;
  onPress: () => void;
  isLoading?: boolean;
  disabled?: boolean;
  variant?: 'primary' | 'outline';
  style?: ViewStyle;
}

const ShopButtonComponent: React.FC<ShopButtonProps> = ({
  title,
  onPress,
  isLoading = false,
  disabled = false,
  variant = 'primary',
  style,
}) => {
  const { colors } = useTheme();
  const isButtonDisabled = disabled || isLoading;

  const isOutline = variant === 'outline';

  const buttonBackground = isOutline ? 'transparent' : colors.primary;
  const buttonBorderColor = isOutline ? colors.border : colors.primary;
  const textColor = isOutline ? colors.text : '#FFFFFF';

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      disabled={isButtonDisabled}
      style={[
        styles.button,
        {
          backgroundColor: buttonBackground,
          borderColor: buttonBorderColor,
          opacity: isButtonDisabled ? 0.6 : 1,
        },
        style,
      ]}
    >
      {isLoading ? (
        <ActivityIndicator size="small" color={textColor} />
      ) : (
        <Typography variant="button" color={textColor}>
          {title}
        </Typography>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: SIZES.md,
    paddingHorizontal: SIZES.lg,
    borderRadius: SIZES.radiusMd,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
});

export const ShopButton = memo(ShopButtonComponent);
