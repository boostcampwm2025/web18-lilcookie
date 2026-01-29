// apps/api/src/folders/folder.dto.ts
import { createZodDto } from "nestjs-zod";
import {
  CreateFolderRequestSchema,
  PatchFolderRequestSchema,
  FolderResponseDataSchema,
} from "./folder.schema.js";

export class CreateFolderDto extends createZodDto(CreateFolderRequestSchema) {}

export class PatchFolderDto extends createZodDto(PatchFolderRequestSchema) {}

export class FolderResponseDto extends createZodDto(FolderResponseDataSchema) {}
