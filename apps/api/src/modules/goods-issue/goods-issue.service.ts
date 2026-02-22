import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { GoodsIssueRepository } from './infrastructure/goods-issue.repository';
import { GoodsIssue, IssueStatus } from './domain/entities/goods-issue.entity';
import { CreateGoodsIssueDto, UpdateGoodsIssueDto, GoodsIssueQueryDto } from './application/dtos/goods-issue.dto';

@Injectable()
export class GoodsIssueService {
  constructor(
    private readonly issueRepository: GoodsIssueRepository,
  ) {}

  async create(companyId: string, userId: string, dto: CreateGoodsIssueDto): Promise<GoodsIssue> {
    const issueNumber = await this.issueRepository.generateIssueNumber(companyId);

    // Get current stock and average cost for each product to validate and calculate
    // This would integrate with ProductService and InventoryService

    const items = dto.items.map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
      unitCost: 0, // Would be fetched from product's average cost
      totalCost: item.quantity * 0,
      notes: item.notes,
    }));

    const totalAmount = items.reduce((sum, item) => sum + item.totalCost, 0);

    return this.issueRepository.create({
      issueNumber,
      issueType: dto.issueType,
      warehouseId: dto.warehouseId,
      destination: dto.destination,
      reference: dto.reference,
      notes: dto.notes,
      totalAmount,
      status: IssueStatus.DRAFT,
      companyId,
      createdById: userId,
    }, items);
  }

  async findById(id: string, companyId: string): Promise<GoodsIssue> {
    const issue = await this.issueRepository.findById(id, companyId);
    if (!issue) {
      throw new NotFoundException('Goods issue not found');
    }
    return issue;
  }

  async findAll(companyId: string, query: GoodsIssueQueryDto) {
    const page = query.page || 1;
    const limit = Math.min(query.limit || 20, 100);
    const skip = (page - 1) * limit;

    const { issues, total } = await this.issueRepository.findAll(companyId, {
      skip,
      take: limit,
      status: query.status,
      issueType: query.issueType,
      startDate: query.startDate,
      endDate: query.endDate,
    });

    return {
      issues,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async update(id: string, companyId: string, dto: UpdateGoodsIssueDto): Promise<GoodsIssue> {
    const issue = await this.findById(id, companyId);

    if (issue.status !== IssueStatus.DRAFT) {
      throw new BadRequestException('Can only update draft issues');
    }

    if (dto.items && dto.items.length > 0) {
      const items = dto.items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        unitCost: 0,
        totalCost: item.quantity * 0,
        notes: item.notes,
      }));

      const totalAmount = items.reduce((sum, item) => sum + item.totalCost, 0);
      await this.issueRepository.updateItems(id, items);

      return this.issueRepository.update(id, {
        issueType: dto.issueType,
        warehouseId: dto.warehouseId,
        destination: dto.destination,
        reference: dto.reference,
        notes: dto.notes,
        totalAmount,
      });
    }

    return this.issueRepository.update(id, {
      issueType: dto.issueType,
      warehouseId: dto.warehouseId,
      destination: dto.destination,
      reference: dto.reference,
      notes: dto.notes,
    });
  }

  async submit(id: string, companyId: string, userId: string): Promise<GoodsIssue> {
    const issue = await this.findById(id, companyId);

    if (issue.status !== IssueStatus.DRAFT) {
      throw new BadRequestException('Can only submit draft issues');
    }

    if (issue.items.length === 0) {
      throw new BadRequestException('Cannot submit issue without items');
    }

    // Validate stock availability for all items
    // This would integrate with InventoryService to check stock levels

    return this.issueRepository.update(id, {
      status: IssueStatus.PENDING,
      submittedById: userId,
      submittedAt: new Date(),
    });
  }

  async approve(id: string, companyId: string, userId: string): Promise<GoodsIssue> {
    const issue = await this.findById(id, companyId);

    if (issue.status !== IssueStatus.PENDING) {
      throw new BadRequestException('Can only approve pending issues');
    }

    // Stock decrease would be handled here by integrating with InventoryService

    return this.issueRepository.update(id, {
      status: IssueStatus.APPROVED,
      approvedById: userId,
      approvedAt: new Date(),
    });
  }

  async cancel(id: string, companyId: string, userId: string, reason: string): Promise<GoodsIssue> {
    const issue = await this.findById(id, companyId);

    if (issue.status === IssueStatus.CANCELLED) {
      throw new BadRequestException('Issue is already cancelled');
    }

    return this.issueRepository.update(id, {
      status: IssueStatus.CANCELLED,
      cancelledById: userId,
      cancelledAt: new Date(),
      cancellationReason: reason,
    });
  }

  async delete(id: string, companyId: string): Promise<void> {
    const issue = await this.findById(id, companyId);

    if (issue.status !== IssueStatus.DRAFT) {
      throw new BadRequestException('Can only delete draft issues');
    }

    await this.issueRepository.update(id, { status: IssueStatus.CANCELLED });
  }
}
