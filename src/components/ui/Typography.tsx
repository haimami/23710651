import React, { memo } from 'react';
import { Text, TextProps, StyleSheet, TextStyle } from 'react-native';
import { FONTS, FontVariant, COLORS } from '@constants/theme';

export interface TypographyProps extends TextProps {
  variant?: FontVariant;
  color?: string;
  children: React.ReactNode;
  align?: 'auto' | 'left' | 'right' | 'center' | 'justify';
}

const TypographyComponent: React.FC<TypographyProps> = ({
  variant = 'body',
  color,
  style,
  children,
  align,
  numberOfLines,
  ...props
}) => {
  const fontStyle = FONTS[variant] || FONTS.body;

  const dynamicStyle: TextStyle = {
    fontSize: fontStyle.fontSize,
    fontWeight: fontStyle.fontWeight,
    color: color || COLORS.text,
    ...(align ? { textAlign: align } : {}),
  };

  return (
    <Text
      style={[dynamicStyle, style]}
      numberOfLines={numberOfLines}
      {...props}
    >
      {children}
    </Text>
  );
};

export const Typography = memo(TypographyComponent);
