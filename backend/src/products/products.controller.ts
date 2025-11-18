import { Controller, Get, Post, Body, Put, Param, Delete,Query } from '@nestjs/common';
import { ProductsService } from './products.service';
import { Product } from './product.entity';
import { CreateProductDto } from '../dto/create-product.dto';
import { UpdateProductDto } from '../dto/update-product.dto';
import { log } from 'console';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  async create(@Body()  createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }


  @Get()
  async findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 30,
    @Query('search') search?: string,
    @Query('category') category?: string,
  ) {
    return this.productsService.findAll({ page, limit, search, category });
  }

@Get('code/:code')
async findByCode(@Param('code') code: string) {
  return this.productsService.findByCode(code);
}
@Get('categories')
async getCategories() {
  return this.productsService.getCategories();
}

@Post('categories')
async addCategory(@Body('name') name: string) {
  return this.productsService.addCategory(name);
}


  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.productsService.remove(id);
  }

  @Put(':id')
  update(@Param('id') id: number, @Body() updateProductDto: UpdateProductDto) {
    return this.productsService.update(id, updateProductDto);
  }
}
