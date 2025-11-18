import { Controller, Post, Body, Get , Query} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from '../dto/createOrderDto.dto';


@Controller('orders')
export class OrdersController {
  constructor(private ordersService: OrdersService) {}

//   @Post()
//   createOrder(@Body() body: any) {
//     return this.ordersService.createOrder(body);
//   }
 @Post()
  create(@Body() createOrderDto: CreateOrderDto) {
    return this.ordersService.create(createOrderDto);
  }
  @Get('next-number')
getNextOrderNumber() {
  return this.ordersService.getNextOrderNumber();
}
@Get("search")
async searchOrders(
  @Query("page") page: number = 1,
  @Query("limit") limit: number = 30,
  @Query("orderNumber") orderNumber?: string,
  @Query("comment") comment?: string,
  @Query("startDate") startDate?: string,
  @Query("endDate") endDate?: string
) {
  return this.ordersService.searchOrders(page, limit, orderNumber, comment, startDate, endDate);
}


  @Get()
  getOrders() {
    return this.ordersService.getAllOrders();
  }

  // ---------- NEW: RETURN ITEM ----------
  @Post('return-item')
  async returnItem(@Body() body: { orderId: number; itemId: number; quantity: number }) {
    const { orderId, itemId, quantity } = body;
    return this.ordersService.returnItem(orderId, itemId, quantity);
  }
}
