import { IsOptional, IsPositive, IsStrongPassword } from "class-validator";

export class UpdateUserDto{
    @IsOptional()
    username? : string;

    @IsOptional()
    @IsStrongPassword()
    password? : string;
}