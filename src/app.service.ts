import { Injectable, Logger } from '@nestjs/common';
import { renderFile } from 'pug';

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);
  getIndex(): string {
    return renderFile(`${__dirname}/../templates/index.pug`);
  }
}
