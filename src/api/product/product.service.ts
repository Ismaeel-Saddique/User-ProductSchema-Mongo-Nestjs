import { HttpException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model, Types } from 'mongoose';
import { CreateProductDto } from 'src/dto/createproduct.dto';
import { UpdateProductDto } from 'src/dto/updateproduct.dto';
import { Product, ProductDocument } from 'src/schemas/product.schema';
import { User } from 'src/schemas/user.schema';
import { MailService } from '../mail/mail-service.service';

@Injectable()
export class ProductService {
    constructor(@InjectModel(Product.name) private productmodel: Model<ProductDocument>,
        @InjectModel(User.name) private usermodel: Model<User>,
        private readonly mailService: MailService) { }

    async createproduct(userId: string, createproductdto: CreateProductDto) {
        const { name } = createproductdto
        const user = await this.usermodel.findById(userId)
        if (!user) throw new NotFoundException(`User with ID ${userId} not found`)
        const product = new this.productmodel({...createproductdto, userId});
        await product.save();
        const users = await this.usermodel.find();
        const emailPromises = users.map((user) =>
            this.mailService.sendEmail(
                user.email,
                'New Product Added!',
                `<p>Hello ${user.username},</p><p>A new product titled "${name}" has been added to our store!</p>`
            )
        );
        await Promise.all(emailPromises);
        
        return product;
    }

    async getallproducts() {
        return this.productmodel.find().exec();
    }

    async getproductbyproductid(productid: string) {
        if (!mongoose.isValidObjectId(productid)) {
            throw new NotFoundException('Invalid Product ID');
        }
        const product = await this.productmodel.findById(productid);
        if (!product) throw new HttpException("User not found", 404);
        return product
    }

    async updateproduct(productId: string, updateProductDto: UpdateProductDto): Promise<Product> {
        if (!mongoose.isValidObjectId(productId)) {
            throw new NotFoundException('Invalid Product ID');
        }
        const product = await this.productmodel.findByIdAndUpdate(
            productId,
            updateProductDto,
            { new: true, runValidators: true }
        );

        if (!product) {
            throw new NotFoundException('Product not found');
        }

        return product;
    }

    async deleteProduct(productId: string) {
        if (!mongoose.isValidObjectId(productId)) {
            throw new NotFoundException('Invalid Product ID');
        }
        const product = await this.productmodel.findByIdAndDelete(productId);
        if (!product) {
            throw new NotFoundException("There is no product corresponding to this ID");
        }
    
        return { message: 'Product successfully deleted' };
    }

    async getProductsByUserId(userId: string): Promise<Product[]> {
        const objectIdUserId = new Types.ObjectId(userId);
        const products = await this.productmodel.find({ userId: objectIdUserId }).lean().exec();
        return products
    }
}

