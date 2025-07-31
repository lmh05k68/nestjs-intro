import { PartialType } from "@nestjs/mapped-types";
import { CreateTweetDto } from "./create-tweet.dto";
import { IsInt, IsNotEmpty } from "class-validator";

export class updateTweetDto extends PartialType(CreateTweetDto){
    @IsInt()
    @IsNotEmpty()
    id: number; 
}