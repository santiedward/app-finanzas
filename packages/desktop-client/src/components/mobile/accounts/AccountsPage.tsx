import { forwardRef, useCallback, useRef } from 'react';
import type { ComponentPropsWithoutRef, CSSProperties } from 'react';
import type { DragItem } from 'react-aria';
import {
  DropIndicator,
  ListBox,
  ListBoxItem,
  useDragAndDrop,
} from 'react-aria-components';
import { Trans, useTranslation } from 'react-i18next';

import { Button } from '@actual-app/components/button';
import {
  SvgAdd,
  SvgCheveronDown,
  SvgCheveronRight,
} from '@actual-app/components/icons/v1';
import { styles } from '@actual-app/components/styles';
import { Text } from '@actual-app/components/text';
import { TextOneLine } from '@actual-app/components/text-one-line';
import { theme } from '@actual-app/components/theme';
import { View } from '@actual-app/components/view';
import type { AccountEntity } from '@actual-app/core/types/models';
import { css } from '@emotion/css';

import { useMoveAccountMutation, useSyncAndDownloadMutation } from '#accounts';
import { isAccountFailedSync } from '#accounts/syncStatus';
import { makeAmountFullStyle } from '#components/budget/util';
import { MOBILE_NAV_HEIGHT } from '#components/mobile/MobileNavTabs';
import { PullToRefresh } from '#components/mobile/PullToRefresh';
import { MobileUsageGuide } from '#components/mobile/MobileUsageGuide';
import { MobilePageHeader, Page } from '#components/Page';
import { CellValue, CellValueText } from '#components/spreadsheet/CellValue';
import { useAccounts } from '#hooks/useAccounts';
import { useLocalPref } from '#hooks/useLocalPref';
import { useNavigate } from '#hooks/useNavigate';
import { useSyncedPref } from '#hooks/useSyncedPref';
import { replaceModal } from '#modals/modalsSlice';
import { useDispatch, useSelector } from '#redux';
import type { Binding, SheetFields } from '#spreadsheet';
import * as bindings from '#spreadsheet/bindings';

const ROW_HEIGHT = 60;

type AccountHeaderProps<SheetFieldName extends SheetFields<'account'>> = {
  id: string;
  name: string;
  amount: Binding<'account', SheetFieldName>;
  style?: CSSProperties;
  showCheveronDown?: boolean;
  onPress?: () => void;
};

function AccountHeader<SheetFieldName extends SheetFields<'account'>>({
  id,
  name,
  amount,
  style = {},
  showCheveronDown = false,
  onPress,
}: AccountHeaderProps<SheetFieldName>) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const Cheveron = showCheveronDown ? SvgCheveronDown : SvgCheveronRight;

  return (
    <Button
      variant="bare"
      aria-label={t('View {{name}} transactions', { name })}
      onPress={onPress ? onPress : () => navigate(`/accounts/${id}`)}
      style={{
        minHeight: ROW_HEIGHT,
        width: '100%',
        margin: '12px 10px 8px',
        padding: '12px 14px',
        color: theme.pageText,
        backgroundColor: theme.cardBackground,
        backgroundImage: `linear-gradient(135deg, color-mix(in srgb, ${theme.cardBackground} 82%, ${theme.mobileNavItemSelected}), ${theme.cardBackground} 60%, color-mix(in srgb, ${theme.cardBackground} 93%, ${theme.pageBackgroundBottomRight}))`,
        border: `1px solid ${theme.cardBorder}`,
        borderRadius: 8,
        boxShadow: '0 10px 26px rgba(0, 0, 0, 0.12)',
        ...style,
      }}
      // to match the feel of the other account buttons
      className={css([
        {
          '&[data-pressed], &[data-hovered]': {
            backgroundColor: `color-mix(in srgb, ${theme.mobileNavItemSelected} 10%, transparent)`,
            transform: 'translateY(1px)',
          },
          transition:
            'background-color 160ms ease, transform 160ms ease, box-shadow 160ms ease',
        },
      ])}
    >
      <View style={{ flex: 1, alignItems: 'center', flexDirection: 'row' }}>
        <Text
          style={{
            ...styles.text,
            fontSize: 15,
            fontWeight: 800,
            letterSpacing: 0,
          }}
          data-testid="name"
        >
          {name}
        </Text>
        <Cheveron
          style={{
            flexShrink: 0,
            color: theme.mobileNavItemSelected,
            marginLeft: 5,
          }}
          width={styles.text.fontSize}
          height={styles.text.fontSize}
        />
      </View>
      <CellValue binding={amount} type="financial">
        {props => (
          <CellValueText<'account', SheetFieldName>
            {...props}
            style={{
              ...styles.text,
              fontSize: 17,
              fontWeight: 800,
              color: theme.pageText,
            }}
          />
        )}
      </CellValue>
    </Button>
  );
}

