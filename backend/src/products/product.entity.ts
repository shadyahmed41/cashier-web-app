import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  code: string;

  @Column()
  name: string;

  @Column('integer')
  quantity: number;

  @Column('float')
  priceForSale: number;

  @Column('float')
  priceForBuying: number;

  @Column()
  category: string;

  @Column()
  addedby: string;
}

