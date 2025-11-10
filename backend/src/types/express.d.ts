import { Request as ExpressRequest } from 'express';
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
      body: any;
      query: ParsedQs;
      params: ParamsDictionary;
    }
  }
}

export {};
