import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Delete,
  Param,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { CategoryService, CategoryTreeNode } from './category.service';
import { CreateCategoryDto, UpdateCategoryDto, CategoryQueryDto } from './application/dtos/category.dto';
import { CategoryData } from './infrastructure/category.repository';

@ApiTags('categories')
@Controller('categories')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Get()
  @ApiOperation({ summary: 'Get all categories' })
  @ApiResponse({ status: HttpStatus.OK, description: 'List of categories' })
  async findAll(
    @Request() req: { user: { companyId: string } },
    @Query() query: CategoryQueryDto,
  ) {
    return this.categoryService.findAll(req.user.companyId, query);
  }

  @Get('tree')
  @ApiOperation({ summary: 'Get category tree' })
  @ApiQuery({ name: 'includeInactive', required: false, type: Boolean })
  @ApiResponse({ status: HttpStatus.OK, description: 'Category tree structure' })
  async getTree(
    @Request() req: { user: { companyId: string } },
    @Query('includeInactive') includeInactive?: boolean,
  ): Promise<CategoryTreeNode[]> {
    return this.categoryService.getTree(req.user.companyId, includeInactive);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get category by ID' })
  @ApiParam({ name: 'id', description: 'Category ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Category details' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Category not found' })
  async findOne(
    @Param('id') id: string,
    @Request() req: { user: { companyId: string } },
  ): Promise<CategoryData> {
    return this.categoryService.findById(id, req.user.companyId);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new category' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Category created' })
  @ApiResponse({ status: HttpStatus.CONFLICT, description: 'Category name already exists' })
  async create(
    @Body() dto: CreateCategoryDto,
    @Request() req: { user: { companyId: string } },
  ): Promise<CategoryData> {
    return this.categoryService.create(req.user.companyId, dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a category' })
  @ApiParam({ name: 'id', description: 'Category ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Category updated' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Category not found' })
  @ApiResponse({ status: HttpStatus.CONFLICT, description: 'Category name already exists' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateCategoryDto,
    @Request() req: { user: { companyId: string } },
  ): Promise<CategoryData> {
    return this.categoryService.update(id, req.user.companyId, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a category (soft delete)' })
  @ApiParam({ name: 'id', description: 'Category ID' })
  @ApiResponse({ status: HttpStatus.NO_CONTENT, description: 'Category deleted' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Category not found' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Category has products or subcategories' })
  async remove(
    @Param('id') id: string,
    @Request() req: { user: { companyId: string } },
  ): Promise<void> {
    return this.categoryService.delete(id, req.user.companyId);
  }
}
