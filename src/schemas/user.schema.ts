import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

export type UserDocument = User & Document;
@Schema()
export class User {

    @Prop({ unique: true })
    email: string;

    @Prop({ unique: true })
    username: string;

    @Prop()
    password: string;

    @Prop({ default: false })
    isVerified: boolean;

    @Prop()
    otp: string;

    @Prop()
    otpExpires: Date;

    @Prop({ nullable: true })
    refreshToken: string;
}

export const UserSchema = SchemaFactory.createForClass(User);