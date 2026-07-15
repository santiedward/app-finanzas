import type {
  CategoryEntity,
  CategoryGroupEntity,
} from '@actual-app/core/types/models';

export type CashFlowCategoryType = 'fixed' | 'variable' | 'savings';

export const cashFlowTypeLabels: Record<CashFlowCategoryType, string> = {
  fixed: 'Fijos',
  variable: 'Variables',
  savings: 'Ahorro',
};

export const cashFlowTypeShortLabels: Record<CashFlowCategoryType, string> = {
  fixed: 'Fijo',
  variable: 'Var',
  savings: 'Ahorro',
};

const fixedKeywords = [
  'arriendo',
  'bills',
  'cell',
  'cuota',
  'deuda',
  'educacion',
  'educación',
  'hipoteca',
  'internet',
  'mortgage',
  'prestamo',
  'préstamo',
  'renta',
  'seguro',
  'servicio',
  'utilities',
  'water',
  'power',
];

const savingsKeywords = [
  'ahorro',
  'emergencia',
  'fondo',
  'inversion',
  'inversión',
  'investment',
  'meta',
  'retiro',
  'savings',
];

function normalize(value: string) {
  return value
    .toLocaleLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

export function classifyCashFlowName(name: string): CashFlowCategoryType {
  const normalizedName = normalize(name);

  if (savingsKeywords.some(keyword => normalizedName.includes(keyword))) {
    return 'savings';
  }

  if (fixedKeywords.some(keyword => normalizedName.includes(keyword))) {
    return 'fixed';
  }

  return 'variable';
}

export function classifyCashFlowGroup(
  group: CategoryGroupEntity,
): CashFlowCategoryType {
  return classifyCashFlowName(group.name);
}

export function getCashFlowTypeCounts(groups: CategoryGroupEntity[]) {
  return groups.reduce<Record<CashFlowCategoryType, number>>(
    (counts, group) => {
      const visibleCategories =
        group.categories?.filter((category: CategoryEntity) => !category.hidden) ??
        [];

      visibleCategories.forEach(category => {
        counts[classifyCashFlowName(category.name)] += 1;
      });

      return counts;
    },
    {
      fixed: 0,
      variable: 0,
      savings: 0,
    },
  );
}