type AccountListItemProps = ComponentPropsWithoutRef<
  typeof ListBoxItem<AccountEntity>
> & {
  isUpdated: boolean;
  isConnected: boolean;
  isPending: boolean;
  isFailed: boolean;
  getBalanceQuery: (
    accountId: AccountEntity['id'],
  ) => Binding<'account', 'balance'>;
  onSelect: (account: AccountEntity) => void;
};

function AccountListItem({
  isUpdated,
  isConnected,
  isPending,
  isFailed,
  getBalanceQuery,
  onSelect,
  ...props
}: AccountListItemProps) {
  const { value: account } = props;

  if (!account) {
    return null;
  }

  return (
    <ListBoxItem
      textValue={account.name}
      className={css({
        borderBottom: `1px solid color-mix(in srgb, ${theme.tableBorder} 70%, transparent)`,
        '&:last-child': {
          borderBottom: 'none',
        },
      })}
      {...props}
    >
      {itemProps => (
        <Button
          {...itemProps}
          style={{
            height: ROW_HEIGHT,
            width: '100%',
            backgroundColor: theme.tableBackground,
            backgroundImage: `linear-gradient(90deg, color-mix(in srgb, ${theme.tableBackground} 94%, ${theme.mobileNavItemSelected}), ${theme.tableBackground})`,
            border: 'none',
            borderRadius: 0,
            padding: '0 12px',
            transition:
              'background-color 150ms ease, transform 150ms ease, filter 150ms ease',
          }}
          data-testid="account-list-item"
          onPress={() => onSelect(account)}
        >
          <View
            style={{
              flex: 1,
              alignItems: 'center',
              flexDirection: 'row',
            }}
          >
            <View
              style={{
                backgroundColor: isPending
                  ? theme.sidebarItemBackgroundPending
                  : isFailed
                    ? theme.sidebarItemBackgroundFailed
                    : theme.sidebarItemBackgroundPositive,
                marginRight: '6px',
                width: 9,
                flexShrink: 0,
                height: 34,
                borderRadius: 999,
                opacity: isConnected ? 1 : 0,
                boxShadow: isConnected
                  ? '0 0 18px rgba(0, 0, 0, 0.18)'
                  : undefined,
              }}
            />
            <TextOneLine
              style={{
                ...styles.text,
                fontSize: 16,
                fontWeight: 700,
                color: isUpdated ? theme.mobileAccountText : theme.pillText,
              }}
              data-testid="account-name"
            >
              {account.name}
            </TextOneLine>
          </View>
          <CellValue binding={getBalanceQuery(account.id)} type="financial">
            {props => (
              <CellValueText<'account', 'balance'>
                {...props}
                style={{
                  fontSize: 16,
                  ...makeAmountFullStyle(props.value, {
                    positiveColor: theme.numberPositive,
                    negativeColor: theme.numberNegative,
                    zeroColor: theme.numberNeutral,
                  }),
                }}
                data-testid="account-balance"
              />
            )}
          </CellValue>
        </Button>
      )}
    </ListBoxItem>
  );
}

function EmptyMessage() {
  return (
    <View style={{ flex: 1, padding: 30 }}>
      <Text style={styles.text}>
        <Trans>
          For Actual to be useful, you need to <strong>add an account</strong>.
          You can link an account to automatically download transactions, or
          manage it locally yourself.
        </Trans>
      </Text>
    </View>
  );
}

type AllAccountListProps = {
  accounts: AccountEntity[];
  getAccountBalance: (
    accountId: AccountEntity['id'],
  ) => Binding<'account', 'balance'>;
  getAllAccountsBalance: () => Binding<'account', 'accounts-balance'>;
  getOnBudgetBalance: () => Binding<'account', 'onbudget-accounts-balance'>;
  getOffBudgetBalance: () => Binding<'account', 'offbudget-accounts-balance'>;
  getClosedAccountsBalance: () => Binding<'account', 'closed-accounts-balance'>;
  onAddAccount: () => void;
  onOpenAccount: (account: AccountEntity) => void;
  onSync: () => Promise<void>;
};

