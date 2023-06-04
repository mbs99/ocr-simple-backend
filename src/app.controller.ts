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
import { createReadStream, unlink } from 'fs';
import { join } from 'path';
import { temporaryFile } from 'tempy';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getApp(): string {
    return this.appService.getHello();
  }

  @Post('upload')
  @UseInterceptors(FilesInterceptor('files', 5, { dest: './uploads' }))
  uploadFile(
    @UploadedFiles() files: Array<Express.Multer.File>,
    @Res() response: Response,
  ) {
    const tempfile = temporaryFile({ extension: 'pdf' });

    const img2pdf_opts = files.map((file) => file.path).join(' ');

    const img2pdf = exec(`img2pdf ${img2pdf_opts} -o ${tempfile}`);

    img2pdf.on('exit', (code) => {
      if (0 == code) {
        const ocrmypdf = exec('ocrmypdf -l deu ${tempfile} ${tempfile}');

        ocrmypdf.on('exit', (code) => {
          if (0 == code) {
            const result = createReadStream(join(process.cwd(), tempfile));
            result.on('end', () => {
              unlink(tempfile, () => {
                // file deleted
              });
            });
            result.pipe(response);
          } else {
            response.status(HttpStatus.INTERNAL_SERVER_ERROR).send();
          }
        });
      } else {
        response.status(HttpStatus.INTERNAL_SERVER_ERROR).send();
      }
    });
  }
}
