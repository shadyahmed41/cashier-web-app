import { DataSource } from 'typeorm';
import { Order } from './orders/orders.entity';
import { Product } from './products/product.entity';

export default new DataSource({
  type: 'sqlite',
  database: 'cashier.db',
  entities: [Order, Product],
  migrations: ['src/migrations/*.ts'],
});
