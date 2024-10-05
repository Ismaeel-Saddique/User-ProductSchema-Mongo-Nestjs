import { Body, Controller, Post, ValidationPipe, Get, Param, HttpException, Patch, Delete, UseGuards, UnauthorizedException } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from 'src/dto/createuser.dto';
import mongoose from 'mongoose';
import { UpdateUserDto } from 'src/dto/updateuser.dto';
import { JwtGuard } from 'src/guards/authguard';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('user')
export class UserController {
    constructor(private userservice: UserService) { }

    @Post('signup')
    createUser(@Body(new ValidationPipe()) createuserdto: CreateUserDto) {
        return this.userservice.signupuser(createuserdto)
    }

    @Post('login')
    loginUser(@Body(new ValidationPipe()) createuserdto: CreateUserDto) {
        return this.userservice.login(createuserdto)
    }

    @Post('refresh/:id')
    async refreshtokens(
        @Param('id') id: string,
        @Body('refreshtoken', new ValidationPipe()) refreshtoken: string) {
        try {
            return await this.userservice.refreshtoken(id, refreshtoken);
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
        return await this.userservice.getuser(); // This should simply return all users
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
