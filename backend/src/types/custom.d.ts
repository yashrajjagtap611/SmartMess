import { Request } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';
import { ParsedQs } from 'qs';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: string;
      };
      file?: {
        buffer: Buffer;
        originalname: string;
        path: string;
      };
      connection?: {
        remoteAddress?: string;
      };
      socket?: {
        remoteAddress?: string;
      };
      headers: {
        [key: string]: string | undefined;
      };
      body: any;
      query: ParsedQs;
      params: ParamsDictionary;
    }
  }
}

export interface AuthRequest extends Request {
  user?: {
    id: string;
    role: string;
    firstName?: string;
    lastName?: string;
  };
  file?: Express.Multer.File;
}
