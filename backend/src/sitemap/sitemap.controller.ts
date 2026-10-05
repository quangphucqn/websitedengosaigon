import { Controller, Get, Header, Res } from '@nestjs/common';
import type { Response } from 'express';
import { Public } from '../common/public.decorator';
import { SitemapService } from './sitemap.service';

@Controller()
export class SitemapController {
  constructor(private readonly sitemapService: SitemapService) {}

  @Public()
  @Get('sitemap.xml')
  @Header('Content-Type', 'application/xml; charset=utf-8')
  @Header('Cache-Control', 'public, max-age=3600, s-maxage=3600')
  async getSitemap(@Res() res: Response) {
    const xml = await this.sitemapService.generateXml();
    res.type('application/xml; charset=utf-8').send(xml);
  }
}
