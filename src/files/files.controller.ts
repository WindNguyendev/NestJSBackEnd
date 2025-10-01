import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UploadedFile,
  UseInterceptors,
  HttpStatus,
} from '@nestjs/common';
import { FilesService } from './files.service';
import { UpdateFileDto } from './dto/update-file.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { User } from 'src/decorator/coustomize';
import { IUser } from 'src/users/users.interface';
import { ParseFilePipeBuilder } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Controller('files')
export class FilesController {
  constructor(
    private readonly filesService: FilesService,
    private readonly configService: ConfigService,
  ) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: (req, file, cb) => {
        cb(null, 'public/images/');
      },
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, 'file-' + uniqueSuffix + '-' + file.originalname);
      },
    }),
  }))
  uploadFile(@UploadedFile(
    new ParseFilePipeBuilder()
    .addMaxSizeValidator({ maxSize: 1024 * 1024 * 5 })
    
      .build({
        errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
      })
  ) file: Express.Multer.File, @User() user: IUser) {
    const baseUrl = this.configService.get<string>('BASE_URL') || '';
    return {
      message: 'File uploaded successfully',
      url: `${baseUrl}/images/${file.filename}`,
      filename: file.filename,
    };
  }

  @Get()
  findAll() {
    return this.filesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.filesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateFileDto: UpdateFileDto) {
    return this.filesService.update(+id, updateFileDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.filesService.remove(+id);
  }
}
