import React, { useState } from 'react';
import type { ReactNode } from 'react';

import { Button } from '@actual-app/components/button';
import { SvgCheveronDown, SvgCheveronUp } from '@actual-app/components/icons/v1';
import { SvgInformationCircle } from '@actual-app/components/icons/v2';
import { styles } from '@actual-app/components/styles';
import { Text } from '@actual-app/components/text';
import { theme } from '@actual-app/components/theme';
import { View } from '@actual-app/components/view';

type MobileUsageGuideProps = {
  title: ReactNode;
  items: ReactNode[];
};

export function MobileUsageGuide({ title, items }: MobileUsageGuideProps) {
  const [isOpen, setIsOpen] = useState(false);
  const Cheveron = isOpen ? SvgCheveronUp : SvgCheveronDown;

  return (
    <View
      style={{
        margin: '10px 10px 8px',
        borderRadius: 8,
        backgroundColor: theme.cardBackground,
        backgroundImage: `linear-gradient(135deg, color-mix(in srgb, ${theme.cardBackground} 86%, ${theme.mobileNavItemSelected}), ${theme.cardBackground} 62%, color-mix(in srgb, ${theme.cardBackground} 92%, ${theme.pageBackgroundBottomRight}))`,
        border: `1px solid ${theme.cardBorder}`,
        boxShadow: '0 10px 24px rgba(0, 0, 0, 0.10)',
        overflow: 'hidden',
      }}
    >
      <Button
        variant="bare"
        aria-expanded={isOpen}
        aria-label="Instrucciones"
        onPress={() => setIsOpen(value => !value)}
        style={{
          width: '100%',
          minHeight: 44,
          padding: '9px 12px',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          color: theme.pageText,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <View
            style={{
              width: 26,
              height: 26,
              borderRadius: 999,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: `color-mix(in srgb, ${theme.mobileNavItemSelected} 16%, transparent)`,
              flexShrink: 0,
            }}
          >
            <SvgInformationCircle
              width={16}
              height={16}
              style={{ color: theme.mobileNavItemSelected }}
            />
          </View>
          <Text
            style={{
              ...styles.text,
              fontSize: 13,
              fontWeight: 800,
              color: theme.pageText,
            }}
          >
            Instrucciones
          </Text>
        </View>
        <Cheveron
          width={14}
          height={14}
          style={{
            color: theme.mobileNavItemSelected,
            flexShrink: 0,
          }}
        />
      </Button>
      {isOpen && (
        <View
          style={{
            padding: '0 13px 12px',
            gap: 8,
            borderTop: `1px solid color-mix(in srgb, ${theme.cardBorder} 65%, transparent)`,
          }}
        >
          <Text
            style={{
              ...styles.text,
              fontSize: 13,
              fontWeight: 800,
              color: theme.pageText,
              paddingTop: 10,
            }}
          >
            {title}
          </Text>
          <View style={{ gap: 5 }}>
            {items.map((item, index) => (
              <Text
                key={index}
                style={{
                  ...styles.smallText,
                  color: theme.pageTextSubdued,
                  lineHeight: '17px',
                }}
              >
                {item}
              </Text>
            ))}
          </View>
        </View>
      )}
    </View>
  );
}
