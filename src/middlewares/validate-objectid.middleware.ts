import { Injectable, NestMiddleware, HttpException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { Types } from 'mongoose';

@Injectable()
export class ValidateObjectIdMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const id = req.params.id; // assuming you're validating `id` from params
    const isValid = Types.ObjectId.isValid(id);

    if (!isValid) {
      throw new HttpException('Invalid ID', 404);
    }

    next();
  }
}
