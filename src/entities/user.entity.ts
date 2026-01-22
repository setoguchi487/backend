import {
        Entity,
        Column,
        PrimaryGeneratedColumn,
        CreateDateColumn,
        UpdateDateColumn
} from 'typeorm'

@Entity()
export class User {
        @PrimaryGeneratedColumn()
        readonly id: number;
        @Column({ type: 'varchar', unique: true })
        name: string;
        @Column('varchar')
        hash: string;
        @Column({ type: 'varchar', unique: true })
        email: string;
        @CreateDateColumn()
        readonly created_at?: Date;
        @UpdateDateColumn()
        readonly updated_at?: Date;
}