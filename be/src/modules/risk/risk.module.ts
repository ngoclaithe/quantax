import { Module } from '@nestjs/common';
import { ExposureService } from './exposure.service';
import { RiskAssessmentService } from './risk-assessment.service';

@Module({
    providers: [ExposureService, RiskAssessmentService],
    exports: [ExposureService, RiskAssessmentService],
})
export class RiskModule { }
