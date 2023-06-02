import {
  Controller,
  Get,
  HttpStatus,
  Post,
  Res,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { AppService } from './app.service';
import { FilesInterceptor } from '@nestjs/platform-express';
import { exec } from 'child_process';
import { Response } from 'express';
import { createReadStream } from 'fs';
import { join } from 'path';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Post('upload')
  @UseInterceptors(FilesInterceptor('files'))
  uploadFile(
    @UploadedFiles() files: Array<Express.Multer.File>,
    @Res() response: Response,
  ) {
    const img2pdf_opts = files.map((file) => file.path).join(' ');

    const img2pdf = exec(`img2pdf ${img2pdf_opts} -o out.pdf`);

    img2pdf.on('exit', () => {
      const ocrmypdf = exec('ocrmypdf out.pdf out.pdf');

      ocrmypdf.on('exit', () => {
        const file = createReadStream(join(process.cwd(), 'out.pdf'));
        file.pipe(response);
      });
    });
  }
}
