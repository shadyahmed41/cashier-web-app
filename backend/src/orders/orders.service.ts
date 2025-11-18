import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './orders.entity';
import { Product } from '../products/product.entity';
import { getEgyptDate } from '../utils/egypt-time';
import { getEgyptTime } from '../utils/egypt-time';
import { CreateOrderDto } from '../dto/createOrderDto.dto';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private orderRepo: Repository<Order>,
    @InjectRepository(Product)
    private productRepo: Repository<Product>,
  ) {}

  async create(createOrderDto: CreateOrderDto) {
  const today = getEgyptDate();
  const time = getEgyptTime();

  // Get the last order of today
  const lastOrder = await this.orderRepo.findOne({
    where: { date: today },
    order: { orderNumber: 'DESC' },
  });

  const orderNumber = lastOrder ? lastOrder.orderNumber + 1 : 1;

  const order = this.orderRepo.create({
    ...createOrderDto,
    date: today,
    time,
    orderNumber,
    items: createOrderDto.items.map(item => ({
    ...item,
    returned: false,   // <--- important for returns
  })),
});

const savedOrder = await this.orderRepo.save(order);

    // ↓ Update product quantities
    for (const item of createOrderDto.items) {
      const product = await this.productRepo.findOne({ where: { id: item.id } });
      if (product) {
        product.quantity = Math.max(0, product.quantity - item.quantity);
        await this.productRepo.save(product);
      }
    }
  return savedOrder;
}


  async getAllOrders() {
    return this.orderRepo.find({
      order: { id: 'DESC' },
    });
  }

  async getNextOrderNumber() {
  const today = getEgyptDate();

  const lastOrder = await this.orderRepo.findOne({
    where: { date: today },
    order: { orderNumber: 'DESC' },
  });

  return lastOrder ? lastOrder.orderNumber + 1 : 1;
}

async searchOrders(
  page: number,
  limit: number,
  orderNumber?: string,
  comment?: string,
  startDate?: string,
  endDate?: string
) {
  const query = this.orderRepo.createQueryBuilder("order");

  if (orderNumber) {
    query.andWhere("order.orderNumber LIKE :orderNumber", {
      orderNumber: `%${orderNumber}%`,
    });
  }

  if (comment) {
    query.andWhere("order.comment LIKE :comment", {
      comment: `%${comment}%`,
    });
  }

  if (startDate && endDate) {
    query.andWhere("order.date BETWEEN :start AND :end", {
      start: startDate,
      end: endDate,
    });
  }

  query.orderBy("order.orderNumber", "DESC");

  const [data, total] = await query
    .skip((page - 1) * limit)
    .take(limit)
    .getManyAndCount();

  
   // Fetch all products used in all orders in the filtered range
  const allQuery = this.orderRepo.createQueryBuilder("order");

  if (orderNumber) allQuery.andWhere("order.orderNumber LIKE :orderNumber", { orderNumber: `%${orderNumber}%` });
  if (comment) allQuery.andWhere("order.comment LIKE :comment", { comment: `%${comment}%` });
  if (startDate && endDate) allQuery.andWhere("order.date BETWEEN :start AND :end", { start: startDate, end: endDate });

  const allOrders = await allQuery.getMany();

  // Collect all unique product IDs
  const productIds = new Set<number>();
  allOrders.forEach(order => order.items.forEach(item => productIds.add(item.id)));

  // Fetch all products in a single query
  const products = await this.productRepo.findByIds([...productIds]);
  const productMap = new Map(products.map(p => [p.id, p.priceForBuying]));

  let totalAmount = 0;
  let totalProfit = 0;

  allOrders.forEach(order => {
    order.items.forEach(item => {
      const buyingPrice = productMap.get(item.id) || 0;
      totalAmount += item.quantity * item.priceForSale;
      totalProfit += item.quantity * (item.priceForSale - buyingPrice);
    });
  });


  return {
    data,
    total,
    page,
    totalPages: Math.ceil(total / limit),
    totalAmount,
    totalProfit,
  };
}

async returnItem(orderId: number, itemId: number, quantity: number) {
  const order = await this.orderRepo.findOne({ where: { id: orderId } });
  if (!order) throw new Error('Order not found');

  const item = order.items.find(i => i.id === itemId);
  if (!item) throw new Error('Item not found in order');

  if (quantity > item.quantity) throw new Error('Cannot return more than purchased');

  // Increase product quantity in storage
  const product = await this.productRepo.findOne({ where: { id: itemId } });
  if (product) {
    product.quantity += quantity;
    await this.productRepo.save(product);
  }

  // Update item quantity and returned status
  item.quantity -= quantity;
  if (item.quantity === 0) {
    item.returned = true;
  } else {
    item.returnedQuantity = (item.returnedQuantity || 0) + quantity;
  }

  // Recalculate order total and profit
  let newTotal = 0;
  let newProfit = 0;

  for (const i of order.items) {
    if (i.returned) continue;

    const productDb = await this.productRepo.findOne({ where: { id: i.id } });
    const buyingPrice = productDb ? productDb.priceForBuying : 0;

    newTotal += i.quantity * i.priceForSale;
    newProfit += i.quantity * (i.priceForSale - buyingPrice);
  }

  order.total = newTotal;

  await this.orderRepo.save(order);

  return { success: true, order };
}


}
