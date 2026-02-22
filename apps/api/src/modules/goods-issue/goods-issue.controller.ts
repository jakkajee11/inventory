import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
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
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { GoodsIssueService } from './goods-issue.service';
import {
  CreateGoodsIssueDto,
  UpdateGoodsIssueDto,
  GoodsIssueQueryDto,
  CancelIssueDto,
} from './application/dtos/goods-issue.dto';

@ApiTags('goods-issues')
@Controller('goods-issues')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
export class GoodsIssueController {
  constructor(private readonly issueService: GoodsIssueService) {}

  @Get()
  @ApiOperation({ summary: 'Get all goods issues' })
  @ApiResponse({ status: HttpStatus.OK, description: 'List of goods issues' })
  async findAll(
    @Request() req: { user: { companyId: string } },
    @Query() query: GoodsIssueQueryDto,
  ) {
    return this.issueService.findAll(req.user.companyId, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get goods issue by ID' })
  @ApiParam({ name: 'id', description: 'Issue ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Issue details' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Issue not found' })
  async findOne(
    @Param('id') id: string,
    @Request() req: { user: { companyId: string } },
  ) {
    return this.issueService.findById(id, req.user.companyId);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new goods issue' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Issue created' })
  async create(
    @Body() dto: CreateGoodsIssueDto,
    @Request() req: { user: { companyId: string; id: string } },
  ) {
    return this.issueService.create(req.user.companyId, req.user.id, dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a goods issue' })
  @ApiParam({ name: 'id', description: 'Issue ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Issue updated' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateGoodsIssueDto,
    @Request() req: { user: { companyId: string } },
  ) {
    return this.issueService.update(id, req.user.companyId, dto);
  }

  @Post(':id/submit')
  @ApiOperation({ summary: 'Submit goods issue for approval' })
  @ApiParam({ name: 'id', description: 'Issue ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Issue submitted' })
  async submit(
    @Param('id') id: string,
    @Request() req: { user: { companyId: string; id: string } },
  ) {
    return this.issueService.submit(id, req.user.companyId, req.user.id);
  }

  @Post(':id/approve')
  @ApiOperation({ summary: 'Approve goods issue' })
  @ApiParam({ name: 'id', description: 'Issue ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Issue approved' })
  async approve(
    @Param('id') id: string,
    @Request() req: { user: { companyId: string; id: string } },
  ) {
    return this.issueService.approve(id, req.user.companyId, req.user.id);
  }

  @Post(':id/cancel')
  @ApiOperation({ summary: 'Cancel goods issue' })
  @ApiParam({ name: 'id', description: 'Issue ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Issue cancelled' })
  async cancel(
    @Param('id') id: string,
    @Body() dto: CancelIssueDto,
    @Request() req: { user: { companyId: string; id: string } },
  ) {
    return this.issueService.cancel(id, req.user.companyId, req.user.id, dto.reason);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a draft goods issue' })
  @ApiParam({ name: 'id', description: 'Issue ID' })
  @ApiResponse({ status: HttpStatus.NO_CONTENT, description: 'Issue deleted' })
  async remove(
    @Param('id') id: string,
    @Request() req: { user: { companyId: string } },
  ) {
    return this.issueService.delete(id, req.user.companyId);
  }
}
