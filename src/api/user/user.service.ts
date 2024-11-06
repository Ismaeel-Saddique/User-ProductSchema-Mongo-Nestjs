import { BadRequestException, HttpException, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as crypto from 'crypto';
import mongoose, { Model } from 'mongoose';
import { CreateUserDto } from 'src/dto/createuser.dto';
import { UpdateUserDto } from 'src/dto/updateuser.dto';
import { User } from 'src/schemas/user.schema';
import * as bcrypt from "bcrypt";
import { JwtService } from '@nestjs/jwt';
import { MailService } from '../mail/mail-service.service';
import { LoginDto } from 'src/dto/login.dto';
import { VerifyOtpAndResetPasswordDto } from 'src/dto/ResetPassword.dto';

@Injectable()
export class UserService {
    constructor(@InjectModel(User.name) private usermodel: Model<User>,
        private readonly jwtService: JwtService,
        private readonly mailService: MailService) { }

    async signupuser(createuserdto: CreateUserDto) {
        const { username, email, password, confirmPassword } = createuserdto;
        if (password !== confirmPassword) {
            throw new BadRequestException('Passwords do not match');
        }
        let user = await this.usermodel.findOne({ email });

        if (user && user.isVerified) {
            throw new BadRequestException('Email is already in use');
        } else if (user && !user.isVerified) {
            user.otp = crypto.randomInt(100000, 999999).toString();
            user.otpExpires = new Date(Date.now() + 10 * 60 * 1000);
        } else {
            const hashedPassword = await bcrypt.hash(password, 10);
            user = new this.usermodel({
                username,
                email,
                password: hashedPassword,
                otp: crypto.randomInt(100000, 999999).toString(),
                otpExpires: new Date(Date.now() + 10 * 60 * 1000),
                isVerified: false,
            });
        }
        await user.save()
        await this.sendOtpEmail(email, user.otp);
        return { message: 'Open Gmail in your device to obtain otp' };
    }

    private async sendOtpEmail(email: string, otp: string) {
        await this.mailService.sendOtpEmail(email, otp);
    }

    async verifyOtp(email: string, otp: string): Promise<string> {
        const user = await this.usermodel.findOne({ email, isVerified: false });

        if (!user || user.otpExpires < new Date()) {
            throw new BadRequestException('Invalid or expired OTP');
        }

        if (user.otp !== otp) {
            throw new BadRequestException('Incorrect OTP');
        }

        user.isVerified = true;
        user.otp = null;
        user.otpExpires = null;
        await user.save();

        return 'Account verified and created successfully';
    }

    async login(logindto: LoginDto) {
        const { email, password } = logindto;
        const user = await this.usermodel.findOne({ email })
        if (!user || !user.isVerified) {
            throw new UnauthorizedException('User not found or not verified');
        }
        if (!user || !(await bcrypt.compare(password, user.password))) {
            throw new UnauthorizedException('Invalid credentials');
        }
        const payload = { username: user.username, userId: user._id };
        const accessToken = await this.jwtService.signAsync(payload);
        const refreshToken = await this.jwtService.signAsync(payload, { expiresIn: '7d' });
        const hashedrefreshtoken = await bcrypt.hash(refreshToken, 10);
        await this.usermodel.findOneAndUpdate({ _id: user._id }, { refreshToken: hashedrefreshtoken })
        return { user, accessToken, refreshToken, };
    }

    async forgotPassword(identifier: string): Promise<{ message: string }> {
        const user = await this.usermodel.findOne({
            $or: [{ email: identifier }, { username: identifier }],
        });
        if (!user) {
            throw new BadRequestException('User not found');
        }
        const otp = crypto.randomInt(100000, 999999).toString();
        const otpExpires = new Date(Date.now() + 10 * 60 * 1000);
        user.otp = otp;
        user.otpExpires = otpExpires;
        await user.save();
        await this.sendOtpEmail(user.email, otp);
        return { message: 'OTP sent to your registered email' };
    }

    async verifyOtpAndResetPassword(verifyOtpAndResetPasswordDto: VerifyOtpAndResetPasswordDto): Promise<{ message: string }> {
        const { email, otp, newPassword } = verifyOtpAndResetPasswordDto;
        const user = await this.usermodel.findOne({ email, isVerified: true });
        if (!user || user.otpExpires < new Date()) {
            throw new BadRequestException('Invalid or expired OTP');
        }
        if (user.otp !== otp) {
            throw new BadRequestException('Incorrect OTP');
        }
        const isSameAsOldPassword = await bcrypt.compare(newPassword, user.password);
        if (isSameAsOldPassword) {
            throw new BadRequestException("The new password must be different from the current password.");
        }
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        user.otp = null;
        user.otpExpires = null;
        await user.save();
        return { message: 'Password has been reset successfully' };
    }

    async refreshtoken(id: string, refreshToken: string) {
        const user = await this.usermodel.findById(id).exec();
        if (!user) {
            throw new HttpException("System cannot find user", 404);
        }
        const isRefreshTokenValid = await bcrypt.compare(refreshToken, user.refreshToken);
        if (!isRefreshTokenValid) {
            throw new UnauthorizedException('Not Compared');
        }
        const payload = { username: user.username, userId: user._id };
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
