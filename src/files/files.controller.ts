import { Controller, Get, Post, Body, Patch, Param, Delete, UploadedFile, UseInterceptors, HttpStatus } from '@nestjs/common';
import { FilesService } from './files.service';
import { CreateFileDto } from './dto/create-file.dto';
import { UpdateFileDto } from './dto/update-file.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { User } from 'src/decorator/coustomize';
import { IUser } from 'src/users/users.interface';
import { ParseFilePipeBuilder } from '@nestjs/common';

@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) { }

  @Post("upload")
  @UseInterceptors(FileInterceptor('file'))
  uploadFile(@UploadedFile(
    new ParseFilePipeBuilder()
    .addMaxSizeValidator({ maxSize: 1024 * 1024 * 5 })
    
      .build({
        errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
      })
  ) file: Express.Multer.File, @User() user: IUser) {
    return {
      message: 'File uploaded successfully',
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
