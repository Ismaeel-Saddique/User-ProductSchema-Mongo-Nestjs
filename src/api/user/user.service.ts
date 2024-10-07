import { HttpException, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { CreateUserDto } from 'src/dto/createuser.dto';
import { UpdateUserDto } from 'src/dto/updateuser.dto';
import { User } from 'src/schemas/user.schema';
import * as bcrypt from "bcrypt";
import { JwtService } from '@nestjs/jwt';


@Injectable()
export class UserService {
    constructor(@InjectModel(User.name) private usermodel: Model<User>,
        private readonly jwtService: JwtService) { }

    async signupuser(createuserdto: CreateUserDto) {
        const { username, password } = createuserdto;
        const hashedpassword = await bcrypt.hash(password, 10)
        const user = new this.usermodel({ username, password: hashedpassword });
        await user.save()
    }

    async login(createuserdto: CreateUserDto) {
        const { username, password} = createuserdto;
        const user = await this.usermodel.findOne({ username })
        if (!user || !(await bcrypt.compare(password, user.password))) {
            throw new UnauthorizedException('Invalid credentials');
        }
        const payload = { username, userId: user._id  };
        const accessToken = await this.jwtService.signAsync(payload);
        const refreshToken = await this.jwtService.signAsync(payload, { expiresIn: '7d' });
        const hashedrefreshtoken = await bcrypt.hash(refreshToken, 10);
        await this.usermodel.findOneAndUpdate( { _id: user._id }, { refreshToken: hashedrefreshtoken })
        return { accessToken, refreshToken };
    }

    async refreshtoken(id: string, refreshToken: string) {
        const user =  await this.usermodel.findById(id).exec();
        if (!user) {
            throw new HttpException("System cannot find user", 404);
        }
        const isRefreshTokenValid = await bcrypt.compare(refreshToken, user.refreshToken);
        if (!isRefreshTokenValid) {
            throw new UnauthorizedException('Not Compared');
        }
        const payload = { username: user.username, userId: user._id  };
        const newAccessToken = await this.jwtService.signAsync(payload);
        const newRefreshToken = await this.jwtService.signAsync(payload, { expiresIn: '7d' });
        const newHashedtoken = await bcrypt.hash(newRefreshToken, 10);
        await this.usermodel.findByIdAndUpdate(user.id, { refreshToken: newHashedtoken })
        return { accessToken: newAccessToken, refreshToken: newRefreshToken }
    }

    async getuser(): Promise<User[]> {
        return this.usermodel.find().exec();
    }

    async getuserbyid(id: string) {
        const user = await this.usermodel.findById(id);
        if (!user) throw new HttpException("User not found", 404);
        return user

    }

    async updateuserbyid(id: string, updateuserdto: UpdateUserDto) {
        const user = await this.usermodel.findByIdAndUpdate(id)
        if (!user) throw new Error("User not found");

        if (updateuserdto.username) {
            user.username = updateuserdto.username;
        }

        if (updateuserdto.password) {
            user.password = await bcrypt.hash(updateuserdto.password, 10);
        }
        await user.save();
    }


    deleteuserbyid(id) {
        return this.usermodel.findByIdAndDelete(id)
    }
}
