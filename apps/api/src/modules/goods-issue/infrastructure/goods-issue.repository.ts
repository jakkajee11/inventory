import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { GoodsIssue, GoodsIssueItem, IssueStatus, IssueType } from '../domain/entities/goods-issue.entity';

@Injectable()
export class GoodsIssueRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string, companyId: string): Promise<GoodsIssue | null> {
    const issue = await this.prisma.goodsIssue.findFirst({
      where: { id, companyId },
      include: {
        items: {
          include: { product: true },
        },
      },
    });
    return issue ? this.mapToEntity(issue) : null;
  }

  async findAll(companyId: string, options?: {
    skip?: number;
    take?: number;
    status?: IssueStatus;
    issueType?: IssueType;
    startDate?: Date;
    endDate?: Date;
  }): Promise<{ issues: GoodsIssue[]; total: number }> {
    const where = {
      companyId,
      ...(options?.status && { status: options.status }),
      ...(options?.issueType && { issueType: options.issueType }),
      ...(options?.startDate && { createdAt: { gte: options.startDate } }),
      ...(options?.endDate && { createdAt: { lte: options.endDate } }),
    };

    const [issues, total] = await Promise.all([
      this.prisma.goodsIssue.findMany({
        where,
        skip: options?.skip,
        take: options?.take,
        include: { items: { include: { product: true } } },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.goodsIssue.count({ where }),
    ]);

    return {
      issues: issues.map((i) => this.mapToEntity(i)),
      total,
    };
  }

  async create(data: Partial<GoodsIssue>, items: Partial<GoodsIssueItem>[]): Promise<GoodsIssue> {
    const issue = await this.prisma.goodsIssue.create({
      data: {
        issueNumber: data.issueNumber!,
        issueType: data.issueType!,
        warehouseId: data.warehouseId,
        destination: data.destination,
        reference: data.reference,
        status: data.status ?? IssueStatus.DRAFT,
        notes: data.notes,
        totalAmount: data.totalAmount ?? 0,
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
    return this.mapToEntity(issue);
  }

  async update(id: string, data: Partial<GoodsIssue>): Promise<GoodsIssue> {
    const issue = await this.prisma.goodsIssue.update({
      where: { id },
      data: {
        ...(data.issueType !== undefined && { issueType: data.issueType }),
        ...(data.warehouseId !== undefined && { warehouseId: data.warehouseId }),
        ...(data.destination !== undefined && { destination: data.destination }),
        ...(data.reference !== undefined && { reference: data.reference }),
        ...(data.status !== undefined && { status: data.status }),
        ...(data.notes !== undefined && { notes: data.notes }),
        ...(data.totalAmount !== undefined && { totalAmount: data.totalAmount }),
        ...(data.submittedById !== undefined && { submittedById: data.submittedById }),
        ...(data.submittedAt !== undefined && { submittedAt: data.submittedAt }),
        ...(data.approvedById !== undefined && { approvedById: data.approvedById }),
        ...(data.approvedAt !== undefined && { approvedAt: data.approvedAt }),
        ...(data.cancelledById !== undefined && { cancelledById: data.cancelledById }),
        ...(data.cancelledAt !== undefined && { cancelledAt: data.cancelledAt }),
        ...(data.cancellationReason !== undefined && { cancellationReason: data.cancellationReason }),
      },
      include: { items: { include: { product: true } } },
    });
    return this.mapToEntity(issue);
  }

  async updateItems(issueId: string, items: Partial<GoodsIssueItem>[]): Promise<GoodsIssue> {
    await this.prisma.goodsIssueItem.deleteMany({ where: { issueId } });

    const issue = await this.prisma.goodsIssue.update({
      where: { id: issueId },
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
    return this.mapToEntity(issue);
  }

  async generateIssueNumber(companyId: string): Promise<string> {
    const year = new Date().getFullYear();
    const prefix = `GI-${year}-`;

    const lastIssue = await this.prisma.goodsIssue.findFirst({
      where: {
        companyId,
        issueNumber: { startsWith: prefix },
      },
      orderBy: { issueNumber: 'desc' },
    });

    if (!lastIssue) {
      return `${prefix}00001`;
    }

    const lastNumber = parseInt(lastIssue.issueNumber.split('-')[2], 10);
    return `${prefix}${String(lastNumber + 1).padStart(5, '0')}`;
  }

  private mapToEntity(issue: any): GoodsIssue {
    const entity = new GoodsIssue();
    entity.id = issue.id;
    entity.issueNumber = issue.issueNumber;
    entity.issueType = issue.issueType as IssueType;
    entity.warehouseId = issue.warehouseId;
    entity.destination = issue.destination;
    entity.reference = issue.reference;
    entity.status = issue.status as IssueStatus;
    entity.notes = issue.notes;
    entity.totalAmount = issue.totalAmount;
    entity.companyId = issue.companyId;
    entity.createdById = issue.createdById;
    entity.submittedById = issue.submittedById;
    entity.submittedAt = issue.submittedAt;
    entity.approvedById = issue.approvedById;
    entity.approvedAt = issue.approvedAt;
    entity.cancelledById = issue.cancelledById;
    entity.cancelledAt = issue.cancelledAt;
    entity.cancellationReason = issue.cancellationReason;
    entity.createdAt = issue.createdAt;
    entity.updatedAt = issue.updatedAt;
    entity.items = issue.items?.map((item: any) => {
      const itemEntity = new GoodsIssueItem();
      itemEntity.id = item.id;
      itemEntity.issueId = item.issueId;
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
