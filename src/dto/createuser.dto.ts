import { IsEmail, IsNotEmpty, IsString, IsStrongPassword } from "class-validator";

export class CreateUserDto{

    @IsNotEmpty()
    @IsString()
    username : string;
    
    @IsEmail()
    email: string;

    @IsNotEmpty()
    @IsStrongPassword()
    password : string;

    @IsNotEmpty({ message: 'Please re-enter your password' })
    confirmPassword: string;
}