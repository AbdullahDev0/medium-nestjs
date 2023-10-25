// gmail-account.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GmailAccounts } from './entities/gmail-account.entity';
import { CreateGmailAccountDTO } from './dtos/create-gmail-account.dto';
import { UpdateGmailAccountDTO } from './dtos/update-gmail-account.dto';

@Injectable()
export class GmailAccountService {
  constructor(
    @InjectRepository(GmailAccounts)
    private gmailAccountRepository: Repository<GmailAccounts>,
  ) {}

  async create(dto: CreateGmailAccountDTO): Promise<GmailAccounts> {
    const gmailAccount = this.gmailAccountRepository.create(dto);
    return await this.gmailAccountRepository.save(gmailAccount);
  }

  async update(id: string, dto: UpdateGmailAccountDTO): Promise<GmailAccounts> {
    await this.gmailAccountRepository.update(id, dto);
    return await this.gmailAccountRepository.findOne({ where: { id: id } });
  }
}
