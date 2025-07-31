import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength, MaxLength, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateProfileDto } from '../../profile/dto/create-profile.dto';

export class CreateUserDto {
  @IsEmail()
  @MaxLength(100)
  email: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(24)
  username: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(100)
  password: string;
  
  @IsOptional()
  @ValidateNested() 
  @Type(() => CreateProfileDto)
  profile?: CreateProfileDto;
}