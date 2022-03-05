import { Injectable } from '@nestjs/common';
import { ProfilePictureDTO } from './dto/profile-picture-dto';
import { InjectRepository } from '@nestjs/typeorm';
import { PublicFile } from './entity/public-file';
import { Repository } from 'typeorm';
import { v4 as uuid } from 'uuid';
import { S3 } from 'aws-sdk';

@Injectable()
export class FilesService {
  constructor(
    @InjectRepository(PublicFile)
    private publicFilesRepository: Repository<PublicFile>,
  ) {}

  async uploadFileToS3(
    dataBuffer: Buffer,
    filename: string,
    contentType: string,
  ) {
    const s3 = new S3({
      endpoint: `https://${process.env.BUCKET_REGION}.linodeobjects.com/`,
    });

    const uploadResult = await s3
      .upload({
        Bucket: process.env.BUCKET_NAME,
        Key: `${uuid()}-${filename}`,
        Body: dataBuffer,
        ACL: 'public-read',
        ContentType: contentType,
      })
      .promise();

    return uploadResult;
  }

  async deletePublicFile(fileId: number) {
    const file = await this.publicFilesRepository.findOne({ id: fileId });

    const s3 = new S3({
      endpoint: `https://${process.env.BUCKET_REGION}.linodeobjects.com/`,
    });

    await s3
      .deleteObject({
        Bucket: process.env.BUCKET_NAME,
        Key: file.key,
      })
      .promise();

    await this.publicFilesRepository.delete(fileId);
  }

  async createProfilePicture({ key, url }: ProfilePictureDTO) {
    const createdProfilePicture = this.publicFilesRepository.create({
      key,
      url,
    });
    await this.publicFilesRepository.save(createdProfilePicture);

    return createdProfilePicture;
  }
}
