import { Injectable } from '@nestjs/common';
import { renderFile } from 'pug';

@Injectable()
export class AppService {
  getHello(): string {
    return renderFile(`${__dirname}/../templates/index.pug`);
  }
}
