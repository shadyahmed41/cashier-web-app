import { Injectable , BadRequestException , NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './product.entity';
import { CreateProductDto } from '../dto/create-product.dto';
import { UpdateProductDto } from '../dto/update-product.dto';


@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
  ) {}

async create(dto: CreateProductDto) {
    try {
      const product = this.productRepo.create(dto);
      const savedProduct =  await this.productRepo.save(product);
       // Delete placeholder if exists for this category
    const placeholder = await this.productRepo.findOne({
      where: {
        category: dto.category,
        addedby: 'system',
      }
    });

    if (placeholder) {
      await this.productRepo.delete(placeholder.id);
    }

    return savedProduct;
    } catch (error) {
      if (error.code === 'SQLITE_CONSTRAINT') {
        throw new BadRequestException('Product code already exists');
      }
      throw error;
    }
  }
 async findAll({ page = 1, limit = 30, search, category }: { page: number; limit: number; search?: string; category?: string }) {
    const query = this.productRepo.createQueryBuilder('product');

    if (search) {
      query.andWhere('product.name LIKE :search OR product.code LIKE :search', { search: `%${search}%` });
    }

    if (category) {
      query.andWhere('product.category = :category', { category });
    }

    query.orderBy('product.quantity', 'ASC');
    query.skip((page - 1) * limit).take(limit);

    const [products, total] = await query.getManyAndCount();
    return { products, total };
  }

  // Delete product
  async remove(id: number) {
    const result = await this.productRepo.delete(id);

    if (result.affected === 0) {
      throw new NotFoundException('Product not found');
    }

    return { message: 'Product deleted successfully' };
  }
  // Update product
  async update(id: number, dto: UpdateProductDto) {
    const product = await this.productRepo.findOne({ where: { id } });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    // Merge changes
    Object.assign(product, dto);

    return this.productRepo.save(product);
  }
  // find by code in cashier page
  async findByCode(code: string) {
  const product = await this.productRepo.findOne({ where: { code } });
  if (!product) throw new NotFoundException('Product not found');
  return product;
}
async getCategories() {
  const categories = await this.productRepo
    .createQueryBuilder('product')
    .select('DISTINCT product.category', 'category')
    .getRawMany();

  return categories.map((c) => c.category);
}
async addCategory(name: string) {
  if (!name.trim()) {
    throw new BadRequestException('Category name is required');
  }

  // categories are taken from existing products  
  // so to save a new category, we create a placeholder product
  const placeholder = this.productRepo.create({
    code: 'cat-' + Date.now(),  // unique code
    name: name + '-category',   // placeholder name
    quantity: 0,
    priceForSale: 0,
    priceForBuying: 0,
    category: name,
    addedby: 'system'
  });

  await this.productRepo.save(placeholder);

  return { message: 'Category added', category: name };
}

}
