import { forwardRef } from 'react';
import type { ComponentProps } from 'react';

import { theme } from './theme';
import { View } from './View';

type CardProps = ComponentProps<typeof View>;

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ children, ...props }, ref) => {
    return (
      <View
        {...props}
        ref={ref}
        style={{
          marginTop: 15,
          marginLeft: 10,
          marginRight: 10,
          borderRadius: 8,
          backgroundColor: theme.cardBackground,
          backgroundImage: `linear-gradient(145deg, color-mix(in srgb, ${theme.cardBackground} 88%, ${theme.mobileNavItemSelected}), ${theme.cardBackground} 48%, color-mix(in srgb, ${theme.cardBackground} 94%, ${theme.pageBackgroundBottomRight}))`,
          border: `1px solid ${theme.cardBorder}`,
          boxShadow:
            '0 1px 2px rgba(16, 20, 32, 0.08), 0 14px 32px rgba(16, 20, 32, 0.14)',
          ...props.style,
        }}
      >
        <View
          style={{
            borderRadius: 8,
            overflow: 'hidden',
          }}
        >
          {children}
        </View>
      </View>
    );
  },
);

Card.displayName = 'Card';
