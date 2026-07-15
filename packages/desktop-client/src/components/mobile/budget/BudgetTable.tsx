import React, { useCallback, useMemo } from 'react';
import type { CSSProperties } from 'react';
import { useTranslation } from 'react-i18next';

import { Button } from '@actual-app/components/button';
import { useResponsive } from '@actual-app/components/hooks/useResponsive';
import { SvgCheveronRight } from '@actual-app/components/icons/v1';
import { SvgViewShow } from '@actual-app/components/icons/v2';
import { Label } from '@actual-app/components/label';
import { styles } from '@actual-app/components/styles';
import { Text } from '@actual-app/components/text';
import { theme } from '@actual-app/components/theme';
import { View } from '@actual-app/components/view';
import * as monthUtils from '@actual-app/core/shared/months';
import { q } from '@actual-app/core/shared/query';
import type {
  CategoryEntity,
  CategoryGroupEntity,
} from '@actual-app/core/types/models';
import { AutoTextSize } from 'auto-text-size';

import { MOBILE_NAV_HEIGHT } from '#components/mobile/MobileNavTabs';
import { PullToRefresh } from '#components/mobile/PullToRefresh';
import { PrivacyFilter } from '#components/PrivacyFilter';
import { CellValue } from '#components/spreadsheet/CellValue';
import { SchedulesProvider } from '#hooks/useCachedSchedules';
import { useFormat } from '#hooks/useFormat';
import { useLocalPref } from '#hooks/useLocalPref';
import { useSheetValue } from '#hooks/useSheetValue';
import { useSyncedPref } from '#hooks/useSyncedPref';
import type { Binding } from '#spreadsheet';
import {
  allAccountBalance,
  envelopeBudget,
  trackingBudget,
} from '#spreadsheet/bindings';

import {
  cashFlowTypeLabels,
  getCashFlowTypeCounts,
} from './cashFlowClassification';
import { ExpenseGroupList } from './ExpenseGroupList';
import { IncomeGroup } from './IncomeGroup';

export const ROW_HEIGHT = 50;

export const PILL_STYLE: CSSProperties = {
  borderRadius: 16,
  color: theme.pillText,
  backgroundColor: theme.pillBackgroundLight,
  border: `1px solid ${theme.pillBorder}`,
};

export function getColumnWidth({
  show3Columns = false,
  isSidebar = false,
  offset = 0,
}: {
  show3Columns?: boolean;
  isSidebar?: boolean;
  offset?: number;
} = {}) {
  // If show3Columns = 35vw | 20vw | 20vw | 20vw,
  // Else = 45vw | 25vw | 25vw,
  if (!isSidebar) {
    return show3Columns ? `${19.5 + offset}vw` : `${24 + offset}vw`;
  }
  return show3Columns ? `${31 + offset}vw` : `${42 + offset}vw`;
}

type ToBudgetProps = {
  toBudget: Binding<'envelope-budget', 'to-budget'>;
  onPress: () => void;
  show3Columns: boolean;
};

function ToBudget({ toBudget, onPress, show3Columns }: ToBudgetProps) {
  const { t } = useTranslation();
  const amount = useSheetValue(toBudget) ?? 0;
  const format = useFormat();
  const sidebarColumnWidth = getColumnWidth({ show3Columns, isSidebar: true });

  return (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
        width: sidebarColumnWidth,
      }}
    >
      <Button
        variant="bare"
        onPress={onPress}
        style={{
          width: '100%',
          boxSizing: 'border-box',
          minHeight: 42,
          padding: '4px 5px',
          borderRadius: 14,
          backgroundColor: `color-mix(in srgb, ${theme.toBudgetPositive} 8%, transparent)`,
          overflow: 'hidden',
        }}
      >
        <View style={{ flex: 1, minWidth: 0 }}>
          <View>
            <AutoTextSize
              as={Label}
              minFontSizePx={6}
              maxFontSizePx={12}
              mode="oneline"
              title={amount < 0 ? t('Overbudgeted') : t('To Budget')}
              style={{
                ...(amount < 0 ? styles.smallText : {}),
                color: theme.formInputText,
                flexShrink: 0,
                textAlign: 'left',
              }}
            />
          </View>
          <CellValue binding={toBudget} type="financial">
            {({ type, value }) => (
              <View>
                <PrivacyFilter>
                  <AutoTextSize
                    key={value}
                    as={Text}
                    minFontSizePx={6}
                    maxFontSizePx={11}
                    mode="oneline"
                    style={{
                      ...styles.tnum,
                      fontSize: 13,
                      fontWeight: '800',
                      color:
                        amount < 0
                          ? theme.toBudgetNegative
                          : amount > 0
                            ? theme.toBudgetPositive
                            : theme.budgetNumberNeutral,
                    }}
                  >
                    {format(value, type)}
                  </AutoTextSize>
                </PrivacyFilter>
              </View>
            )}
          </CellValue>
        </View>
        <SvgCheveronRight
          style={{
            flexShrink: 0,
            color: theme.mobileHeaderTextSubdued,
            marginLeft: 5,
          }}
          width={14}
          height={14}
        />
      </Button>
    </View>
  );
}

