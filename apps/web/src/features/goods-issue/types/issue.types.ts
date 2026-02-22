export type IssueStatus = 'DRAFT' | 'PENDING' | 'APPROVED' | 'CANCELLED';
export type IssueType = 'SALE' | 'INTERNAL_USE' | 'DAMAGED' | 'LOST' | 'RETURN_TO_SUPPLIER' | 'OTHER';

export interface GoodsIssueItem {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
  notes?: string;
}

export interface GoodsIssue {
  id: string;
  issueNumber: string;
  issueType: IssueType;
  warehouseId: string;
  warehouseName?: string;
  status: IssueStatus;
  notes?: string;
  items: GoodsIssueItem[];
  totalAmount: number;
  createdBy: string;
  approvedBy?: string;
  approvedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateIssueItemDto {
  productId: string;
  quantity: number;
  notes?: string;
}

export interface CreateIssueDto {
  issueType: IssueType;
  warehouseId: string;
  notes?: string;
  items: CreateIssueItemDto[];
}

export interface IssueListResponse {
  issues: GoodsIssue[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
