import { Injectable } from '@nestjs/common';

export interface WeightedAverageInput {
  currentStock: number;
  currentAverageCost: number;
  incomingQuantity: number;
  incomingUnitCost: number;
}

export interface StockCalculationResult {
  newStock: number;
  newAverageCost: number;
  totalValue: number;
}

@Injectable()
export class StockCalculatorService {
  /**
   * Calculate weighted average cost for inventory valuation
   * Formula: (Current Stock × Current Avg Cost + Incoming Qty × Unit Cost) / (Current Stock + Incoming Qty)
   */
  calculateWeightedAverage(input: WeightedAverageInput): StockCalculationResult {
    const { currentStock, currentAverageCost, incomingQuantity, incomingUnitCost } = input;

    const newStock = currentStock + incomingQuantity;

    if (newStock === 0) {
      return {
        newStock: 0,
        newAverageCost: currentAverageCost,
        totalValue: 0,
      };
    }

    const currentValue = currentStock * currentAverageCost;
    const incomingValue = incomingQuantity * incomingUnitCost;
    const totalValue = currentValue + incomingValue;
    const newAverageCost = totalValue / newStock;

    return {
      newStock,
      newAverageCost: Math.round(newAverageCost * 100) / 100, // Round to 2 decimal places
      totalValue,
    };
  }

  /**
   * Validate stock for issue operations
   */
  validateStockForIssue(
    currentStock: number,
    requestedQuantity: number,
  ): { valid: boolean; error?: string } {
    if (requestedQuantity <= 0) {
      return { valid: false, error: 'Quantity must be greater than zero' };
    }

    if (currentStock < requestedQuantity) {
      return {
        valid: false,
        error: `Insufficient stock. Current: ${currentStock}, Requested: ${requestedQuantity}`,
      };
    }

    return { valid: true };
  }

  /**
   * Calculate stock after issue
   */
  calculateStockAfterIssue(
    currentStock: number,
    issueQuantity: number,
    currentAverageCost: number,
  ): StockCalculationResult {
    const newStock = currentStock - issueQuantity;
    const totalValue = newStock * currentAverageCost;

    return {
      newStock,
      newAverageCost: currentAverageCost, // Average cost doesn't change on issue
      totalValue,
    };
  }

  /**
   * Check if stock is below minimum threshold
   */
  isLowStock(currentStock: number, minStock: number): boolean {
    return currentStock <= minStock;
  }

  /**
   * Calculate inventory turnover rate
   */
  calculateTurnoverRate(
    costOfGoodsSold: number,
    averageInventoryValue: number,
  ): number {
    if (averageInventoryValue === 0) return 0;
    return costOfGoodsSold / averageInventoryValue;
  }

  /**
   * Calculate days of inventory
   */
  calculateDaysOfInventory(
    currentStock: number,
    averageDailyUsage: number,
  ): number {
    if (averageDailyUsage === 0) return Infinity;
    return Math.ceil(currentStock / averageDailyUsage);
  }
}
