import { Injectable, Logger } from '@nestjs/common';
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
}
