import React, { useState } from 'react';
import type { ComponentProps } from 'react';
import { useTranslation } from 'react-i18next';

import { Label } from '@actual-app/components/label';
import { styles } from '@actual-app/components/styles';
import { theme } from '@actual-app/components/theme';
import { View } from '@actual-app/components/view';
import type { IntegerAmount } from '@actual-app/core/shared/util';
import type { TransactionEntity } from '@actual-app/core/types/models';

import { Search } from '#components/common/Search';
import { PullToRefresh } from '#components/mobile/PullToRefresh';
import { CellValue, CellValueText } from '#components/spreadsheet/CellValue';
import { DisplayPayeeProvider } from '#hooks/useDisplayPayee';
import { SelectedProvider, useSelected } from '#hooks/useSelected';
import { useSheetValue } from '#hooks/useSheetValue';
import type { Binding, SheetFields, SheetNames } from '#spreadsheet';

import { TransactionList } from './TransactionList';

type TransactionSearchInputProps = {
  placeholder: string;
  onSearch: TransactionListWithBalancesProps['onSearch'];
};

function TransactionSearchInput({
  placeholder,
  onSearch,
}: TransactionSearchInputProps) {
  const [text, setText] = useState('');

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'transparent',
        padding: '0 10px 10px',
        width: '100%',
      }}
    >
      <Search
        value={text}
        onChange={text => {
          setText(text);
          onSearch(text);
        }}
        placeholder={placeholder}
        width="100%"
        height={styles.mobileMinHeight}
        style={{
          backgroundColor: theme.cardBackground,
          border: `1px solid ${theme.formInputBorder}`,
          borderRadius: 14,
          boxShadow: '0 8px 20px rgba(0, 0, 0, 0.08)',
        }}
      />
    </View>
  );
}

type TransactionListWithBalancesProps = {
  isLoading: boolean;
  transactions: readonly TransactionEntity[];
  balance:
    | Binding<'account', 'onbudget-accounts-balance'>
    | Binding<'account', 'offbudget-accounts-balance'>
    | Binding<'account', 'closed-accounts-balance'>
    | Binding<SheetNames, 'uncategorized-balance'>
    | Binding<'category', 'balance'>
    | Binding<'account', 'balance'>
    | Binding<'account', 'accounts-balance'>;
  balanceCleared?:
    | Binding<'category', 'balanceCleared'>
    | Binding<'account', 'balanceCleared'>;
  balanceUncleared?:
    | Binding<'category', 'balanceUncleared'>
    | Binding<'account', 'balanceUncleared'>;
  showRunningBalances?: boolean;
  runningBalances?: Map<TransactionEntity['id'], IntegerAmount>;
  searchPlaceholder: string;
  onSearch: (searchText: string) => void;
  isLoadingMore: boolean;
  onLoadMore: () => void;
  onOpenTransaction: (transaction: TransactionEntity) => void;
  onRefresh?: () => void;
  showMakeTransfer?: boolean;
};

export function TransactionListWithBalances({
  isLoading,
  transactions,
  balance,
  balanceCleared,
  balanceUncleared,
  showRunningBalances,
  runningBalances,
  searchPlaceholder = 'Search...',
  onSearch,
  isLoadingMore,
  onLoadMore,
  onOpenTransaction,
  onRefresh,
  showMakeTransfer = false,
}: TransactionListWithBalancesProps) {
  const selectedInst = useSelected('transactions', [...transactions], []);

  return (
    <DisplayPayeeProvider transactions={transactions}>
      <SelectedProvider instance={selectedInst}>
        <View
          style={{
            flexShrink: 0,
            margin: '10px 10px 0',
            backgroundColor: theme.cardBackground,
            backgroundImage: `linear-gradient(135deg, color-mix(in srgb, ${theme.cardBackground} 84%, ${theme.mobileNavItemSelected}), ${theme.cardBackground} 56%, color-mix(in srgb, ${theme.cardBackground} 94%, ${theme.pageBackgroundBottomRight}))`,
            border: `1px solid ${theme.cardBorder}`,
            borderRadius: 8,
            boxShadow: '0 12px 28px rgba(0, 0, 0, 0.14)',
            overflow: 'hidden',
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-evenly',
              padding: '12px 10px 10px',
            }}
          >
            {balanceCleared && balanceUncleared ? (
              <BalanceWithCleared
                balance={balance}
                balanceCleared={balanceCleared}
                balanceUncleared={balanceUncleared}
              />
            ) : (
              <Balance balance={balance} />
            )}
          </View>
          <TransactionSearchInput
            placeholder={searchPlaceholder}
            onSearch={onSearch}
          />
        </View>
        <PullToRefresh
          isPullable={!isLoading && !!onRefresh}
          onRefresh={async () => onRefresh?.()}
          style={{
            '& .ptr__children': {
              display: 'flex',
            },
          }}
        >
          <TransactionList
            isLoading={isLoading}
            transactions={transactions}
            showRunningBalances={showRunningBalances}
            runningBalances={runningBalances}
            isLoadingMore={isLoadingMore}
            onLoadMore={onLoadMore}
            onOpenTransaction={onOpenTransaction}
            showMakeTransfer={showMakeTransfer}
          />
        </PullToRefresh>
      </SelectedProvider>
    </DisplayPayeeProvider>
  );
}

