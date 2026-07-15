import React, { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { NavLink, useLocation } from 'react-router';

import { useResponsive } from '@actual-app/components/hooks/useResponsive';
import {
  SvgAdd,
  SvgCog,
  SvgCreditCard,
  SvgDotsHorizontalTriple,
  SvgPiggyBank,
  SvgReports,
  SvgStoreFront,
  SvgTuning,
  SvgWallet,
} from '@actual-app/components/icons/v1';
import { SvgCalendar3 } from '@actual-app/components/icons/v2';
import { Menu } from '@actual-app/components/menu';
import { Popover } from '@actual-app/components/popover';
import { styles } from '@actual-app/components/styles';
import { theme } from '@actual-app/components/theme';
import { View } from '@actual-app/components/view';

import { useNavigate } from '#hooks/useNavigate';
import { useSyncServerStatus } from '#hooks/useSyncServerStatus';

export const MOBILE_NAV_HEIGHT = 64;

export function MobileNavTabs() {
  const { t } = useTranslation();
  const { isNarrowWidth } = useResponsive();
  const navigate = useNavigate();
  const location = useLocation();
  const syncServerStatus = useSyncServerStatus();
  const isUsingServer = syncServerStatus !== 'no-server';

  const [moreOpen, setMoreOpen] = useState(false);
  const moreTriggerRef = useRef(null);

  if (!isNarrowWidth) {
    return null;
  }

  const primaryTabs = [
    { name: t('Budget'), path: '/budget', Icon: SvgWallet },
    { name: t('Accounts'), path: '/accounts', Icon: SvgPiggyBank },
  ];

  const secondaryTabs = [
    { name: t('Reports'), path: '/reports', Icon: SvgReports },
  ];

  const moreItems = [
    {
      name: 'schedules',
      text: t('Schedules'),
      icon: SvgCalendar3,
      path: '/schedules',
    },
    {
      name: 'payees',
      text: t('Payees'),
      icon: SvgStoreFront,
      path: '/payees',
    },
    { name: 'rules', text: t('Rules'), icon: SvgTuning, path: '/rules' },
    ...(isUsingServer
      ? [
          {
            name: 'bank-sync',
            text: t('Bank Sync'),
            icon: SvgCreditCard,
            path: '/bank-sync',
          },
        ]
      : []),
    {
      name: 'settings',
      text: t('Settings'),
      icon: SvgCog,
      path: '/settings',
    },
  ];

  const isMoreActive = moreItems.some(item =>
    location.pathname.startsWith(item.path),
  );

  return (
    <View
      role="navigation"
      style={{
        backgroundColor: theme.mobileNavBackground,
        borderTop: `1px solid ${theme.menuBorder}`,
        ...styles.shadow,
        height: MOBILE_NAV_HEIGHT,
        width: '100%',
        position: 'fixed',
        bottom: 0,
        flexDirection: 'row',
        alignItems: 'stretch',
        zIndex: 100,
      }}
    >
      {primaryTabs.map(tab => (
        <NavTab key={tab.path} {...tab} />
      ))}

      <AddTransactionButton />

      {secondaryTabs.map(tab => (
        <NavTab key={tab.path} {...tab} />
      ))}

      <button
        ref={moreTriggerRef}
        onClick={() => setMoreOpen(true)}
        aria-label={t('More')}
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 2,
          background: 'transparent',
          border: 'none',
          color: isMoreActive
            ? theme.mobileNavItemSelected
            : theme.mobileNavItem,
          fontSize: 11,
        }}
      >
        <SvgDotsHorizontalTriple width={20} height={20} />
        {t('More')}
      </button>

      <Popover
        triggerRef={moreTriggerRef}
        isOpen={moreOpen}
        onOpenChange={() => setMoreOpen(false)}
        placement="top end"
        style={{ width: 200 }}
      >
        <Menu
          items={moreItems}
          onMenuSelect={name => {
            const item = moreItems.find(i => i.name === name);
            setMoreOpen(false);
            if (item) {
              navigate(item.path);
            }
          }}
        />
      </Popover>
    </View>
  );
}

type NavTabProps = {
  name: string;
  path: string;
  Icon: React.ComponentType<{ width: number; height: number }>;
};

function NavTab({ Icon: TabIcon, name, path }: NavTabProps) {
  return (
    <NavLink
      to={path}
      style={({ isActive }) => ({
        ...styles.noTapHighlight,
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
        color: isActive ? theme.mobileNavItemSelected : theme.mobileNavItem,
        textDecoration: 'none',
        fontSize: 11,
        userSelect: 'none',
      })}
    >
      <TabIcon width={20} height={20} />
      {name}
    </NavLink>
  );
}

function AddTransactionButton() {
  const { t } = useTranslation();
  return (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <NavLink
        to="/transactions/new"
        aria-label={t('Add transaction')}
        style={{
          ...styles.noTapHighlight,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 44,
          height: 44,
          borderRadius: 22,
          marginTop: -20,
          backgroundColor: theme.buttonPrimaryBackground,
          color: theme.buttonPrimaryText,
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.25)',
          textDecoration: 'none',
        }}
      >
        <SvgAdd width={20} height={20} />
      </NavLink>
    </View>
  );
}
