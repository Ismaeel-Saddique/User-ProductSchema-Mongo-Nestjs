import { Body, Controller, Post, ValidationPipe, Get, Param, HttpException, Patch, Delete, UseGuards, UnauthorizedException } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from 'src/dto/createuser.dto';
import mongoose from 'mongoose';
import { UpdateUserDto } from 'src/dto/updateuser.dto';
import { JwtGuard } from 'src/guards/authguard';
import { ApiBearerAuth } from '@nestjs/swagger';
import { LoginDto } from 'src/dto/login.dto';
import { VerifyOtpAndResetPasswordDto } from 'src/dto/ResetPassword.dto';

@Controller('user')
export class UserController {
    constructor(private userservice: UserService) { }

    @Post('signup')
    createUser(@Body(new ValidationPipe()) createuserdto: CreateUserDto) {
        return this.userservice.signupuser(createuserdto)
    }

    @Post('verify-otp')
    async verifyOtp(@Body() body: { email: string; otp: string }): Promise<string> {
        const { email, otp } = body;
        return await this.userservice.verifyOtp(email, otp);
    }

    @Post('login')
    loginUser(@Body(new ValidationPipe()) Logindto: LoginDto) {
        return this.userservice.login(Logindto)
    }

    @Post('forgot-password')
    async forgetpassword(@Body('identifier') identifier: string) {
        return await this.userservice.forgotPassword(identifier);
    }
    
    @Post('reset-password')
    async resetPassword( @Body() resetPasswordDto: VerifyOtpAndResetPasswordDto){
        return await this.userservice.verifyOtpAndResetPassword(resetPasswordDto);
    }

    @Post('refresh/:id')
    async refreshtokens(
        @Param('id') id: string,
        @Body('refreshToken', new ValidationPipe()) refreshToken: string) {
        try {
            return await this.userservice.refreshtoken(id, refreshToken);
        }
        catch (error) {
            throw new UnauthorizedException('Inavalid Refresh Token');
        }
    }

    @ApiBearerAuth('JWT-auth')
    @UseGuards(JwtGuard)
    @Get('userby/:id')
    async getuserbyid(@Param('id') id: string) {
        const isvalid = mongoose.Types.ObjectId.isValid(id)
        if (!isvalid) throw new HttpException("Invalid Id", 404);
        const finduser = await this.userservice.getuserbyid(id);
        return finduser;
    }

    @ApiBearerAuth('JWT-auth')
    @UseGuards(JwtGuard)
    @Get("allusers")
    async displayusers() {
        return await this.userservice.getuser(); 
    }

    @ApiBearerAuth('JWT-auth')
    @UseGuards(JwtGuard)
    @Patch('update/:id')
    updateuser(@Param('id') id: string, @Body(new ValidationPipe()) updateuserdto: UpdateUserDto) {
        const isvalid = mongoose.Types.ObjectId.isValid(id);
        if (!isvalid) throw new HttpException("Invalid Id", 404);
        return this.userservice.updateuserbyid(id, updateuserdto)
    }


    @ApiBearerAuth('JWT-auth')
    @UseGuards(JwtGuard)
    @Delete('delete/:id')
    deleteuser(@Param('id') id: string) {
        const isvalid = mongoose.Types.ObjectId.isValid(id)
        if (!isvalid) throw new HttpException("Invalid Id", 404);
        this.userservice.deleteuserbyid(id)
    }
}
