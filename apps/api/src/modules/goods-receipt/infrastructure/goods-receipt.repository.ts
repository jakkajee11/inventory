import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { GoodsReceipt, GoodsReceiptItem, ReceiptStatus } from '../domain/entities/goods-receipt.entity';

@Injectable()
export class GoodsReceiptRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string, companyId: string): Promise<GoodsReceipt | null> {
    const receipt = await this.prisma.goodsReceipt.findFirst({
      where: { id, companyId },
      include: {
        items: {
          include: { product: true },
        },
      },
    });
    return receipt ? this.mapToEntity(receipt) : null;
  }

  async findByReceiptNumber(receiptNo: string, companyId: string): Promise<GoodsReceipt | null> {
    const receipt = await this.prisma.goodsReceipt.findFirst({
      where: { receiptNo, companyId },
    });
    return receipt ? this.mapToEntity(receipt) : null;
  }

  async findAll(companyId: string, options?: {
    skip?: number;
    take?: number;
    status?: ReceiptStatus;
    startDate?: Date;
    endDate?: Date;
  }): Promise<{ receipts: GoodsReceipt[]; total: number }> {
    const where = {
      companyId,
      ...(options?.status && { status: options.status }),
      ...(options?.startDate && { createdAt: { gte: options.startDate } }),
      ...(options?.endDate && { createdAt: { lte: options.endDate } }),
    };

    const [receipts, total] = await Promise.all([
      this.prisma.goodsReceipt.findMany({
        where,
        skip: options?.skip,
        take: options?.take,
        include: { items: { include: { product: true } } },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.goodsReceipt.count({ where }),
    ]);

    return {
      receipts: receipts.map((r) => this.mapToEntity(r)),
      total,
    };
  }

  async create(data: Partial<GoodsReceipt>, items: Partial<GoodsReceiptItem>[]): Promise<GoodsReceipt> {
    const receipt = await this.prisma.goodsReceipt.create({
      data: {
        receiptNo: data.receiptNo!,
        supplierName: data.supplierName!,
        supplierPhone: data.supplierPhone,
        supplierEmail: data.supplierEmail,
        receiptDate: data.receiptDate ?? new Date(),
        status: data.status ?? ReceiptStatus.DRAFT,
        notes: data.notes,
        totalAmount: data.totalAmount ?? 0,
        attachments: data.attachments,
        companyId: data.companyId!,
        createdById: data.createdById!,
        items: {
          create: items.map((item) => ({
            productId: item.productId!,
            quantity: item.quantity!,
            unitCost: item.unitCost ?? 0,
            totalCost: item.totalCost ?? (item.quantity! * (item.unitCost ?? 0)),
            notes: item.notes,
          })),
        },
      },
      include: { items: { include: { product: true } } },
    });
    return this.mapToEntity(receipt);
  }

  async update(id: string, data: Partial<GoodsReceipt>): Promise<GoodsReceipt> {
    const receipt = await this.prisma.goodsReceipt.update({
      where: { id },
      data: {
        ...(data.supplierName !== undefined && { supplierName: data.supplierName }),
        ...(data.supplierPhone !== undefined && { supplierPhone: data.supplierPhone }),
        ...(data.supplierEmail !== undefined && { supplierEmail: data.supplierEmail }),
        ...(data.receiptDate !== undefined && { receiptDate: data.receiptDate }),
        ...(data.status !== undefined && { status: data.status }),
        ...(data.notes !== undefined && { notes: data.notes }),
        ...(data.totalAmount !== undefined && { totalAmount: data.totalAmount }),
        ...(data.attachments !== undefined && { attachments: data.attachments }),
        ...(data.approvedById !== undefined && { approvedById: data.approvedById }),
        ...(data.approvedAt !== undefined && { approvedAt: data.approvedAt }),
        ...(data.cancelledById !== undefined && { cancelledById: data.cancelledById }),
        ...(data.cancelledAt !== undefined && { cancelledAt: data.cancelledAt }),
        ...(data.cancellationReason !== undefined && { cancellationReason: data.cancellationReason }),
      },
      include: { items: { include: { product: true } } },
    });
    return this.mapToEntity(receipt);
  }

  async updateItems(receiptId: string, items: Partial<GoodsReceiptItem>[]): Promise<GoodsReceipt> {
    await this.prisma.goodsReceiptItem.deleteMany({ where: { receiptId } });
    
    const receipt = await this.prisma.goodsReceipt.update({
      where: { id: receiptId },
      data: {
        items: {
          create: items.map((item) => ({
            productId: item.productId!,
            quantity: item.quantity!,
            unitCost: item.unitCost ?? 0,
            totalCost: item.totalCost ?? (item.quantity! * (item.unitCost ?? 0)),
            notes: item.notes,
          })),
        },
      },
      include: { items: { include: { product: true } } },
    });
    return this.mapToEntity(receipt);
  }

  async generateReceiptNumber(companyId: string): Promise<string> {
    const year = new Date().getFullYear();
    const prefix = `GR-${year}-`;
    
    const lastReceipt = await this.prisma.goodsReceipt.findFirst({
      where: {
        companyId,
        receiptNo: { startsWith: prefix },
      },
      orderBy: { receiptNo: 'desc' },
    });

    if (!lastReceipt) {
      return `${prefix}00001`;
    }

    const lastNumber = parseInt(lastReceipt.receiptNo.split('-')[2], 10);
    return `${prefix}${String(lastNumber + 1).padStart(5, '0')}`;
  }

  private mapToEntity(receipt: any): GoodsReceipt {
    const entity = new GoodsReceipt();
    entity.id = receipt.id;
    entity.receiptNo = receipt.receiptNo;
    entity.supplierName = receipt.supplierName;
    entity.supplierPhone = receipt.supplierPhone;
    entity.supplierEmail = receipt.supplierEmail;
    entity.receiptDate = receipt.receiptDate;
    entity.status = receipt.status as ReceiptStatus;
    entity.notes = receipt.notes;
    entity.totalAmount = receipt.totalAmount;
    entity.attachments = receipt.attachments;
    entity.companyId = receipt.companyId;
    entity.createdById = receipt.createdById;
    entity.approvedById = receipt.approvedById;
    entity.approvedAt = receipt.approvedAt;
    entity.cancelledById = receipt.cancelledById;
    entity.cancelledAt = receipt.cancelledAt;
    entity.cancellationReason = receipt.cancellationReason;
    entity.createdAt = receipt.createdAt;
    entity.updatedAt = receipt.updatedAt;
    entity.items = receipt.items?.map((item: any) => {
      const itemEntity = new GoodsReceiptItem();
      itemEntity.id = item.id;
      itemEntity.receiptId = item.receiptId;
      itemEntity.productId = item.productId;
      itemEntity.quantity = item.quantity;
      itemEntity.unitCost = item.unitCost;
      itemEntity.totalCost = item.totalCost;
      itemEntity.notes = item.notes;
      itemEntity.product = item.product;
      return itemEntity;
    }) || [];
    return entity;
  }
}
