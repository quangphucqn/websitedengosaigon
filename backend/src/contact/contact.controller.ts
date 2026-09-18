import { Body, Controller, Get, Put } from '@nestjs/common';
import { Public } from '../common/public.decorator';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { ContactService } from './contact.service';
import { updateContactSchema, type UpdateContactDto } from './contact.dto';

@Controller('contact')
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  @Public()
  @Get()
  get() {
    return this.contactService.get();
  }

  @Put()
  update(
    @Body(new ZodValidationPipe(updateContactSchema))
    dto: UpdateContactDto,
  ) {
    return this.contactService.update(dto);
  }
}
