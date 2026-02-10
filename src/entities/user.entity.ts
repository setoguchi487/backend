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
        @Column({ type: 'date', nullable: true })
        birthday?: Date;
        @Column({ type: 'text', nullable: true })
        profile?: string;
        @CreateDateColumn()
        readonly created_at?: Date;
        @UpdateDateColumn()
        readonly updated_at?: Date;
}