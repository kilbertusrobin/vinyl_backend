import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn
} from 'typeorm';
import { Profile } from '../../profile/entities/profile.entity';
import { AbstractEntity } from 'src/shared';

@Entity('recommendation')
export class Recommendation extends AbstractEntity {

  @Column({ name: 'historique_achat', type: 'text', nullable: true })
  historicAchat: string;

  @Column({ name: 'categorie_fav', type: 'varchar', length: 255, nullable: true })
  categoryFav: string;

  @Column({ name: 'artiste_fav', type: 'varchar', length: 255, nullable: true })
  artistFav: string;

  @Column({ name: 'article_fav', type: 'varchar', length: 255, nullable: true })
  productFav: string;

  @OneToOne(() => Profile, (profile) => profile.recommendation, {
    cascade: true,
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'profile_id' })
  profile: Profile;

}
