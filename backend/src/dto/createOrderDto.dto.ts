import { IsNumber, IsString, IsOptional, IsArray } from 'class-validator';

export class CreateOrderDto {
  @IsArray()
  items: {
    id: number;
    name: string;
    priceForSale: number;
    quantity: number;
  }[];

  @IsNumber()
  total: number;

  @IsOptional()
  @IsString()
  comment?: string;
}
