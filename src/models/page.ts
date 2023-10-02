import { BaseEntity, generateEntityId } from "@medusajs/medusa";
import { Entity, PrimaryGeneratedColumn, Column, BeforeInsert } from "typeorm";
import { IsNotEmpty, IsIn, Length } from "class-validator";

@Entity()
export class Page extends BaseEntity {
  @Column({ type: "text", nullable: false })
  @IsNotEmpty({ message: "Content is required" })
  content: string;

  @Column({ type: "varchar", length: 255, nullable: false })
  @IsNotEmpty({ message: "Name is required" })
  @Length(1, 255, { message: "Name must be between 1 and 255 characters" })
  name: string;

  @Column({ type: "varchar", length: 255, unique: true, nullable: false })
  handle: string;

  @Column({ type: "enum", enum: ["publish", "draft"], default: "draft" })
  @IsIn(["publish", "draft"], { message: "Invalid status" })
  status: "publish" | "draft";

  @BeforeInsert()
  generateHandleFromName() {
    // Generate handle from the name by converting to lowercase and replacing spaces with hyphens
    this.handle = this.name.toLowerCase().replace(/\s+/g, "-");
  }

  @BeforeInsert()
  generateId() {
    // Generate the id using the generateEntityId function
    this.id = generateEntityId(this.id, "page");
  }
}