type SavedProps = {
  projected: boolean;
  onPress: () => void;
  show3Columns: boolean;
};

function Saved({ projected, onPress, show3Columns }: SavedProps) {
  const { t } = useTranslation();
  const binding = projected
    ? trackingBudget.totalBudgetedSaved
    : trackingBudget.totalSaved;

  const saved = useSheetValue<'tracking-budget', typeof binding>(binding) || 0;
  const format = useFormat();
  const isNegative = saved < 0;
  const sidebarColumnWidth = getColumnWidth({ show3Columns, isSidebar: true });

  return (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
        width: sidebarColumnWidth,
      }}
    >
      <Button
        variant="bare"
        onPress={onPress}
        style={{
          width: '100%',
          boxSizing: 'border-box',
          minHeight: 42,
          padding: '4px 5px',
          borderRadius: 14,
          backgroundColor: `color-mix(in srgb, ${theme.mobileNavItemSelected} 9%, transparent)`,
          overflow: 'hidden',
        }}
      >
        <View style={{ alignItems: 'flex-start', flex: 1, minWidth: 0 }}>
          {projected ? (
            <View>
              <AutoTextSize
                as={Label}
                minFontSizePx={6}
                maxFontSizePx={12}
                mode="oneline"
                title={t('Projected savings')}
                style={{
                  color: theme.formInputText,
                  textAlign: 'left',
                  fontSize: 12,
                }}
              />
            </View>
          ) : (
            <Label
              title={isNegative ? t('Overspent') : t('Saved')}
              style={{
                color: theme.formInputText,
                textAlign: 'left',
              }}
            />
          )}

          <CellValue<'tracking-budget', typeof binding>
            binding={binding}
            type="financial"
          >
            {({ type, value }) => (
              <View>
                <PrivacyFilter>
                  <AutoTextSize
                    key={value}
                    as={Text}
                    minFontSizePx={6}
                    maxFontSizePx={11}
                    mode="oneline"
                    style={{
                      ...styles.tnum,
                      textAlign: 'left',
                      fontSize: 13,
                      fontWeight: '800',
                      color: projected
                        ? theme.warningText
                        : isNegative
                          ? theme.errorTextDark
                          : theme.formInputText,
                    }}
                  >
                    {format(value, type)}
                  </AutoTextSize>
                </PrivacyFilter>
              </View>
            )}
          </CellValue>
        </View>
        <SvgCheveronRight
          style={{
            flexShrink: 0,
            color: theme.mobileHeaderTextSubdued,
            marginLeft: 5,
          }}
          width={14}
          height={14}
        />
      </Button>
    </View>
  );
}

type BudgetGroupsProps = {
  type: string;
  categoryGroups: CategoryGroupEntity[];
  onEditCategoryGroup: (id: CategoryGroupEntity['id']) => void;
  onEditCategory: (id: CategoryEntity['id']) => void;
  month: string;
  onBudgetAction: (month: string, action: string, args: unknown) => void;
  showBudgetedColumn: boolean;
  show3Columns: boolean;
  showHiddenCategories: boolean;
};

type CashFlowSummaryProps = {
  categoryGroups: CategoryGroupEntity[];
};

