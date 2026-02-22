import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { GoodsReceiptRepository } from './infrastructure/goods-receipt.repository';
import { GoodsReceipt, ReceiptStatus } from './domain/entities/goods-receipt.entity';
import { CreateGoodsReceiptDto, UpdateGoodsReceiptDto, GoodsReceiptQueryDto } from './application/dtos/goods-receipt.dto';

@Injectable()
export class GoodsReceiptService {
  constructor(private readonly receiptRepository: GoodsReceiptRepository) {}

  async create(companyId: string, userId: string, dto: CreateGoodsReceiptDto): Promise<GoodsReceipt> {
    const receiptNo = await this.receiptRepository.generateReceiptNumber(companyId);
    
    const totalAmount = dto.items.reduce((sum, item) => sum + (item.quantity * item.unitCost), 0);
    
    const items = dto.items.map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
      unitCost: item.unitCost,
      totalCost: item.quantity * item.unitCost,
      notes: item.notes,
    }));

    return this.receiptRepository.create({
      receiptNo,
      supplierName: dto.supplierName,
      supplierPhone: dto.supplierPhone,
      supplierEmail: dto.supplierEmail,
      receiptDate: dto.receiptDate ?? new Date(),
      notes: dto.notes,
      totalAmount,
      status: ReceiptStatus.DRAFT,
      companyId,
      createdById: userId,
    }, items);
  }

  async findById(id: string, companyId: string): Promise<GoodsReceipt> {
    const receipt = await this.receiptRepository.findById(id, companyId);
    if (!receipt) {
      throw new NotFoundException('Goods receipt not found');
    }
    return receipt;
  }

  async findAll(companyId: string, query: GoodsReceiptQueryDto) {
    const page = query.page || 1;
    const limit = Math.min(query.limit || 20, 100);
    const skip = (page - 1) * limit;

    const { receipts, total } = await this.receiptRepository.findAll(companyId, {
      skip,
      take: limit,
      status: query.status,
      startDate: query.startDate,
      endDate: query.endDate,
    });

    return {
      receipts,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async update(id: string, companyId: string, dto: UpdateGoodsReceiptDto): Promise<GoodsReceipt> {
    const receipt = await this.findById(id, companyId);

    if (receipt.status !== ReceiptStatus.DRAFT) {
      throw new BadRequestException('Can only update draft receipts');
    }

    if (dto.items && dto.items.length > 0) {
      const totalAmount = dto.items.reduce((sum, item) => sum + (item.quantity * item.unitCost), 0);
      
      const items = dto.items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        unitCost: item.unitCost,
        totalCost: item.quantity * item.unitCost,
        notes: item.notes,
      }));

      const updated = await this.receiptRepository.updateItems(id, items);
      return this.receiptRepository.update(id, {
        supplierName: dto.supplierName,
        supplierPhone: dto.supplierPhone,
        supplierEmail: dto.supplierEmail,
        notes: dto.notes,
        totalAmount,
      });
    }

    return this.receiptRepository.update(id, {
      supplierName: dto.supplierName,
      supplierPhone: dto.supplierPhone,
      supplierEmail: dto.supplierEmail,
      notes: dto.notes,
    });
  }

  async submit(id: string, companyId: string, userId: string): Promise<GoodsReceipt> {
    const receipt = await this.findById(id, companyId);

    if (receipt.status !== ReceiptStatus.DRAFT) {
      throw new BadRequestException('Can only submit draft receipts');
    }

    if (receipt.items.length === 0) {
      throw new BadRequestException('Cannot submit receipt without items');
    }

    return this.receiptRepository.update(id, {
      status: ReceiptStatus.PENDING,
    });
  }

  async approve(id: string, companyId: string, userId: string): Promise<GoodsReceipt> {
    const receipt = await this.findById(id, companyId);

    if (receipt.status !== ReceiptStatus.PENDING) {
      throw new BadRequestException('Can only approve pending receipts');
    }

    // Stock updates would be handled here by integrating with InventoryService
    // For now, just update the status

    return this.receiptRepository.update(id, {
      status: ReceiptStatus.APPROVED,
      approvedById: userId,
      approvedAt: new Date(),
    });
  }

  async cancel(id: string, companyId: string, userId: string, reason: string): Promise<GoodsReceipt> {
    const receipt = await this.findById(id, companyId);

    if (receipt.status === ReceiptStatus.CANCELLED) {
      throw new BadRequestException('Receipt is already cancelled');
    }

    // If approved, need to reverse stock movements
    // This would be handled by integrating with InventoryService

    return this.receiptRepository.update(id, {
      status: ReceiptStatus.CANCELLED,
      cancelledById: userId,
      cancelledAt: new Date(),
      cancellationReason: reason,
    });
  }

  async delete(id: string, companyId: string): Promise<void> {
    const receipt = await this.findById(id, companyId);

    if (receipt.status !== ReceiptStatus.DRAFT) {
      throw new BadRequestException('Can only delete draft receipts');
    }

    await this.receiptRepository.update(id, { status: ReceiptStatus.CANCELLED });
  }
}
