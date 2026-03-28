import { Injectable } from '@nestjs/common';
import { ConfigService } from '../../config/config.service';
import * as AWS from '@aws-sdk/client-s3';

@Injectable()
export class S3Service {
  private client: AWS.S3Client;
  private bucket: string;

  constructor(private configService: ConfigService) {
    this.client = new AWS.S3Client({
      endpoint: this.configService.get('s3.endpoint'),
      region: this.configService.get('s3.region'),
      credentials: {
        accessKeyId: this.configService.get('s3.accessKey'),
        secretAccessKey: this.configService.get('s3.secretKey'),
      },
      forcePathStyle: true,
    });
    this.bucket = this.configService.get('s3.bucket');
  }

  async upload(key: string, body: Buffer, contentType: string): Promise<string> {
    const command = new AWS.PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      Body: body,
      ContentType: contentType,
    });

    await this.client.send(command);
    return key;
  }

  async getSignedUrl(key: string, expiresIn = 3600): Promise<string> {
    const command = new AWS.GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    return `https://${this.bucket}.${this.configService.get('s3.endpoint')}/${key}`;
  }

  async delete(key: string): Promise<void> {
    const command = new AWS.DeleteObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    await this.client.send(command);
  }
}
