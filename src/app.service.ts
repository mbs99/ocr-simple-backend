import { Injectable, Logger } from '@nestjs/common';
import { exec } from 'child_process';
import { ReadStream, createReadStream, unlink } from 'fs';
import { LocalsObject, renderFile } from 'pug';

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);
  getIndex(): string {
    const params: LocalsObject = {
      title: 'ocr-simple-backend',
    };

    return renderFile(`${__dirname}/../templates/index.pug`, params);
  }

  async ocrmypdf(
    files: Array<Express.Multer.File>,
    form: any,
  ): Promise<ReadStream> {
    const tempfile = (await import('tempfile')).default;
    return new Promise((resolve, reject) => {
      const imagesPdfFile = tempfile({ extension: 'pdf' });
      this.logger.log(imagesPdfFile);

      const filePageMap = new Map<number, Express.Multer.File>();
      files.forEach((file) => {
        const name = file.originalname;
        filePageMap.set(form[name], file);
      });

      const sortedFilePageMap = new Map([...filePageMap.entries()].sort());

      const img2pdf_opts = Array.from(sortedFilePageMap.values())
        .map((file) => file.path)
        .join(' ');

      const img2pdf = exec(
        `img2pdf ${img2pdf_opts} -o ${imagesPdfFile}`,
        (error, stdout, stderr) => {
          if (error) {
            this.logger.log('STDOUT:', stdout, ', STDERR:', stderr);
            reject(error);
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
              reject(error);
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
              resolve(result);
            } else {
              reject();
            }
          });
        } else {
          reject();
        }
      });
    });
  }
}