function AllAccountList({
  accounts,
  getAccountBalance,
  getAllAccountsBalance,
  getOnBudgetBalance,
  getOffBudgetBalance,
  getClosedAccountsBalance,
  onAddAccount,
  onOpenAccount,
  onSync,
}: AllAccountListProps) {
  const { t } = useTranslation();
  const onBudgetAccounts = accounts.filter(
    account => account.offbudget === 0 && account.closed === 0,
  );
  const offBudgetAccounts = accounts.filter(
    account => account.offbudget === 1 && account.closed === 0,
  );
  const closedAccounts = accounts.filter(account => account.closed === 1);

  const closedAccountsRef = useRef<HTMLDivElement | null>(null);
  const [showClosedAccounts, setShowClosedAccountsPref] = useLocalPref(
    'ui.showClosedAccounts',
  );

  const onToggleClosedAccounts = () => {
    const toggledState = !showClosedAccounts;
    setShowClosedAccountsPref(toggledState);
    if (toggledState) {
      // Make sure to scroll to the closed accounts when the user presses
      // on the account header, otherwise it's not clear that the accounts are there.
      // Delay the scroll until the component is rendered, otherwise the scroll
      // won't work.
      setTimeout(() => {
        closedAccountsRef.current?.scrollIntoView({ behavior: 'smooth' });
      });
    }
  };

  return (
    <Page
      header={
        <MobilePageHeader
          title={t('Accounts')}
          rightContent={
            <Button
              variant="bare"
              aria-label={t('Add account')}
              style={{ margin: 10 }}
              onPress={onAddAccount}
            >
              <SvgAdd width={20} height={20} />
            </Button>
          }
        />
      }
      padding={0}
    >
      {accounts.length === 0 && <EmptyMessage />}
      <PullToRefresh onRefresh={onSync}>
        <View
          aria-label={t('Account list')}
          style={{ paddingBottom: MOBILE_NAV_HEIGHT }}
        >
          <MobileUsageGuide
            title={t('How to use accounts')}
            items={[
              t('Accounts show where your money lives: cash, bank accounts, cards or closed accounts.'),
              t('Tap an account to review its transactions, balance and recent movement.'),
              t('Pull down to sync or refresh when you want the latest information.'),
            ]}
          />
          <AccountHeader
            id="all"
            name={t('All accounts')}
            amount={getAllAccountsBalance()}
          />
          {onBudgetAccounts.length > 0 && (
            <AccountHeader
              id="onbudget"
              name={t('On budget')}
              amount={getOnBudgetBalance()}
            />
          )}
          <AccountList
            aria-label={t('On budget accounts')}
            accounts={onBudgetAccounts}
            getAccountBalance={getAccountBalance}
            onOpenAccount={onOpenAccount}
          />
          {offBudgetAccounts.length > 0 && (
            <AccountHeader
              id="offbudget"
              name={t('Off budget')}
              amount={getOffBudgetBalance()}
            />
          )}
          <AccountList
            aria-label={t('Off budget accounts')}
            accounts={offBudgetAccounts}
            getAccountBalance={getAccountBalance}
            onOpenAccount={onOpenAccount}
          />
          {closedAccounts.length > 0 && (
            <AccountHeader
              id="closed"
              name={t('Closed')}
              onPress={onToggleClosedAccounts}
              amount={getClosedAccountsBalance()}
              style={{ marginTop: 30 }}
              showCheveronDown={showClosedAccounts}
            />
          )}
          {showClosedAccounts && (
            <AccountList
              aria-label={t('Closed accounts')}
              accounts={closedAccounts}
              getAccountBalance={getAccountBalance}
              onOpenAccount={onOpenAccount}
              ref={el => {
                if (el) closedAccountsRef.current = el;
              }}
            />
          )}
        </View>
      </PullToRefresh>
    </Page>
  );
}

type AccountListProps = {
  'aria-label': string;
  accounts: AccountEntity[];
  getAccountBalance: (
    accountId: AccountEntity['id'],
  ) => Binding<'account', 'balance'>;
  onOpenAccount: (account: AccountEntity) => void;
};

