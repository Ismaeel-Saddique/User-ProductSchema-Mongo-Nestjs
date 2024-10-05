import { IsNotEmpty, IsOptional, IsString, IsNumber, IsMongoId } from 'class-validator';
import { Types } from 'mongoose';

export class UpdateProductDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsNumber()
  price?: number;

  @IsOptional()
  @IsString()
  description?: string;
}
