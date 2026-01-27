import { LinkWithCreator, CreateLinkInput, UpdateLinkInput, LinkSearchCriteria } from "../types/link.types";

export interface ILinkRepository {
  create(data: CreateLinkInput): Promise<LinkWithCreator>;
  findAll(criteria: LinkSearchCriteria): Promise<LinkWithCreator[]>;
  findByUuid(linkUuid: string): Promise<LinkWithCreator | null>;
  update(linkId: number, data: UpdateLinkInput): Promise<LinkWithCreator | null>;
  remove(linkId: number): Promise<boolean>;
}
