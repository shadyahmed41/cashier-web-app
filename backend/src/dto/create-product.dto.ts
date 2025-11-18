export class CreateProductDto {
  code: string;
  name: string;
  quantity: number;
  priceForBuying?: number;
  priceForSale: number;
  category: string;
  addedby?: string;
}
