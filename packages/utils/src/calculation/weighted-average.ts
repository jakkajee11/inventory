/**
 * Weighted average cost calculation utilities
 * Used for inventory valuation using the weighted average method
 */

/**
 * Represents a single cost layer for inventory
 */
export interface CostLayer {
  quantity: number;
  unitCost: number;
  totalCost: number;
  date: Date;
  referenceId?: string;
}

/**
 * Result of weighted average calculation
 */
export interface WeightedAverageResult {
  averageCost: number;
  totalQuantity: number;
  totalValue: number;
  layers: CostLayer[];
}

/**
 * Calculate weighted average cost
 * @param layers - Array of cost layers
 * @returns Weighted average calculation result
 */
export function calculateWeightedAverage(layers: CostLayer[]): WeightedAverageResult {
  if (!layers || layers.length === 0) {
    return {
      averageCost: 0,
      totalQuantity: 0,
      totalValue: 0,
      layers: [],
    };
  }
  
  // Filter out zero-quantity layers
  const validLayers = layers.filter(layer => layer.quantity > 0 && layer.unitCost >= 0);
  
  if (validLayers.length === 0) {
    return {
      averageCost: 0,
      totalQuantity: 0,
      totalValue: 0,
      layers: [],
    };
  }
  
  // Calculate totals
  const totalQuantity = validLayers.reduce((sum, layer) => sum + layer.quantity, 0);
  const totalValue = validLayers.reduce((sum, layer) => sum + layer.totalCost, 0);
  
  // Calculate weighted average
  const averageCost = totalQuantity > 0 ? totalValue / totalQuantity : 0;
  
  return {
    averageCost: roundToDecimal(averageCost, 4),
    totalQuantity,
    totalValue: roundToDecimal(totalValue, 2),
    layers: validLayers,
  };
}

/**
 * Add new inventory layer and recalculate weighted average
 * @param currentLayers - Existing cost layers
 * @param newQuantity - Quantity being added
 * @param newUnitCost - Unit cost of new inventory
 * @param referenceId - Optional reference ID for tracking
 * @returns Updated weighted average result
 */
export function addInventoryLayer(
  currentLayers: CostLayer[],
  newQuantity: number,
  newUnitCost: number,
  referenceId?: string
): WeightedAverageResult {
  const newLayer: CostLayer = {
    quantity: newQuantity,
    unitCost: newUnitCost,
    totalCost: newQuantity * newUnitCost,
    date: new Date(),
    referenceId,
  };
  
  const updatedLayers = [...currentLayers, newLayer];
  return calculateWeightedAverage(updatedLayers);
}

/**
 * Remove inventory and calculate cost of goods sold/issued
 * @param currentLayers - Existing cost layers
 * @param removeQuantity - Quantity being removed
 * @returns Object with updated layers and cost of removed inventory
 */
export function removeInventory(
  currentLayers: CostLayer[],
  removeQuantity: number
): {
  updatedLayers: CostLayer[];
  removedCost: number;
  removedQuantity: number;
  remainingQuantity: number;
} {
  // Calculate current totals
  const current = calculateWeightedAverage(currentLayers);
  
  if (removeQuantity <= 0) {
    return {
      updatedLayers: currentLayers,
      removedCost: 0,
      removedQuantity: 0,
      remainingQuantity: current.totalQuantity,
    };
  }
  
  // Cannot remove more than available
  const actualRemovedQuantity = Math.min(removeQuantity, current.totalQuantity);
  
  // Calculate cost using weighted average
  const removedCost = roundToDecimal(actualRemovedQuantity * current.averageCost, 2);
  
  // Update layers proportionally
  const remainingQuantity = current.totalQuantity - actualRemovedQuantity;
  const remainingValue = roundToDecimal(current.totalValue - removedCost, 2);
  
  // Create a single layer representing remaining inventory at weighted average cost
  const updatedLayers: CostLayer[] = remainingQuantity > 0
    ? [{
        quantity: remainingQuantity,
        unitCost: current.averageCost,
        totalCost: remainingValue,
        date: new Date(),
        referenceId: 'weighted-average-consolidation',
      }]
    : [];
  
  return {
    updatedLayers,
    removedCost,
    removedQuantity: actualRemovedQuantity,
    remainingQuantity,
  };
}

/**
 * Adjust inventory quantity and recalculate
 * @param currentLayers - Existing cost layers
 * @param newQuantity - New total quantity
 * @param reason - Reason for adjustment
 * @returns Updated weighted average result with adjustment details
 */
