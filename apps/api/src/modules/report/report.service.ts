import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export interface StockReportParams {
  asOfDate?: string;
  categoryId?: string;
  page?: number;
  limit?: number;
}

export interface MovementReportParams {
  startDate?: string;
  endDate?: string;
  productId?: string;
  categoryId?: string;
  page?: number;
  limit?: number;
}

@Injectable()
export class ReportService {
  private readonly logger = new Logger(ReportService.name);

  constructor(private readonly prisma: PrismaService) {}

  async getStockReport(
    companyId: string,
    params: StockReportParams = {}
  ): Promise<{
    asOfDate: string;
    generatedAt: string;
    items: Array<{
      productId: string;
      sku: string;
      productName: string;
      categoryName: string | null;
      unitName: string;
      currentStock: number;
      minStock: number;
      averageCost: number;
      totalValue: number;
      stockStatus: 'LOW' | 'NORMAL' | 'HIGH';
    }>;
    summary: {
      totalProducts: number;
      totalValue: number;
      lowStockCount: number;
      outOfStockCount: number;
    };
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    const { asOfDate, categoryId, page = 1, limit = 50 } = params;
    const skip = (page - 1) * limit;

    // Build where clause
    const where = {
      companyId,
      deletedAt: null,
      isActive: true,
      ...(categoryId && { categoryId }),
    };

    // Get products with current stock
    const [products, totalCount] = await Promise.all([
      this.prisma.product.findMany({
        where,
        include: {
          category: true,
          unit: true,
        },
        skip,
        take: limit,
        orderBy: { sku: 'asc' },
      }),
      this.prisma.product.count({ where }),
    ]);

    // Calculate stock status values
    const items = products.map((product) => {
      const currentStock = product.currentStock;
      const minStock = product.minStock;
      const averageCost = Number(product.averageCost) || 0;
      const totalValue = currentStock * averageCost;

      let stockStatus: 'LOW' | 'NORMAL' | 'HIGH';
      if (currentStock === 0) {
        stockStatus = 'LOW';
      } else if (currentStock <= minStock) {
        stockStatus = 'LOW';
      } else if (currentStock > minStock * 2) {
        stockStatus = 'HIGH';
      } else {
        stockStatus = 'NORMAL';
      }

      return {
        productId: product.id,
        sku: product.sku,
        productName: product.name,
        categoryName: product.category?.name || null,
        unitName: product.unit?.name || '',
        currentStock,
        minStock,
        averageCost,
        totalValue,
        stockStatus,
      };
    });

    // Calculate summary
    const summary = {
      totalProducts: totalCount,
      totalValue: items.reduce((sum, item) => sum + item.totalValue, 0),
      lowStockCount: items.filter(item => item.stockStatus === 'LOW').length,
      outOfStockCount: items.filter(item => item.currentStock === 0).length,
    };

    return {
      asOfDate: asOfDate || new Date().toISOString(),
      generatedAt: new Date().toISOString(),
      items,
      summary,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    };
  }

  async getMovementReport(
    companyId: string,
    params: MovementReportParams = {}
  ): Promise<{
    startDate: string;
    endDate: string;
    generatedAt: string;
    items: Array<{
      id: string;
      movementDate: string;
      productName: string;
      sku: string;
      movementType: string;
      quantity: number;
      balanceAfter: number;
      referenceType: string;
      referenceNumber: string;
      unitCost: number;
      totalValue: number;
    }>;
    summary: {
      totalMovements: number;
      totalIn: number;
      totalOut: number;
      netChange: number;
      totalValue: number;
    };
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    const { startDate, endDate, productId, categoryId, page = 1, limit = 50 } = params;
    const skip = (page - 1) * limit;

    // Build where clause for stock movements
    const movementWhere: any = {
      companyId,
      ...(startDate && { createdAt: { gte: new Date(startDate) } }),
      ...(endDate && { createdAt: { lte: new Date(endDate) } }),
      ...(productId && { productId }),
    };

    // Get movements
    const [movements, totalCount] = await Promise.all([
      this.prisma.stockMovement.findMany({
        where: movementWhere,
        include: {
          product: true,
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.stockMovement.count({ where: movementWhere }),
    ]);

    // Filter by category if specified
    let filteredMovements = movements;
    if (categoryId) {
      const productIds = movements
        .map(m => m.productId)
        .filter(Boolean);

      if (productIds.length > 0) {
        const productsInCategory = await this.prisma.product.findMany({
          where: {
            id: { in: productIds },
            categoryId,
          },
          select: { id: true },
        });

        const validProductIds = productsInCategory.map(p => p.id);
        filteredMovements = movements.filter(m => validProductIds.includes(m.productId));
      } else {
        filteredMovements = [];
      }
    }

    // Prepare movement data
    const items = filteredMovements.map((movement) => {
      // Map reference type from Prisma enum to display string
      const referenceTypeMap: Record<string, string> = {
        GOODS_RECEIPT: 'Receipt',
        GOODS_ISSUE: 'Issue',
        STOCK_ADJUSTMENT: 'Adjustment',
      };
      const referenceType = referenceTypeMap[movement.referenceType] || movement.referenceType;
      const referenceNumber = movement.referenceNo || movement.id;
      const unitCost = Number(movement.unitCost) || 0;

      return {
        id: movement.id,
        movementDate: movement.createdAt.toISOString(),
        productName: movement.product?.name || 'Unknown Product',
        sku: movement.product?.sku || '',
        movementType: movement.type,
        quantity: movement.quantity,
        balanceAfter: movement.balanceAfter,
        referenceType,
        referenceNumber,
        unitCost,
        totalValue: movement.quantity * unitCost,
      };
    });

    // Calculate summary
    const totalIn = items.filter(m => m.quantity > 0).reduce((sum, m) => sum + m.quantity, 0);
    const totalOut = Math.abs(items.filter(m => m.quantity < 0).reduce((sum, m) => sum + m.quantity, 0));
    const netChange = totalIn - totalOut;
    const totalValue = items.reduce((sum, m) => sum + m.totalValue, 0);

    return {
      startDate: startDate || new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString(),
      endDate: endDate || new Date().toISOString(),
      generatedAt: new Date().toISOString(),
      items,
      summary: {
        totalMovements: items.length,
        totalIn,
        totalOut,
        netChange,
        totalValue,
      },
      pagination: {
        page,
        limit,
        total: items.length,
        totalPages: Math.ceil(items.length / limit),
      },
    };
  }
}