import { ApiProperty } from "@nestjs/swagger";
import { AbstractDto } from "src/shared";
import { IsEmail } from 'class-validator';


export class UserDto extends AbstractDto {
    @ApiProperty()
    @IsEmail()
    email: string;
}