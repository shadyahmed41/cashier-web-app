import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity()
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  orderNumber: number;

   @Column()
  date: string; // yyyy-mm-dd (Egypt timezone)

  @CreateDateColumn()
  createdAt: Date;

  @Column({ type: 'text', nullable: true })
  comment: string;

  @Column({ type: 'json' })
  items: {
    id: number;
    name: string;
    priceForSale: number;
    quantity: number;
    returned?: boolean;
    returnedQuantity: number;
  }[];

  @Column({ type: 'float' })
  total: number;
  @Column()
  time:string;
}
