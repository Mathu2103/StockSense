import { PrismaClient, Role } from '@prisma/client';

export interface ComboItemInput {
  productId: string;
  batchId?: string | null;
  role: 'TARGET' | 'ANCHOR' | 'SUPPORTING';
  quantity: number;
  normalUnitPrice: number;
  costPrice: number;
  allocatedDiscount: number;
  effectivePrice: number;
}

export interface ComboDraftInput {
  name: string;
  comboCode: string;
  description?: string;
  comboType: string;
  comboPrice: number;
  startDate: Date;
  endDate: Date;
  createdByInventoryManagerId: string;
  adminOverride?: boolean;
  items: ComboItemInput[];
}

export class ComboValidationService {
  /**
   * Validates a Combo Draft against all configured business constraints.
   */
  static async validateComboDraft(prisma: PrismaClient, draft: ComboDraftInput): Promise<{ isValid: boolean; errors: string[] }> {
    const errors: string[] = [];

    // 1. Load active settings
    const settings = await (prisma as any).comboBusinessSetting.findMany({ where: { isActive: true } });
    const settingsMap = new Map<string, string>(
      settings.map((s: any) => [s.settingKey, s.settingValue] as [string, string])
    );

    const minMarginPct = parseFloat(settingsMap.get('DEFAULT_MINIMUM_MARGIN_PERCENT') || '20') / 100.0;
    const globalMaxDiscount = parseFloat(settingsMap.get('GLOBAL_MAX_DISCOUNT_PERCENT') || '25') / 100.0;

    // 2. Validate basic fields
    if (draft.items.length < 2) {
      errors.push('A combo must contain at least 2 products (1 target and 1 anchor).');
    }

    // 3. Check for duplicates and target/anchor similarity
    const productSkus = draft.items.map(i => i.productId);
    const uniqueSkus = new Set(productSkus);
    if (uniqueSkus.size !== productSkus.length) {
      errors.push('Duplicate products cannot appear in the same combo.');
    }

    const hasTarget = draft.items.some(i => i.role === 'TARGET');
    const hasAnchor = draft.items.some(i => i.role === 'ANCHOR');
    if (!hasTarget || !hasAnchor) {
      errors.push('A combo must designate at least one TARGET and one ANCHOR product.');
    }

    // 4. Validate quantity and status of products
    const products = await prisma.product.findMany({
      where: { sku: { in: productSkus } },
    });

    const productsMap = new Map(products.map(p => [p.sku, p]));

    for (const item of draft.items) {
      if (item.quantity <= 0) {
        errors.push(`Product quantity for ${item.productId} must be greater than zero.`);
      }

      const dbProduct = productsMap.get(item.productId);
      if (!dbProduct) {
        errors.push(`Product with SKU ${item.productId} does not exist.`);
        continue;
      }

      if (dbProduct.status !== 'ACTIVE') {
        errors.push(`Inactive, discontinued or expired product ${dbProduct.name} (${dbProduct.sku}) cannot be added.`);
      }

      // Check product expiry against current date
      if (dbProduct.expiryDate && new Date(dbProduct.expiryDate) < new Date()) {
        errors.push(`Expired product ${dbProduct.name} cannot be included in a combo.`);
      }

      // Near-expiry check: Combo end date must be before product expiry date
      if (dbProduct.expiryDate && draft.endDate && !isNaN(new Date(draft.endDate).getTime())) {
        const endDateObj = new Date(draft.endDate);
        const expDateObj = new Date(dbProduct.expiryDate);
        if (endDateObj >= expDateObj) {
          errors.push(`Combo end date (${endDateObj.toISOString().split('T')[0]}) must be before the expiry date of product ${dbProduct.name} (${expDateObj.toISOString().split('T')[0]}).`);
        }
      }
    }

    // 5. Substitute Check
    if (productSkus.length >= 2) {
      const substitutes = await (prisma as any).productSubstituteRelation.findMany({
        where: {
          productId: { in: productSkus },
          substituteProductId: { in: productSkus },
          status: 'CONFIRMED',
        },
      });

      if (substitutes.length > 0 && !draft.adminOverride) {
        errors.push(
          `Substitute products (${substitutes[0].productId} and ${substitutes[0].substituteProductId}) cannot be used as complementary items in the same combo unless an Admin override is recorded.`
        );
      }
    }

    // 6. Pricing & Margin Calculations
    let normalTotalPrice = 0;
    let totalCost = 0;

    for (const item of draft.items) {
      normalTotalPrice += item.normalUnitPrice * item.quantity;
      totalCost += item.costPrice * item.quantity;
    }

    // minSafePrice = cost / (1 - minMarginPercent)
    const minSafePrice = totalCost / (1 - minMarginPct);
    const discountAmount = normalTotalPrice - draft.comboPrice;
    const discountPercent = discountAmount / normalTotalPrice;

    // Hard error: Price below or equal to cost (Negative profit / loss)
    if (draft.comboPrice <= totalCost) {
      errors.push(`Combo price (${draft.comboPrice}) cannot be less than or equal to total cost (${totalCost.toFixed(2)}). Negative profit detected.`);
    }

    if (draft.comboPrice >= normalTotalPrice) {
      errors.push(`Combo price (${draft.comboPrice}) must be less than the normal total price (${normalTotalPrice}).`);
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Enforces rules around combo state changes and writes the changes to ComboApprovalHistory.
   */
  static async transitionComboStatus(
    prisma: PrismaClient,
    comboId: string,
    newStatus: string,
    userId: string,
    userRole: Role,
    comment?: string
  ): Promise<{ success: boolean; error?: string }> {
    // 1. Fetch current combo
    const combo = await (prisma as any).combo.findUnique({
      where: { id: comboId },
      include: { items: true },
    });

    if (!combo) {
      return { success: false, error: 'Combo not found.' };
    }

    const previousStatus = combo.status;

    if (previousStatus === newStatus) {
      return { success: true }; // No change needed
    }

    // 2. Validate State Transitions
    // Rules:
    // - Only APPROVED combos can become ACTIVE/SCHEDULED.
    // - Only Admin can Approve or Reject.
    // - Only Inventory Manager (or Admin) can create and submit.
    if (newStatus === 'APPROVED' || newStatus === 'REJECTED' || newStatus === 'CHANGES_REQUESTED') {
      if (userRole !== Role.ADMIN) {
        return { success: false, error: 'Only administrators are permitted to approve, reject, or request changes on combos.' };
      }
    }

    if (newStatus === 'PENDING_APPROVAL') {
      if (previousStatus !== 'DRAFT' && previousStatus !== 'CHANGES_REQUESTED') {
        return { success: false, error: 'Only drafts or combos with requested changes can be submitted for approval.' };
      }
    }

    if (newStatus === 'ACTIVE') {
      if (previousStatus !== 'APPROVED' && previousStatus !== 'SCHEDULED' && previousStatus !== 'PAUSED') {
        return { success: false, error: 'Only approved, scheduled, or paused combos can be activated.' };
      }
      
      // Enforce: Date bounds check
      const now = new Date();
      if (combo.endDate < now) {
        return { success: false, error: 'Cannot activate an expired combo.' };
      }
    }

    // 3. Perform the transition in database
    await (prisma as any).$transaction(async (tx: any) => {
      // If activating, lock stock/reserve stock
      if (newStatus === 'ACTIVE' && previousStatus !== 'ACTIVE') {
        const promoCap = Math.max(1, combo.maximumQuantity || 1);
        for (const item of combo.items) {
          const product = await tx.product.findUnique({ where: { sku: item.productId } });
          if (!product || product.currentStock < item.quantity) {
            throw new Error(`Insufficient stock for product ${item.productId} to activate the combo.`);
          }
          
          const totalPromoUnits = item.quantity * promoCap;
          const safeReserve = Math.min(product.currentStock, totalPromoUnits);
          await tx.comboItem.update({
            where: { id: item.id },
            data: { stockReserved: safeReserve },
          });
        }
      }

      // Update combo status
      await tx.combo.update({
        where: { id: comboId },
        data: {
          status: newStatus,
          approvedByAdminId: (newStatus === 'APPROVED' && userRole === Role.ADMIN) ? userId : combo.approvedByAdminId,
          approvedAt: (newStatus === 'APPROVED' && userRole === Role.ADMIN) ? new Date() : combo.approvedAt,
          rejectionReason: newStatus === 'REJECTED' ? comment : null,
          requestChangeMessage: newStatus === 'CHANGES_REQUESTED' ? comment : null,
          submittedAt: newStatus === 'PENDING_APPROVAL' ? new Date() : combo.submittedAt,
        },
      });

      if (newStatus === 'PENDING_APPROVAL') {
        await tx.notification.create({
          data: {
            type: 'STOCK_VELOCITY',
            severity: 'WARNING',
            title: `Combo Approval Needed — ${combo.name} (${combo.comboCode})`,
            message: `Combo campaign "${combo.name}" (Price: Rs. ${combo.comboPrice}) has been submitted and is pending admin approval.`,
            suggestedAction: 'Review Combo Approval',
            targetRole: Role.ADMIN,
            metadata: { comboId: combo.id, comboCode: combo.comboCode, type: 'COMBO_APPROVAL' }
          }
        });
      }

      if (newStatus === 'APPROVED' || newStatus === 'REJECTED' || newStatus === 'CHANGES_REQUESTED') {
        await tx.notification.deleteMany({
          where: {
            title: { contains: combo.comboCode }
          }
        });
      }

      // Automatically update related target product opportunities to CONVERTED when approved or activated
      if (newStatus === 'APPROVED' || newStatus === 'ACTIVE') {
        const productSkus = combo.items.map((i: any) => i.productId);
        if (productSkus.length > 0) {
          await tx.comboOpportunity.updateMany({
            where: {
              targetProductId: { in: productSkus },
              opportunityStatus: { in: ['DETECTED', 'NEW'] }
            },
            data: {
              opportunityStatus: 'CONVERTED'
            }
          });
        }
      }

      // Record in ComboApprovalHistory
      await tx.comboApprovalHistory.create({
        data: {
          comboId,
          action: newStatus,
          previousStatus,
          newStatus,
          performedBy: userId,
          performedByRole: userRole,
          comment,
        },
      });
    });

    return { success: true };
  }
}
