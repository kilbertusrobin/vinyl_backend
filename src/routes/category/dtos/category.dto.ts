import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";
import { AbstractDto } from "src/shared";

export class CategoryDto extends AbstractDto {
  @ApiProperty()
  @IsString()
  categoryName: string;
}
