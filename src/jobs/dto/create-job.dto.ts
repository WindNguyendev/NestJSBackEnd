import { Type } from "class-transformer";
import { IsArray, IsBoolean, IsDate, IsDateString, IsMongoId, IsNotEmpty, IsNumber, IsString, MinDate, ValidateNested } from "class-validator";
import mongoose from "mongoose";


class Company {
    @IsMongoId()
    @IsString()
    @IsNotEmpty()
    _id: mongoose.Schema.Types.ObjectId;
}
export class CreateJobDto {
    name?: string;

    @IsArray()
    @IsString({ each: true })
    skills?: string[];

    @ValidateNested()
    @Type(() => Company)
    company: Company;  

    @IsNumber()
    salary?: number;

    @IsNumber()
    quantity?: number;

    @IsString()
    level?: string;

    @IsString()
    description?: string;

    @IsDateString()
    startDate?: Date;

    @IsDateString()
    @MinDate(new Date(), { message: 'End date must be after current date' })
    endDate?: Date;

    @IsBoolean()
    isActive?: boolean;
}