function CashFlowSummary({ categoryGroups }: CashFlowSummaryProps) {
  const format = useFormat();
  const [budgetType = 'envelope'] = useSyncedPref('budgetType');
  const accountBalanceBinding = useMemo(() => allAccountBalance(), []);

  const income =
    useSheetValue<
      'envelope-budget' | 'tracking-budget',
      typeof envelopeBudget.totalIncome | typeof trackingBudget.totalIncome
    >(
      budgetType === 'tracking'
        ? trackingBudget.totalIncome
        : envelopeBudget.totalIncome,
    ) ?? 0;

  const spent =
    useSheetValue<
      'envelope-budget' | 'tracking-budget',
      typeof envelopeBudget.totalSpent | typeof trackingBudget.totalSpent
    >(
      budgetType === 'tracking'
        ? trackingBudget.totalSpent
        : envelopeBudget.totalSpent,
    ) ?? 0;

  const accumulatedBalance =
    useSheetValue<'account', 'accounts-balance'>(accountBalanceBinding) ?? 0;
  const expenseTotal = Math.max(-spent, 0);
  const netCashFlow = income + spent;
  const freeIncomePercent = income > 0 ? Math.round((netCashFlow / income) * 100) : 0;

  const typeCounts = useMemo(() => {
    return getCashFlowTypeCounts(
      categoryGroups.filter(group => !group.is_income && !group.hidden),
    );
  }, [categoryGroups]);

  const metricStyle: CSSProperties = {
    flex: '1 1 0',
    minWidth: 0,
    gap: 2,
  };

  const labelStyle: CSSProperties = {
    color: theme.tableHeaderText,
    fontSize: 10,
    fontWeight: 700,
    textTransform: 'uppercase',
  };

  const amountStyle: CSSProperties = {
    ...styles.tnum,
    color: theme.pageText,
    fontSize: 13,
    fontWeight: 800,
  };

  return (
    <View
      style={{
        margin: '0 8px 8px',
        padding: 12,
        borderRadius: 8,
        border: `1px solid ${theme.cardBorder}`,
        backgroundColor: theme.cardBackground,
        backgroundImage: `linear-gradient(135deg, color-mix(in srgb, ${theme.cardBackground} 82%, ${theme.mobileNavItemSelected}), ${theme.cardBackground} 56%, color-mix(in srgb, ${theme.cardBackground} 94%, ${theme.pageBackgroundBottomRight}))`,
        boxShadow: '0 10px 26px rgba(0, 0, 0, 0.14)',
        gap: 10,
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: 8,
        }}
      >
        <View>
          <Text style={{ fontSize: 13, fontWeight: 800 }}>
            Flujo de caja
          </Text>
          <Text style={{ color: theme.tableHeaderText, fontSize: 11 }}>
            Resumen del mes
          </Text>
        </View>
        <View
          style={{
            borderRadius: 999,
            padding: '4px 9px',
            backgroundColor: `color-mix(in srgb, ${
              freeIncomePercent >= 0 ? theme.numberPositive : theme.numberNegative
            } 14%, transparent)`,
            border: `1px solid color-mix(in srgb, ${
              freeIncomePercent >= 0 ? theme.numberPositive : theme.numberNegative
            } 32%, transparent)`,
          }}
        >
          <Text
            style={{
              ...styles.tnum,
              color:
                freeIncomePercent >= 0
                  ? theme.numberPositive
                  : theme.numberNegative,
              fontSize: 13,
              fontWeight: 800,
            }}
          >
            {freeIncomePercent}% libre
          </Text>
        </View>
      </View>

      <View style={{ flexDirection: 'row', gap: 8 }}>
        <View style={metricStyle}>
          <Text style={labelStyle}>Ingresos</Text>
          <Text style={{ ...amountStyle, color: theme.numberPositive }}>
            {format(income, 'financial')}
          </Text>
        </View>
        <View style={metricStyle}>
          <Text style={labelStyle}>Gastos</Text>
          <Text style={{ ...amountStyle, color: theme.numberNegative }}>
            {format(-expenseTotal, 'financial')}
          </Text>
        </View>
      </View>

      <View style={{ flexDirection: 'row', gap: 8 }}>
        <View style={metricStyle}>
          <Text style={labelStyle}>Flujo neto</Text>
          <Text
            style={{
              ...amountStyle,
              color:
                netCashFlow >= 0 ? theme.numberPositive : theme.numberNegative,
            }}
          >
            {format(netCashFlow, 'financial')}
          </Text>
        </View>
        <View style={metricStyle}>
          <Text style={labelStyle}>Saldo acumulado</Text>
          <Text style={amountStyle}>{format(accumulatedBalance, 'financial')}</Text>
        </View>
      </View>

      <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap' }}>
        {Object.entries(typeCounts).map(([type, count]) => (
          <View
            key={type}
            style={{
              borderRadius: 999,
              padding: '4px 8px',
              backgroundColor: theme.pillBackgroundLight,
              border: `1px solid ${theme.pillBorder}`,
            }}
          >
            <Text style={{ color: theme.pillText, fontSize: 11, fontWeight: 700 }}>
              {cashFlowTypeLabels[type as keyof typeof cashFlowTypeLabels]} ·{' '}
              {count}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function BudgetGroups({
  categoryGroups,
  onEditCategoryGroup,
  onEditCategory,
  month,
  onBudgetAction,
  showBudgetedColumn,
  show3Columns,
  showHiddenCategories,
}: BudgetGroupsProps) {
  const { incomeGroup, expenseGroups } = useMemo(() => {
    const categoryGroupsToDisplay = categoryGroups.filter(
      group => !group.hidden || showHiddenCategories,
    );
    return {
      incomeGroup: categoryGroupsToDisplay.find(group => group.is_income),
      expenseGroups: categoryGroupsToDisplay.filter(group => !group.is_income),
    };
  }, [categoryGroups, showHiddenCategories]);

  const [collapsedGroupIds = [], setCollapsedGroupIdsPref] =
    useLocalPref('budget.collapsed');

  const onToggleCollapse = useCallback(
    (id: CategoryGroupEntity['id']) => {
      setCollapsedGroupIdsPref(
        collapsedGroupIds.includes(id)
          ? collapsedGroupIds.filter(collapsedId => collapsedId !== id)
          : [...collapsedGroupIds, id],
      );
    },
    [collapsedGroupIds, setCollapsedGroupIdsPref],
  );

  const isCollapsed = useCallback(
    (id: CategoryGroupEntity['id']) => {
      return collapsedGroupIds.includes(id);
    },
    [collapsedGroupIds],
  );

  return (
    <View
      data-testid="budget-groups"
      style={{ flex: '1 0 auto', overflowY: 'auto', paddingBottom: 15 }}
    >
      <ExpenseGroupList
        categoryGroups={expenseGroups}
        showBudgetedColumn={showBudgetedColumn}
        month={month}
        onEditCategoryGroup={onEditCategoryGroup}
        onEditCategory={onEditCategory}
        onBudgetAction={onBudgetAction}
        show3Columns={show3Columns}
        showHiddenCategories={showHiddenCategories}
        isCollapsed={isCollapsed}
        onToggleCollapse={onToggleCollapse}
      />

      {incomeGroup && (
        <IncomeGroup
          categoryGroup={incomeGroup}
          month={month}
          showHiddenCategories={showHiddenCategories}
          onEditCategoryGroup={onEditCategoryGroup}
          onEditCategory={onEditCategory}
          onBudgetAction={onBudgetAction}
          isCollapsed={isCollapsed}
          onToggleCollapse={onToggleCollapse}
        />
      )}
    </View>
  );
}

type BudgetTableProps = {
  categoryGroups: CategoryGroupEntity[];
  month: string;
  onShowBudgetSummary: () => void;
  onBudgetAction: (month: string, action: string, args: unknown) => void;
  onRefresh: () => Promise<void>;
  onEditCategoryGroup: (id: CategoryGroupEntity['id']) => void;
  onEditCategory: (id: CategoryEntity['id']) => void;
};

export function BudgetTable({
  categoryGroups,
  month,
  onShowBudgetSummary,
  onBudgetAction,
  onRefresh,
  onEditCategoryGroup,
  onEditCategory,
}: BudgetTableProps) {
  const { width } = useResponsive();
  const show3Columns = width >= 300;

  // let editMode = false; // neuter editMode -- sorry, not rewriting drag-n-drop right now

  const [showSpentColumn = false, setShowSpentColumnPref] = useLocalPref(
    'mobile.showSpentColumn',
  );

  function toggleSpentColumn() {
    setShowSpentColumnPref(!showSpentColumn);
  }

  const [showHiddenCategories = false] = useLocalPref(
    'budget.showHiddenCategories',
  );

  const [budgetType = 'envelope'] = useSyncedPref('budgetType');

  const schedulesQuery = useMemo(() => q('schedules').select('*'), []);

  return (
    <>
      <BudgetTableHeader
        month={month}
        show3Columns={show3Columns}
        showSpentColumn={showSpentColumn}
        toggleSpentColumn={toggleSpentColumn}
        onShowBudgetSummary={onShowBudgetSummary}
      />
      <PullToRefresh onRefresh={onRefresh}>
        <View
          data-testid="budget-table"
          style={{
            backgroundColor: 'transparent',
            minHeight: '100vh',
            paddingBottom: MOBILE_NAV_HEIGHT,
          }}
        >
          <CashFlowSummary categoryGroups={categoryGroups} />
          <SchedulesProvider query={schedulesQuery}>
            <BudgetGroups
              type={budgetType}
              categoryGroups={categoryGroups}
              showBudgetedColumn={!showSpentColumn}
              show3Columns={show3Columns}
              showHiddenCategories={showHiddenCategories}
              month={month}
              onEditCategoryGroup={onEditCategoryGroup}
              onEditCategory={onEditCategory}
              onBudgetAction={onBudgetAction}
            />
          </SchedulesProvider>
        </View>
      </PullToRefresh>
    </>
  );
}

type BudgetTableHeaderProps = {
  show3Columns: boolean;
  month: string;
  onShowBudgetSummary: () => void;
  showSpentColumn: boolean;
  toggleSpentColumn: () => void;
};

function BudgetTableHeader({
  show3Columns,
  month,
  onShowBudgetSummary,
  showSpentColumn,
  toggleSpentColumn,
}: BudgetTableHeaderProps) {
  const { t } = useTranslation();
  const format = useFormat();
  const [budgetType = 'envelope'] = useSyncedPref('budgetType');
  const buttonStyle = {
    padding: 0,
    backgroundColor: 'transparent',
    borderRadius: 'unset',
  };
  const sidebarColumnWidth = getColumnWidth({ show3Columns, isSidebar: true });
  const columnWidth = getColumnWidth({ show3Columns });

  const amountStyle: CSSProperties = {
    ...styles.tnum,
    color: theme.budgetNumberNeutral,
    textAlign: 'right',
    fontSize: 11,
    fontWeight: '700',
  };

  return (
    <View
      data-testid="budget-table-header"
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexShrink: 0,
        minHeight: 66,
        margin: '8px 8px 7px',
        padding: '9px 7px',
        backgroundColor: monthUtils.isCurrentMonth(month)
          ? theme.budgetHeaderCurrentMonth
          : theme.budgetHeaderOtherMonth,
        backgroundImage: `linear-gradient(135deg, color-mix(in srgb, ${
          monthUtils.isCurrentMonth(month)
            ? theme.budgetHeaderCurrentMonth
            : theme.budgetHeaderOtherMonth
        } 78%, ${theme.mobileNavItemSelected}), ${
          monthUtils.isCurrentMonth(month)
            ? theme.budgetHeaderCurrentMonth
            : theme.budgetHeaderOtherMonth
        } 62%, color-mix(in srgb, ${theme.pageBackgroundBottomRight} 20%, ${
          monthUtils.isCurrentMonth(month)
            ? theme.budgetHeaderCurrentMonth
            : theme.budgetHeaderOtherMonth
        }))`,
        border: `1px solid ${theme.cardBorder}`,
        borderRadius: 18,
        boxShadow:
          '0 10px 28px rgba(0, 0, 0, 0.16), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
      }}
    >
      <View
        style={{
          width: sidebarColumnWidth,
          flexDirection: 'row',
          justifyContent: 'flex-start',
          alignItems: 'center',
        }}
      >
        {budgetType === 'tracking' ? (
          <Saved
            projected={month >= monthUtils.currentMonth()}
            onPress={onShowBudgetSummary}
            show3Columns={show3Columns}
          />
        ) : (
          <ToBudget
            toBudget={envelopeBudget.toBudget}
            onPress={onShowBudgetSummary}
            show3Columns={show3Columns}
          />
        )}
      </View>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'flex-end',
          alignItems: 'center',
        }}
      >
        {(show3Columns || !showSpentColumn) && (
          <CellValue<'envelope-budget' | 'tracking-budget', 'total-budgeted'>
            binding={
              budgetType === 'tracking'
                ? trackingBudget.totalBudgetedExpense
                : envelopeBudget.totalBudgeted
            }
            type="financial"
          >
            {({ type: formatType, value }) => (
              <Button
                variant="bare"
                isDisabled={show3Columns}
                onPress={toggleSpentColumn}
                style={{
                  ...buttonStyle,
                  width: columnWidth,
                }}
              >
                <View style={{ flex: 1, alignItems: 'flex-end' }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    {!show3Columns && (
                      <SvgViewShow
                        width={12}
                        height={12}
                        style={{
                          flexShrink: 0,
                          color: theme.pageTextSubdued,
                          marginRight: 5,
                        }}
                      />
                    )}
                    <View>
                      <AutoTextSize
                        as={Label}
                        minFontSizePx={6}
                        maxFontSizePx={9}
                        mode="oneline"
                        title={t('Budgeted')}
                        style={{ color: theme.formInputText, paddingRight: 4 }}
                      />
                    </View>
                  </View>
                  <View>
                    <PrivacyFilter>
                      <AutoTextSize
                        key={value}
                        as={Text}
                        minFontSizePx={6}
                        maxFontSizePx={12}
                        mode="oneline"
                        style={{
                          ...amountStyle,
                          paddingRight: 4,
                        }}
                      >
                        {format(
                          budgetType === 'tracking' ? value : -value,
                          formatType,
                        )}
                      </AutoTextSize>
                    </PrivacyFilter>
                  </View>
                </View>
              </Button>
            )}
          </CellValue>
        )}
        {(show3Columns || showSpentColumn) && (
          <CellValue<'envelope-budget' | 'tracking-budget', 'total-spent'>
            binding={
              budgetType === 'tracking'
                ? trackingBudget.totalSpent
                : envelopeBudget.totalSpent
            }
            type="financial"
          >
            {({ type, value }) => (
              <Button
                variant="bare"
                isDisabled={show3Columns}
                onPress={toggleSpentColumn}
                style={{
                  ...buttonStyle,
                  width: columnWidth,
                }}
              >
                <View style={{ flex: 1, alignItems: 'flex-end' }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    {!show3Columns && (
                      <SvgViewShow
                        width={12}
                        height={12}
                        style={{
                          flexShrink: 0,
                          color: theme.pageTextSubdued,
                          marginRight: 5,
                        }}
                      />
                    )}
                    <View>
                      <AutoTextSize
                        as={Label}
                        minFontSizePx={6}
                        maxFontSizePx={9}
                        mode="oneline"
                        title={t('Spent')}
                        style={{ color: theme.formInputText, paddingRight: 4 }}
                      />
                    </View>
                  </View>
                  <View>
                    <PrivacyFilter>
                      <AutoTextSize
                        key={value}
                        as={Text}
                        minFontSizePx={6}
                        maxFontSizePx={12}
                        mode="oneline"
                        style={{
                          ...amountStyle,
                          paddingRight: 4,
                        }}
                      >
                        {format(value, type)}
                      </AutoTextSize>
                    </PrivacyFilter>
                  </View>
                </View>
              </Button>
            )}
          </CellValue>
        )}
        <CellValue<'envelope-budget' | 'tracking-budget', 'total-leftover'>
          binding={
            budgetType === 'tracking'
              ? trackingBudget.totalLeftover
              : envelopeBudget.totalBalance
          }
          type="financial"
        >
          {({ type, value }) => (
            <View style={{ width: columnWidth }}>
              <View style={{ flex: 1, alignItems: 'flex-end !important' }}>
                <View>
                  <AutoTextSize
                    as={Label}
                    minFontSizePx={6}
                    maxFontSizePx={9}
                    mode="oneline"
                    title={t('Balance')}
                    style={{ color: theme.formInputText }}
                  />
                </View>
                <View>
                  <PrivacyFilter>
                    <AutoTextSize
                      key={value}
                      as={Text}
                      minFontSizePx={6}
                      maxFontSizePx={12}
                      mode="oneline"
                      style={amountStyle}
                    >
                      {format(value, type)}
                    </AutoTextSize>
                  </PrivacyFilter>
                </View>
              </View>
            </View>
          )}
        </CellValue>
      </View>
    </View>
  );
}
