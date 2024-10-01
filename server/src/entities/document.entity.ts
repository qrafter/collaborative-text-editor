import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import User from "./user.entity";

@Entity({ name: "documents" })
class Document {
  @PrimaryGeneratedColumn("uuid")
  id: string;
  
  @Column({ type: "text", default: '' })
  name: string;

  @Column({ type: "text", default: '' })
  content: string;

  @Column({ type: "bytea", default: null })
  snapshot: Buffer;

  @ManyToOne(() => User, user => user.ownedDocuments, { eager: true })  // Add eager: true here
  owner: User;

  @DeleteDateColumn({ nullable: true })
  deletedAt?: Date;

  @CreateDateColumn({
    type: "timestamp",
    default: () => "CURRENT_TIMESTAMP(6)",
  })
  createdAt: Date;

  @UpdateDateColumn({
    type: "timestamp",
    default: () => "CURRENT_TIMESTAMP(6)",
  })
  updatedAt: Date;
}

export default Document;