import { HttpException, Injectable, UnauthorizedException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { PassportStrategy } from "@nestjs/passport";
import { Model } from "mongoose";
import { ExtractJwt, Strategy } from "passport-jwt";
import { UserService } from "src/api/user/user.service";
import { JwtPayLoad } from "src/interfaces/jwt.payload.interface";
import { User } from "src/schemas/user.schema";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, "jwt") {
    constructor(@InjectModel(User.name) private usermodel: Model<User>,
        private readonly userservice: UserService) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), // Extracts the JWT from the Authorization header
            secretOrKey: 'abc123',
        });
    }
    async validate(payload: JwtPayLoad): Promise<User> {
        const { userId} = payload;
        const user = await this.usermodel.findById({_id: userId});
        if(!user) throw new UnauthorizedException();
        return user;
    }
}