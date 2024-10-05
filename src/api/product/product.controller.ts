import { Body, Controller, Delete, Get, Param, Patch, Post, Put, UseGuards, ValidationPipe } from '@nestjs/common';
import { ProductService } from './product.service';
import { ApiBearerAuth } from '@nestjs/swagger';
import { JwtGuard } from 'src/guards/authguard';
import { CreateProductDto } from 'src/dto/createproduct.dto';
import { UpdateProductDto } from 'src/dto/updateproduct.dto';
import mongoose from 'mongoose';

@Controller('product')
export class ProductController {
    constructor(private readonly productservice: ProductService) { }

    @ApiBearerAuth('JWT-auth')
    @UseGuards(JwtGuard)
    @Post('create/:userId')
    async createproduct(@Param('userId') userId: string, @Body(new ValidationPipe()) createproductdto: CreateProductDto) {
        createproductdto.userId = new mongoose.Types.ObjectId(userId);
        return await this.productservice.createproduct(createproductdto)
    }

    @ApiBearerAuth('JWT-auth')
    @UseGuards(JwtGuard)
    @Get('all')
    getproducts() {
        return this.productservice.getallproducts()
    }

    @ApiBearerAuth('JWT-auth')
    @UseGuards(JwtGuard)
    @Get('productby/:id')
    getproductbyid(@Param('id') id: string) {
        return this.productservice.getproductbyproductid(id)
    }

    @ApiBearerAuth('JWT-auth')
    @UseGuards(JwtGuard)
    @Patch(':productId')
    updateproduct(@Param('productId') productId: string, @Body() updateProductDto: UpdateProductDto,
    ) {
        return this.productservice.updateproduct(productId, updateProductDto)
    }

    @ApiBearerAuth('JWT-auth')
    @UseGuards(JwtGuard)
    @Delete(':productId')
    async deleteproduct(@Param('productId') productId: string) {
        return await this.productservice.deleteproduct(productId);
    }

    @ApiBearerAuth('JWT-auth')
    @UseGuards(JwtGuard)
    @Get('user')
    getproductbyuserid() { }
}