export function adjustInventory(
  currentLayers: CostLayer[],
  newQuantity: number,
  reason?: string
): {
  result: WeightedAverageResult;
  quantityDifference: number;
  valueDifference: number;
} {
  const current = calculateWeightedAverage(currentLayers);
  const quantityDifference = newQuantity - current.totalQuantity;
  
  // Use current average cost for the adjustment
  const valueDifference = roundToDecimal(quantityDifference * current.averageCost, 2);
  
  const updatedLayers: CostLayer[] = newQuantity > 0
    ? [{
        quantity: newQuantity,
        unitCost: current.averageCost,
        totalCost: roundToDecimal(newQuantity * current.averageCost, 2),
        date: new Date(),
        referenceId: `adjustment-${reason || 'manual'}`,
      }]
    : [];
  
  return {
    result: calculateWeightedAverage(updatedLayers),
    quantityDifference,
    valueDifference,
  };
}

/**
 * Calculate inventory value at a specific point in time
 * @param transactions - Array of inventory transactions
 * @param asOfDate - Date to calculate value as of
 * @returns Inventory value result
 */
export function calculateInventoryValueAsOf(
  transactions: Array<{
    type: 'in' | 'out';
    quantity: number;
    unitCost: number;
    date: Date;
  }>,
  asOfDate: Date
): WeightedAverageResult {
  // Filter transactions up to the as-of date
  const relevantTransactions = transactions.filter(t => new Date(t.date) <= asOfDate);
  
  const layers: CostLayer[] = [];
  
  for (const transaction of relevantTransactions) {
    if (transaction.type === 'in') {
      layers.push({
        quantity: transaction.quantity,
        unitCost: transaction.unitCost,
        totalCost: transaction.quantity * transaction.unitCost,
        date: new Date(transaction.date),
      });
    } else {
      // For outbound transactions, we need to reduce existing layers
      let remainingToRemove = transaction.quantity;
      
      for (let i = 0; i < layers.length && remainingToRemove > 0; i++) {
        if (layers[i].quantity > 0) {
          const removeFromLayer = Math.min(layers[i].quantity, remainingToRemove);
          layers[i].quantity -= removeFromLayer;
          layers[i].totalCost = layers[i].quantity * layers[i].unitCost;
          remainingToRemove -= removeFromLayer;
        }
      }
    }
  }
  
  return calculateWeightedAverage(layers);
}

/**
 * Calculate cost variance between two valuations
 * @param oldAverage - Previous average cost
 * @param newAverage - New average cost
 * @param quantity - Quantity affected
 * @returns Variance details
 */
export function calculateCostVariance(
  oldAverage: number,
  newAverage: number,
  quantity: number
): {
  costDifference: number;
  percentageChange: number;
  totalImpact: number;
} {
  const costDifference = roundToDecimal(newAverage - oldAverage, 4);
  const percentageChange = oldAverage !== 0
    ? roundToDecimal((costDifference / oldAverage) * 100, 2)
    : 0;
  const totalImpact = roundToDecimal(costDifference * quantity, 2);
  
  return {
    costDifference,
    percentageChange,
    totalImpact,
  };
}

/**
 * Round to specified decimal places
 * @param value - Value to round
 * @param decimals - Number of decimal places
 * @returns Rounded value
 */
function roundToDecimal(value: number, decimals: number): number {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}

/**
 * Calculate moving average over a period
 * @param values - Array of values with dates
 * @param periodDays - Number of days for moving average
 * @returns Moving average result
 */
export function calculateMovingAverage(
  values: Array<{ date: Date; quantity: number; unitCost: number }>,
  periodDays: number
): {
  averageCost: number;
  periodStart: Date;
  periodEnd: Date;
  dataPoints: number;
} {
  if (values.length === 0) {
    const now = new Date();
    return {
      averageCost: 0,
      periodStart: now,
      periodEnd: now,
      dataPoints: 0,
    };
  }
  
  // Sort by date descending
  const sorted = [...values].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  
  // Calculate period end (most recent date)
  const periodEnd = new Date(sorted[0].date);
  const periodStart = new Date(periodEnd);
  periodStart.setDate(periodStart.getDate() - periodDays);
  
  // Filter values within period
  const periodValues = sorted.filter(v => {
    const date = new Date(v.date);
    return date >= periodStart && date <= periodEnd;
  });
  
  // Calculate weighted average for period
  const layers: CostLayer[] = periodValues.map(v => ({
    quantity: v.quantity,
    unitCost: v.unitCost,
    totalCost: v.quantity * v.unitCost,
    date: new Date(v.date),
  }));
  
  const result = calculateWeightedAverage(layers);
  
  return {
    averageCost: result.averageCost,
    periodStart,
    periodEnd,
    dataPoints: periodValues.length,
  };
}

/**
 * Constants for weighted average calculations
 */
export const WEIGHTED_AVERAGE_CONSTANTS = {
  COST_DECIMAL_PLACES: 4,
  VALUE_DECIMAL_PLACES: 2,
  QUANTITY_DECIMAL_PLACES: 2,
} as const;
