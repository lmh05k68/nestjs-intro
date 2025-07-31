import { IsString, IsNotEmpty } from "class-validator";

export class CreateHashtagDto {
    
    @IsString()
    @IsNotEmpty()
    name: string;
}