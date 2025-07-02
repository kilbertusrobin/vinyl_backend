import { Artist } from '../entities/artist.entity';
import { ArtistDto } from '../dtos/artist.dto';
import { CreateArtistDto } from '../dtos/create-artist.dto';

export class ArtistMapper {
  static toGetDto(artist: Artist): ArtistDto {
    const dto = new ArtistDto();
    dto.id = artist.id;
    dto.name = artist.name;
    dto.bio = artist.bio;
    dto.createdAt = artist.createdAt;
    dto.updatedAt = artist.updatedAt;
    return dto;
  }

  static toEntity(dto: ArtistDto): Artist {
    const artist = new Artist();
    artist.id = dto.id;
    artist.name = dto.name;
    artist.bio = dto.bio;
    artist.createdAt = dto.createdAt;
    artist.updatedAt = dto.updatedAt;
    return artist;
  }

  static fromCreateDto(dto: CreateArtistDto): Artist {
    const artist = new Artist();
    artist.name = dto.name;
    artist.bio = dto.bio;
    return artist;
  }
}
