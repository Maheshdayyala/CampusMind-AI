import { Injectable, PipeInterface, ArgumentMetadata } from '@nitrostack/core';
import { ZodSchema, ZodError } from 'zod';

@Injectable()
export class ZodValidationPipe implements PipeInterface {
  async transform(value: unknown, metadata: ArgumentMetadata): Promise<unknown> {
    return value;
  }
}