const AccountList = forwardRef<HTMLDivElement, AccountListProps>(
  (
    {
      'aria-label': ariaLabel,
      accounts,
      getAccountBalance: getBalanceBinding,
      onOpenAccount,
    }: AccountListProps,
    ref,
  ) => {
    const syncingAccountIds = useSelector(
      state => state.account.accountsSyncing,
    );
    const updatedAccounts = useSelector(state => state.account.updatedAccounts);

    const moveAccount = useMoveAccountMutation();

    const { dragAndDropHooks } = useDragAndDrop({
      getItems: keys =>
        [...keys].map(
          key =>
            ({
              'text/plain': key as AccountEntity['id'],
            }) as DragItem,
        ),
      renderDropIndicator: target => {
        return (
          <DropIndicator
            target={target}
            className={css({
              '&[data-drop-target]': {
                height: 4,
                backgroundColor: theme.tableBorderSeparator,
                opacity: 1,
                borderRadius: 4,
              },
            })}
          />
        );
      },
      onReorder: e => {
        const [key] = e.keys;
        const accountIdToMove = key as AccountEntity['id'];
        const targetAccountId = e.target.key as AccountEntity['id'];

        if (e.target.dropPosition === 'before') {
          moveAccount.mutate({
            id: accountIdToMove,
            targetId: targetAccountId,
          });
        } else if (e.target.dropPosition === 'after') {
          const targetAccountIndex = accounts.findIndex(
            account => account.id === e.target.key,
          );
          if (targetAccountIndex === -1) {
            throw new Error(
              `Internal error: account with ID ${targetAccountId} not found.`,
            );
          }

          const nextToTargetAccount = accounts[targetAccountIndex + 1];

          moveAccount.mutate({
            id: accountIdToMove,
            // Due to the way `moveAccount` works, we use the account next to the
            // actual target account here because `moveAccount` always shoves the
            // account *before* the target account.
            // On the other hand, using `null` as `targetId`moves the account
            // to the end of the list.
            targetId: nextToTargetAccount?.id || null,
          });
        }
      },
    });
    return (
      <ListBox
        aria-label={ariaLabel}
        items={accounts}
        dependencies={[syncingAccountIds, updatedAccounts]}
        dragAndDropHooks={dragAndDropHooks}
        ref={ref}
        style={{
          display: 'flex',
          flexDirection: 'column',
          margin: '0 8px',
          backgroundColor: theme.tableBackground,
          border: `1px solid ${theme.cardBorder}`,
          borderRadius: 8,
          overflow: 'hidden',
          boxShadow: '0 10px 24px rgba(0, 0, 0, 0.10)',
        }}
      >
        {account => (
          <AccountListItem
            key={account.id}
            id={account.id}
            value={account}
            isUpdated={updatedAccounts && updatedAccounts.includes(account.id)}
            isConnected={!!account.bank}
            isPending={syncingAccountIds.includes(account.id)}
            isFailed={isAccountFailedSync(account)}
            getBalanceQuery={getBalanceBinding}
            onSelect={onOpenAccount}
          />
        )}
      </ListBox>
    );
  },
);

AccountList.displayName = 'AccountList';

export function AccountsPage() {
  const dispatch = useDispatch();
  const { data: accounts = [] } = useAccounts();
  const [_numberFormat] = useSyncedPref('numberFormat');
  const numberFormat = _numberFormat || 'comma-dot';
  const [hideFraction] = useSyncedPref('hideFraction');

  const navigate = useNavigate();

  const onOpenAccount = useCallback(
    (account: AccountEntity) => {
      void navigate(`/accounts/${account.id}`);
    },
    [navigate],
  );

  const onAddAccount = useCallback(() => {
    dispatch(replaceModal({ modal: { name: 'add-account', options: {} } }));
  }, [dispatch]);

  const syncAndDownload = useSyncAndDownloadMutation();
  const onSync = useCallback(async () => {
    syncAndDownload.mutate({});
  }, [syncAndDownload]);

  return (
    <View style={{ flex: 1 }}>
      <AllAccountList
        // This key forces the whole table rerender when the number
        // format changes
        key={numberFormat + hideFraction}
        accounts={accounts}
        getAccountBalance={bindings.accountBalance}
        getAllAccountsBalance={bindings.allAccountBalance}
        getOnBudgetBalance={bindings.onBudgetAccountBalance}
        getOffBudgetBalance={bindings.offBudgetAccountBalance}
        getClosedAccountsBalance={bindings.closedAccountBalance}
        onAddAccount={onAddAccount}
        onOpenAccount={onOpenAccount}
        onSync={onSync}
      />
    </View>
  );
}
