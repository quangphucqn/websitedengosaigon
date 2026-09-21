import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { Public } from '../common/public.decorator';
import { objectIdSchema } from '../common/object-id.schema';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import {
  createOrderSchema,
  type CreateOrderDto,
  type UpdateOrderStatusDto,
  updateOrderStatusSchema,
} from './orders.dto';
import { OrdersService } from './orders.service';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Public()
  @Post()
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  create(@Body(new ZodValidationPipe(createOrderSchema)) dto: CreateOrderDto) {
    return this.ordersService.create(dto);
  }

  @Get()
  findAll() {
    return this.ordersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', new ZodValidationPipe(objectIdSchema)) id: string) {
    return this.ordersService.findById(id);
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id', new ZodValidationPipe(objectIdSchema)) id: string,
    @Body(new ZodValidationPipe(updateOrderStatusSchema))
    dto: UpdateOrderStatusDto,
  ) {
    return this.ordersService.updateStatus(id, dto);
  }
}