const TransactionListBalanceCellValue = <
  FieldName extends SheetFields<'account'> | SheetFields<'category'>,
>(
  props: ComponentProps<
    typeof CellValue<
      FieldName extends SheetFields<'account'> ? 'account' : 'category',
      FieldName
    >
  >,
) => {
  return <CellValue {...props} />;
};

type BalanceWithClearedProps = {
  balanceUncleared: NonNullable<
    TransactionListWithBalancesProps['balanceUncleared']
  >;
  balanceCleared: NonNullable<
    TransactionListWithBalancesProps['balanceCleared']
  >;
  balance: TransactionListWithBalancesProps['balance'];
};

function BalanceWithCleared({
  balanceUncleared,
  balanceCleared,
  balance,
}: BalanceWithClearedProps) {
  const { t } = useTranslation();
  const unclearedAmount = useSheetValue<
    'account' | 'category',
    'balanceUncleared'
  >(balanceUncleared);

  return (
    <>
      <View
        style={{
          display: !unclearedAmount ? 'none' : undefined,
          flexBasis: '33%',
        }}
      >
        <Label
          title={t('Cleared')}
          style={{ textAlign: 'center', fontSize: 12 }}
        />
        <TransactionListBalanceCellValue
          binding={balanceCleared}
          type="financial"
        >
          {props => (
            <CellValueText
              {...props}
              style={{
                fontSize: 12,
                textAlign: 'center',
                fontWeight: '500',
              }}
              data-testid="transactions-balance-cleared"
            />
          )}
        </TransactionListBalanceCellValue>
      </View>
      <Balance balance={balance} />
      <View
        style={{
          display: !unclearedAmount ? 'none' : undefined,
          flexBasis: '33%',
        }}
      >
        <Label
          title={t('Uncleared')}
          style={{ textAlign: 'center', fontSize: 12 }}
        />
        <TransactionListBalanceCellValue
          binding={balanceUncleared}
          type="financial"
        >
          {props => (
            <CellValueText
              {...props}
              style={{
                fontSize: 12,
                textAlign: 'center',
                fontWeight: '500',
              }}
              data-testid="transactions-balance-uncleared"
            />
          )}
        </TransactionListBalanceCellValue>
      </View>
    </>
  );
}

type BalanceProps = {
  balance: TransactionListWithBalancesProps['balance'];
};

function Balance({ balance }: BalanceProps) {
  const { t } = useTranslation();
  return (
    <View style={{ flexBasis: '33%', alignItems: 'center' }}>
      <Label
        title={t('Balance')}
        style={{
          textAlign: 'center',
          color: theme.tableHeaderText,
          fontSize: 11,
          fontWeight: 700,
          textTransform: 'uppercase',
        }}
      />
      <TransactionListBalanceCellValue binding={balance} type="financial">
        {props => (
          <CellValueText
            {...props}
            style={{
              fontSize: 20,
              textAlign: 'center',
              fontWeight: '800',
              color:
                props.value < 0
                  ? theme.numberNegative
                  : props.value > 0
                    ? theme.numberPositive
                    : theme.numberNeutral,
            }}
            data-testid="transactions-balance"
          />
        )}
      </TransactionListBalanceCellValue>
    </View>
  );
}
