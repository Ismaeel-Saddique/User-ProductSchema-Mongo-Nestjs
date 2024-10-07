import { Body, Controller, Delete, Get, Param, Patch, Post, Put, UseGuards, ValidationPipe, Request, BadRequestException } from '@nestjs/common';
import { ProductService } from './product.service';
import { ApiBearerAuth } from '@nestjs/swagger';
import { JwtGuard } from 'src/guards/authguard';
import { CreateProductDto } from 'src/dto/createproduct.dto';
import { UpdateProductDto } from 'src/dto/updateproduct.dto';
import mongoose from 'mongoose';
import { RequestWithUser } from 'src/interfaces/requestwithuser.interface';

@ApiBearerAuth('JWT-auth')
@UseGuards(JwtGuard)
@Controller('product')
export class ProductController {
    constructor(private readonly productservice: ProductService) { }

    
    @Post('create/:userId')
    async createproduct(@Param('userId') userId: string, @Body(new ValidationPipe()) createproductdto: CreateProductDto) {
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            throw new BadRequestException('Invalid userId format');
        }
        createproductdto.userId = new mongoose.Types.ObjectId(userId);  
        return await this.productservice.createproduct(createproductdto);
    }

    
    @Get('all')
    getproducts() {
        return this.productservice.getallproducts()
    }

   
    @Get('productby/:id')
    getproductbyid(@Param('id') id: string) {
        return this.productservice.getproductbyproductid(id)
    }

   
    @Patch(':productId')
    updateproduct(@Param('productId') productId: string, @Body() updateProductDto: UpdateProductDto,
    ) {
        return this.productservice.updateproduct(productId, updateProductDto)
    }

    @Delete(':productId')
    async deleteproduct(@Param('productId') productId: string) {
        return await this.productservice.deleteProduct(productId);
    }

   
    @Get('user-products')
    getproductbyuserid(@Request() req: RequestWithUser) {  
        const userId = req.user.id
        return this.productservice.getProductsByUserId(userId);
    }
}
