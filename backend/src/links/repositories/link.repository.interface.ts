import { Link } from "../entities/link.entity";

export interface ILinkRepository {
  create(link: Link): Promise<Link>;
  findAll(teamId?: string, tags?: string[], createdAfter?: Date): Promise<Link[]>;
  findOne(linkId: string): Promise<Link | null>;
  remove(linkId: string): Promise<boolean>;
}
