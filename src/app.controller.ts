import {
  Body,
  Controller,
  Get,
  Logger,
  Post,
  Res,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { AppService } from './app.service';
import { FilesInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';

@Controller()
export class AppController {
  private readonly logger = new Logger(AppController.name);

  constructor(private readonly appService: AppService) {}

  @Get()
  getApp(): string {
    return this.appService.getIndex();
  }

  @Post('upload')
  @UseInterceptors(FilesInterceptor('files', 5, { dest: './uploads' }))
  async uploadFile(
    @UploadedFiles() files: Array<Express.Multer.File>,
    @Res() response: Response,
    @Body() form,
  ) {
    const resultStream = await this.appService.ocrmypdf(files, form);
    resultStream.pipe(response);
  }
}
