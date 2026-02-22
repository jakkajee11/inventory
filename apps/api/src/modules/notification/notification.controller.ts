import {
  Controller,
  Get,
  Post,
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
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { NotificationService, NotificationQuery } from './notification.service';
import { NotificationType } from './domain/entities/notification.entity';

@ApiTags('notifications')
@Controller('notifications')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  @ApiOperation({ summary: 'Get all notifications for current user' })
  @ApiResponse({ status: HttpStatus.OK, description: 'List of notifications' })
  async findAll(
    @Request() req: { user: { id: string } },
    @Query() query: NotificationQuery,
  ) {
    return this.notificationService.findByUser(req.user.id, query);
  }

  @Get('unread-count')
  @ApiOperation({ summary: 'Get unread notification count' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Unread count' })
  async getUnreadCount(@Request() req: { user: { id: string } }) {
    const count = await this.notificationService.getUnreadCount(req.user.id);
    return { count };
  }

  @Post(':id/read')
  @ApiOperation({ summary: 'Mark notification as read' })
  @ApiParam({ name: 'id', description: 'Notification ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Notification marked as read' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Notification not found' })
  async markAsRead(
    @Param('id') id: string,
    @Request() req: { user: { id: string } },
  ) {
    return this.notificationService.markAsRead(id, req.user.id);
  }

  @Post('read-all')
  @ApiOperation({ summary: 'Mark all notifications as read' })
  @ApiResponse({ status: HttpStatus.OK, description: 'All notifications marked as read' })
  async markAllAsRead(@Request() req: { user: { id: string } }) {
    return this.notificationService.markAllAsRead(req.user.id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a notification' })
  @ApiParam({ name: 'id', description: 'Notification ID' })
  @ApiResponse({ status: HttpStatus.NO_CONTENT, description: 'Notification deleted' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Notification not found' })
  async remove(
    @Param('id') id: string,
    @Request() req: { user: { id: string } },
  ) {
    return this.notificationService.delete(id, req.user.id);
  }

  @Delete('read')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete all read notifications' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Read notifications deleted' })
  async deleteAllRead(@Request() req: { user: { id: string } }) {
    return this.notificationService.deleteAllRead(req.user.id);
  }
}
