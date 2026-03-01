import { Injectable, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { CategoryRepository, CategoryData } from './infrastructure/category.repository';
import { CreateCategoryDto, UpdateCategoryDto, CategoryQueryDto } from './application/dtos/category.dto';

export interface CategoryListResult {
  categories: CategoryData[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CategoryTreeNode extends CategoryData {
  children: CategoryTreeNode[];
}

@Injectable()
export class CategoryService {
  constructor(private readonly categoryRepository: CategoryRepository) {}

  async create(companyId: string, dto: CreateCategoryDto): Promise<CategoryData> {
    // Check name uniqueness per company
    if (await this.categoryRepository.findByName(dto.name, companyId)) {
      throw new ConflictException(`Category with name "${dto.name}" already exists`);
    }

    // Validate parent exists if provided
    if (dto.parentId) {
      const parent = await this.categoryRepository.findById(dto.parentId, companyId);
      if (!parent) {
        throw new NotFoundException('Parent category not found');
      }
      // Check depth (max 5 levels)
      const depth = await this.getCategoryDepth(dto.parentId, companyId);
      if (depth >= 4) {
        throw new BadRequestException('Maximum category depth (5 levels) exceeded');
      }
    }

    return this.categoryRepository.create({
      ...dto,
      companyId,
    });
  }

  async findById(id: string, companyId: string): Promise<CategoryData> {
    const category = await this.categoryRepository.findById(id, companyId);
    if (!category) {
      throw new NotFoundException('Category not found');
    }
    return category;
  }

  async findAll(companyId: string, query: CategoryQueryDto): Promise<CategoryListResult> {
    const page = query.page || 1;
    const limit = Math.min(query.limit || 20, 100);
    const skip = (page - 1) * limit;

    const { categories, total } = await this.categoryRepository.findAll(companyId, {
      skip,
      take: limit,
      search: query.search,
      includeInactive: query.includeInactive,
    });

    return {
      categories,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async update(id: string, companyId: string, dto: UpdateCategoryDto): Promise<CategoryData> {
    await this.findById(id, companyId); // Verify exists

    // Check name uniqueness if changing
    if (dto.name) {
      const existing = await this.categoryRepository.findByName(dto.name, companyId, id);
      if (existing) {
        throw new ConflictException(`Category with name "${dto.name}" already exists`);
      }
    }

    // Validate parent if changing
    if (dto.parentId !== undefined) {
      if (dto.parentId === id) {
        throw new BadRequestException('Category cannot be its own parent');
      }
      if (dto.parentId) {
        const parent = await this.categoryRepository.findById(dto.parentId, companyId);
        if (!parent) {
          throw new NotFoundException('Parent category not found');
        }
        // Check for circular reference
        if (await this.isDescendant(dto.parentId, id, companyId)) {
          throw new BadRequestException('Cannot set a descendant as parent');
        }
      }
    }

    return this.categoryRepository.update(id, dto);
  }

  async delete(id: string, companyId: string): Promise<void> {
    await this.findById(id, companyId); // Verify exists

    // Check if category has products
    if (await this.categoryRepository.hasProducts(id)) {
      throw new BadRequestException('Cannot delete category with associated products');
    }

    // Check if category has children
    if (await this.categoryRepository.hasChildren(id)) {
      throw new BadRequestException('Cannot delete category with subcategories');
    }

    await this.categoryRepository.softDelete(id);
  }

  async getTree(companyId: string, includeInactive = false): Promise<CategoryTreeNode[]> {
    const categories = await this.categoryRepository.findAllForTree(companyId, includeInactive);
    return this.buildTree(categories);
  }

  private buildTree(categories: CategoryData[]): CategoryTreeNode[] {
    const categoryMap = new Map<string, CategoryTreeNode>();
    const roots: CategoryTreeNode[] = [];

    // Create map of all categories
    categories.forEach((cat) => {
      categoryMap.set(cat.id, { ...cat, children: [] });
    });

    // Build tree
    categories.forEach((cat) => {
      const node = categoryMap.get(cat.id)!;
      if (cat.parentId && categoryMap.has(cat.parentId)) {
        categoryMap.get(cat.parentId)!.children.push(node);
      } else {
        roots.push(node);
      }
    });

    return roots;
  }

  private async getCategoryDepth(categoryId: string, companyId: string): Promise<number> {
    let depth = 0;
    let current = await this.categoryRepository.findById(categoryId, companyId);

    while (current?.parentId && depth < 10) {
      depth++;
      current = await this.categoryRepository.findById(current.parentId, companyId);
    }

    return depth;
  }

  private async isDescendant(potentialDescendantId: string, ancestorId: string, companyId: string): Promise<boolean> {
    let current = await this.categoryRepository.findById(potentialDescendantId, companyId);

    while (current?.parentId) {
      if (current.parentId === ancestorId) {
        return true;
      }
      current = await this.categoryRepository.findById(current.parentId, companyId);
    }

    return false;
  }
}
