import { IsNotEmpty, IsOptional, IsString, IsNumber, IsMongoId } from 'class-validator';
import mongoose, { Types } from 'mongoose';

export class CreateProductDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsNumber()
  price: number;

  @IsOptional()
  @IsString()
  description?: string;

  userId: Types.ObjectId; 
}
