import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  HttpStatus,
  HttpCode,
  Inject,
  type LoggerService,
  UseGuards,
  ParseUUIDPipe,
} from "@nestjs/common";
import { WINSTON_MODULE_NEST_PROVIDER } from "nest-winston";
import { FoldersService } from "./folders.service";
import { ResponseBuilder } from "../common/builders/response.builder";
import { CreateFolderRequestDto } from "./dto/create-folder.request.dto";
import { UpdateFolderRequestDto } from "./dto/update-folder.request.dto";
import { FolderResponseDto } from "./dto/folder.response.dto";
import { OidcGuard } from "../oidc/guards/oidc.guard";
import { TeamGuard } from "../oidc/guards/team.guard";
import { RequireScopes } from "../oidc/guards/scopes.decorator";
import { CurrentUser } from "src/oidc/decorators/current-user.decorator";
import type { AuthenticatedUser } from "src/oidc/interfaces/oidc.interface";

@Controller("folders")
@UseGuards(OidcGuard, TeamGuard)
export class FoldersController {
  constructor(
    private readonly foldersService: FoldersService,
    @Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: LoggerService,
  ) {}

  // 폴더 생성
  @Post()
  @RequireScopes("folders:write")
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateFolderRequestDto, @CurrentUser() user: AuthenticatedUser) {
    this.logger.log(`POST /api/folders - 폴더 생성 요청: ${dto.folderName}`);

    const folder = await this.foldersService.create(dto.teamUuid, dto.folderName, user.userId);
    const responseDto = FolderResponseDto.from(folder);

    return ResponseBuilder.success<FolderResponseDto>()
      .status(HttpStatus.CREATED)
      .message("폴더가 성공적으로 생성되었습니다")
      .data(responseDto)
      .build();
  }

  // 팀의 모든 폴더 조회
  @Get("team/:uuid")
  @RequireScopes("folders:read")
  async findAllByTeam(@Param("uuid", ParseUUIDPipe) teamUuid: string) {
    this.logger.log(`GET /api/folders?teamId=${teamUuid} - 폴더 목록 조회`);

    const folders = await this.foldersService.findAllByTeam(teamUuid);
    const responseDtos = folders.map((folder) => FolderResponseDto.from(folder));

    return ResponseBuilder.success<FolderResponseDto[]>()
      .status(HttpStatus.OK)
      .message("폴더 목록을 성공적으로 조회했습니다")
      .data(responseDtos)
      .build();
  }

  // 특정 폴더 조회
  @Get(":folderId")
  @RequireScopes("folders:read")
  async findOne(@Param("folderId", ParseUUIDPipe) folderId: string) {
    this.logger.log(`GET /api/folders/${folderId} - 폴더 단건 조회`);

    const folder = await this.foldersService.findOne(folderId);
    const responseDto = FolderResponseDto.from(folder);

    return ResponseBuilder.success<FolderResponseDto>()
      .status(HttpStatus.OK)
      .message("폴더를 성공적으로 조회했습니다")
      .data(responseDto)
      .build();
  }

  // 폴더 이름 수정
  @Put(":folderId")
  @RequireScopes("folders:write")
  async update(@Param("folderId", ParseUUIDPipe) folderId: string, @Body() requestDto: UpdateFolderRequestDto) {
    this.logger.log(`PUT /api/folders/${folderId} - 폴더 수정`);

    const folder = await this.foldersService.update(folderId, requestDto);
    const responseDto = FolderResponseDto.from(folder);

    return ResponseBuilder.success<FolderResponseDto>()
      .status(HttpStatus.OK)
      .message("폴더가 성공적으로 수정되었습니다")
      .data(responseDto)
      .build();
  }

  // 폴더 삭제
  @Delete(":folderId")
  @RequireScopes("folders:write")
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param("folderId", ParseUUIDPipe) folderId: string) {
    this.logger.log(`DELETE /api/folders/${folderId} - 폴더 삭제`);

    await this.foldersService.remove(folderId);

    // 204 No Content는 Response Body 없음
    return;
  }
}
