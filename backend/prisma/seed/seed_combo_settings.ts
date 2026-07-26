import { PrismaClient } from '@prisma/client';

export async function seedComboSettings(prisma: PrismaClient) {
  console.log('Seeding Combo Business Settings...');

  const settings = [
    {
      settingKey: 'ASSOCIATION_HISTORY_MONTHS',
      settingValue: '36',
      dataType: 'INT',
      description: 'Historical period (months) for analyzing transactions to mine association rules',
    },
    {
      settingKey: 'MIN_PAIR_COUNT',
      settingValue: '20',
      dataType: 'INT',
      description: 'Minimum absolute frequency of product pair purchase to consider a valid rule',
    },
    {
      settingKey: 'MIN_SUPPORT',
      settingValue: '0.005',
      dataType: 'FLOAT',
      description: 'Minimum support threshold for FP-growth itemsets',
    },
    {
      settingKey: 'MIN_CONFIDENCE',
      settingValue: '0.30',
      dataType: 'FLOAT',
      description: 'Minimum confidence threshold for antecedent -> consequent associations',
    },
    {
      settingKey: 'MIN_LIFT',
      settingValue: '1.10',
      dataType: 'FLOAT',
      description: 'Minimum lift threshold to guarantee positive item affinity',
    },
    {
      settingKey: 'MIN_RELATIONSHIP_MONTHS',
      settingValue: '6',
      dataType: 'INT',
      description: 'Minimum number of active transaction months for validation stability',
    },
    {
      settingKey: 'MIN_RELATIONSHIP_YEARS',
      settingValue: '2',
      dataType: 'INT',
      description: 'Minimum number of years showing repeating patterns for seasonal affinity stability',
    },
    {
      settingKey: 'LARGE_BASKET_ITEM_LIMIT',
      settingValue: '10',
      dataType: 'INT',
      description: 'Exclude transactions with quantity larger than this to prevent wholesale distortion',
    },
    {
      settingKey: 'MAX_DEFAULT_COMBO_SIZE',
      settingValue: '3',
      dataType: 'INT',
      description: 'Default target product count inside a combo (e.g. Target + 1 Anchor + 1 Supporting)',
    },
    {
      settingKey: 'ABSOLUTE_MAX_COMBO_SIZE',
      settingValue: '4',
      dataType: 'INT',
      description: 'Absolute limit on products in a single discount combo',
    },
    {
      settingKey: 'MIN_CUSTOMER_SAVING_PERCENT',
      settingValue: '3',
      dataType: 'FLOAT',
      description: 'Minimum customer discount incentive percent to attract purchase',
    },
    {
      settingKey: 'GLOBAL_MAX_DISCOUNT_PERCENT',
      settingValue: '25',
      dataType: 'FLOAT',
      description: 'Maximum allowable discount value for any combo combination to preserve brand value',
    },
    {
      settingKey: 'DEFAULT_MINIMUM_MARGIN_PERCENT',
      settingValue: '20',
      dataType: 'FLOAT',
      description: 'Minimum baseline percentage margin expected from combo sales',
    },
    {
      settingKey: 'NEAR_EXPIRY_DAYS',
      settingValue: '45',
      dataType: 'INT',
      description: 'Window threshold (days) under which a batch is classified as Near Expiry',
    },
    {
      settingKey: 'DEAD_STOCK_DAYS',
      settingValue: '90',
      dataType: 'INT',
      description: 'Zero transaction period threshold (days) to classify product stock as dead',
    },
    {
      settingKey: 'SLOW_MOVING_COVERAGE_DAYS',
      settingValue: '60',
      dataType: 'INT',
      description: 'Stock coverage duration threshold (days) to classify product velocity as slow',
    },
    {
      settingKey: 'OVERSTOCK_COVERAGE_DAYS',
      settingValue: '90',
      dataType: 'INT',
      description: 'Stock coverage duration threshold (days) to identify overstock risk',
    },
    {
      settingKey: 'MIN_ANCHOR_STOCK_COVERAGE_DAYS',
      settingValue: '30',
      dataType: 'INT',
      description: 'Minimum stock availability coverage required for anchor product eligibility',
    },
    {
      settingKey: 'PROMOTIONAL_STOCK_BUFFER_PERCENT',
      settingValue: '10',
      dataType: 'FLOAT',
      description: 'Stock buffer percentage reserved to prevent stockouts on anchors during promotion',
    },
    {
      settingKey: 'SUGGESTION_EXPIRY_DAYS',
      settingValue: '14',
      dataType: 'INT',
      description: 'Default validity days for AI recommendations before marked expired',
    },
    {
      settingKey: 'COMBO_EVALUATION_PERIOD_DAYS',
      settingValue: '30',
      dataType: 'INT',
      description: 'Evaluation window (days) to run performance and clearance rate reviews',
    },
  ];

  for (const s of settings) {
    await (prisma as any).comboBusinessSetting.upsert({
      where: { settingKey: s.settingKey },
      update: {
        settingValue: s.settingValue,
        dataType: s.dataType,
        description: s.description,
        isActive: true,
      },
      create: {
        settingKey: s.settingKey,
        settingValue: s.settingValue,
        dataType: s.dataType,
        description: s.description,
        isActive: true,
      },
    });
  }

  console.log(`Successfully seeded ${settings.length} Combo Business Settings.`);
}
