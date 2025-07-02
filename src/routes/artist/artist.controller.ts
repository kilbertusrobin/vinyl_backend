import { Controller, Get, Param, Post, Body, Patch, Delete, NotFoundException, ParseUUIDPipe, BadRequestException } from '@nestjs/common';
import { ArtistService } from './artist.service';
import { ArtistDto } from './dtos/artist.dto';
import { CreateArtistDto } from './dtos/create-artist.dto';
import { UpdateArtistDto } from './dtos/update-artist.dto';

@Controller('artists')
export class ArtistController {
  constructor(private readonly artistService: ArtistService) {}

  @Get()
  async findAll(): Promise<ArtistDto[]> {
    return this.artistService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.artistService.findOne(id);
  }

  @Post()
  async create(@Body() dto: CreateArtistDto): Promise<ArtistDto> {
    return this.artistService.create(dto);
  }

  @Patch('/:id')
  async update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateArtistDto): Promise<ArtistDto> {
    return this.artistService.update(id, dto);
  }

  @Delete('/:id')
  async delete(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.artistService.delete(id);
  }
}