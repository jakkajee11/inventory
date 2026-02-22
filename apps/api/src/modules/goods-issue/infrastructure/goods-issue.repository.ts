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
        issueNo: data.issueNo!,
        issueType: data.issueType!,
        recipientName: data.recipientName,
        recipientPhone: data.recipientPhone,
        recipientEmail: data.recipientEmail,
        issueDate: data.issueDate ?? new Date(),
        status: data.status ?? IssueStatus.DRAFT,
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
    return this.mapToEntity(issue);
  }

  async update(id: string, data: Partial<GoodsIssue>): Promise<GoodsIssue> {
    const issue = await this.prisma.goodsIssue.update({
      where: { id },
      data: {
        ...(data.issueType !== undefined && { issueType: data.issueType }),
        ...(data.recipientName !== undefined && { recipientName: data.recipientName }),
        ...(data.recipientPhone !== undefined && { recipientPhone: data.recipientPhone }),
        ...(data.recipientEmail !== undefined && { recipientEmail: data.recipientEmail }),
        ...(data.issueDate !== undefined && { issueDate: data.issueDate }),
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
        issueNo: { startsWith: prefix },
      },
      orderBy: { issueNo: 'desc' },
    });

    if (!lastIssue) {
      return `${prefix}00001`;
    }

    const lastNumber = parseInt(lastIssue.issueNo.split('-')[2], 10);
    return `${prefix}${String(lastNumber + 1).padStart(5, '0')}`;
  }

  private mapToEntity(issue: any): GoodsIssue {
    const entity = new GoodsIssue();
    entity.id = issue.id;
    entity.issueNo = issue.issueNo;
    entity.issueType = issue.issueType as IssueType;
    entity.recipientName = issue.recipientName;
    entity.recipientPhone = issue.recipientPhone;
    entity.recipientEmail = issue.recipientEmail;
    entity.issueDate = issue.issueDate;
    entity.status = issue.status as IssueStatus;
    entity.notes = issue.notes;
    entity.totalAmount = issue.totalAmount;
    entity.attachments = issue.attachments;
    entity.companyId = issue.companyId;
    entity.createdById = issue.createdById;
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
