import { Injectable } from '@nestjs/common';
import { ConfigService as NestConfigService } from '@nestjs/config';

@Injectable()
export class ConfigService {
  constructor(private configService: NestConfigService) {}

  get<T = string>(key: string, defaultValue?: T): T {
    const value = this.configService.get<string>(key);
    if (value === undefined && defaultValue !== undefined) {
      return defaultValue as T;
    }
    return (value as T) ?? defaultValue!;
  }

  getOrThrow<T = string>(key: string): T {
    const value = this.configService.get<string>(key);
    if (value === undefined) {
      throw new Error(`Configuration key "${key}" is not defined`);
    }
    return value as T;
  }
}
