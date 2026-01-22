import { Link } from "../entities/link.entity";

export interface ILinkRepository {
  create(link: Omit<Link, "id" | "uuid">): Promise<Link>;
  findAll(teamId?: number, tags?: string[], createdAfter?: Date): Promise<Link[]>;
  findOne(uuid: string): Promise<Link | null>;
  remove(uuid: string): Promise<boolean>;
}
