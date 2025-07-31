import { IsNotEmpty, IsString, MinLength, MaxLength, IsOptional, IsDate } from "class-validator";
import { Column } from "typeorm";

export class CreateProfileDto {
    @IsString({message: 'First name must be a string'})
    @IsNotEmpty()
    @IsOptional()
    @MinLength(3, { message: 'First name must be at least 3 characters long' })
    @MaxLength(100)
    firstName?: string;

    @IsString({message: 'First name must be a string'})
    @IsNotEmpty()
    @IsOptional()
    @MinLength(3, { message: 'First name must be at least 3 characters long' })
    @MaxLength(100)
    lastName?: string;

    @IsString({message: 'First name must be a string'})
    @IsOptional()
    @MaxLength(10)
    gender?: string;

    @IsOptional()
    @IsDate()
    dateOfBirth?: Date;

    @IsString()
    @IsOptional()
    bio: string;

    @IsString()
    @IsOptional()
    profileImage: string;
}