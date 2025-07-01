import { CreateArtistDto } from '../dtos/create-artist.dto';
import { Artist } from '../entities/artist.entity';

export class CreateArtistMapper {
  static toGetDto(artist: Artist): CreateArtistDto {
    const dto = new CreateArtistDto();
    dto.name = artist.name;
    dto.bio = artist.bio;
    return dto;
  }

  static toEntity(dto: CreateArtistDto): Artist {
    const artist = new Artist();
    artist.name = dto.name;
    artist.bio = dto.bio;
    return artist;
  }
}
