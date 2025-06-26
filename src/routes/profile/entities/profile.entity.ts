import { IsBoolean, IsString } from 'class-validator';
import { AbstractEntity } from 'src/shared';
import { Column, Entity, JoinColumn, OneToMany, OneToOne } from 'typeorm';
import { User } from 'src/routes/user/entities/user.entity';
import { Favoris } from '../../favoris/entities/favoris.entity';
import { Order } from '../../order/entities/order.entity';

@Entity('profile')
export class Profile extends AbstractEntity {
  @Column()
  @IsString()
  firstName: string;

  @Column()
  @IsString()
  lastName: string;

  @Column()
  @IsString()
  adress: string;

  @Column()
  @IsString()
  city: string;

  @Column()
  @IsString()
  postalCode: string;

  @Column({ default: false })
  @IsBoolean()
  isEmailSubscriber: boolean;

  @OneToOne(() => User, user => user.profile, { onDelete: 'CASCADE' })
  @JoinColumn()
  user: User;

  @OneToMany(() => Favoris, favoris => favoris.profile, { cascade: true })
  favoris: Favoris[];

  @OneToMany(() => Order, order => order.profile, { cascade: true })
  orders: Order[];

}
