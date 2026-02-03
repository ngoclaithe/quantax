import { IsString, IsNotEmpty, IsNumber, IsEnum, Min } from 'class-validator';

export class FollowTraderDto {
    @IsString()
    @IsNotEmpty()
    traderId: string;

    @IsEnum(['FIXED', 'PERCENT'])
    copyType: 'FIXED' | 'PERCENT';

    @IsNumber()
    @Min(1)
    value: number;

    @IsNumber()
    @Min(1)
    maxAmount: number;
}

export class UnfollowTraderDto {
    @IsString()
    @IsNotEmpty()
    traderId: string;
}
