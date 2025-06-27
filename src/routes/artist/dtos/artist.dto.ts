import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";
import { AbstractDto } from "src/shared";


export class ArtistDto extends AbstractDto {
    @ApiProperty()
    @IsString()
    name: string;

    @ApiProperty()
    @IsString()
    bio: string;
}