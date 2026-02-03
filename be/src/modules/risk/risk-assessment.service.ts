import { Injectable } from '@nestjs/common';
import { ExposureService } from './exposure.service';

@Injectable()
export class RiskAssessmentService {
    constructor(private exposureService: ExposureService) { }

    async assessRisk(): Promise<{ level: 'low' | 'medium' | 'high'; exposure: number }> {
        const exposure = Number(await this.exposureService.getTotalExposure());

        let level: 'low' | 'medium' | 'high' = 'low';
        if (exposure > 100000) level = 'high';
        else if (exposure > 50000) level = 'medium';

        return { level, exposure };
    }
}
