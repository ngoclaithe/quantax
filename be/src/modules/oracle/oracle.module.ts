import { Module } from '@nestjs/common';
import { OracleService } from './oracle.service';
import { InternalOracleProvider } from './internal-oracle.provider';

@Module({
    providers: [OracleService, InternalOracleProvider],
    exports: [OracleService],
})
export class OracleModule { }
