import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';


@Injectable()

export class MailService {
    private transporter: nodemailer.Transporter;

    constructor() {
        // dotenv.config();
        // console.log('Email User:', process.env.EMAIL_USER);
        // console.log('Email Password:', process.env.EMAIL_PASSWORD);
        // console.log('Initializing mail transporter...');
        this.transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com', // Your SMTP server
            port: 587, // or 465
            secure: false, // true for 465, false for other ports
            auth: {
                user: process.env.EMAIL_USER, // Use environment variable
                pass: process.env.EMAIL_PASSWORD, // Use environment variable
            },
        });
    }

    async sendOtpEmail(email: string, otp: string): Promise<void> {
        const mailOptions = {
            from: process.env.EMAIL_USER, // Sender address
            to: email, // List of recipients
            subject: 'Your OTP Code', // Subject line
            text: `Your OTP code is: ${otp}`, // Plain text body
            html: `<b>Your OTP code is: ${otp}</b>`, // HTML body
        };

        await this.transporter.sendMail(mailOptions);
    }
}
