import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Logger,
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

    this.logger.log(form);

    const tempfile = (await import('tempfile')).default;
    const imagesPdfFile = tempfile({ extension: 'pdf' });
    this.logger.log(imagesPdfFile);

    const filePageMap = new Map<number, string>();
    files.forEach((file) => {
      const name = file.originalname;
      filePageMap.set(form[name], name);
    });

    const sortedFilePageMap = new Map([...filePageMap.entries()].sort());


    const img2pdf_opts = files.map((file) => file.path).join(' ');

    const img2pdf = exec(
      `img2pdf ${img2pdf_opts} -o ${imagesPdfFile}`,
      (error, stdout, stderr) => {
        if (error) {
          this.logger.log('STDOUT:', stdout, ', STDERR:', stderr);
        }
      },
    );

    img2pdf.on('exit', (code) => {
      if (0 == code) {
        const ocrmypdfCmdline = `ocrmypdf -l deu ${imagesPdfFile} ${imagesPdfFile}`;
        console.log(ocrmypdfCmdline);
        const ocrmypdf = exec(ocrmypdfCmdline, (error, stdout, stderr) => {
          if (error) {
            this.logger.log('STDOUT:', stdout, ', STDERR:', stderr);
          }
        });

        ocrmypdf.on('exit', (code) => {
          if (0 == code) {
            const result = createReadStream(imagesPdfFile);
            result.on('end', () => {
              unlink(imagesPdfFile, () => {
                /* deleted */
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
