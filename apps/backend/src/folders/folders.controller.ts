import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
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
import { RequireScopes } from "../oidc/guards/scopes.decorator";
import { CurrentUser } from "../oidc/decorators/current-user.decorator";
import type { AuthenticatedUser } from "../oidc/interfaces/oidc.interface";

@Controller("folders")
@UseGuards(OidcGuard)
export class FoldersController {
  constructor(
    private readonly foldersService: FoldersService,
    @Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: LoggerService,
  ) {}

  /**
   * 새로운 폴더 생성
   * POST /folders
   */
  @Post()
  @RequireScopes("folders:write")
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() requestDto: CreateFolderRequestDto, @CurrentUser() user: AuthenticatedUser) {
    this.logger.log(`POST /folders - 새로운 폴더 생성 요청: ${requestDto.folderName}`);

    const responseDto = await this.foldersService.create(requestDto.teamUuid, requestDto.folderName, user.userId);

    return ResponseBuilder.success<FolderResponseDto>()
      .status(HttpStatus.CREATED)
      .message("폴더가 성공적으로 생성되었습니다.")
      .data(responseDto)
      .build();
  }

  /**
   * 특정 팀의 모든 폴더 조회
   * GET /folders?teamUuid={teamUuid}
   */
  @Get()
  @RequireScopes("folders:read")
  async findAllByTeam(@Query("teamUuid", ParseUUIDPipe) teamUuid: string, @CurrentUser() user: AuthenticatedUser) {
    this.logger.log(`GET /folders?teamUuid=${teamUuid} - 특정 팀의 모든 폴더 조회 요청`);

    const responseDtos = await this.foldersService.findAllByTeam(teamUuid, user.userId);

    return ResponseBuilder.success<FolderResponseDto[]>()
      .status(HttpStatus.OK)
      .message("폴더들을 성공적으로 조회했습니다.")
      .data(responseDtos)
      .build();
  }

  /**
   * 특정 폴더 조회
   * GET /folders/:folderUuid
   */
  @Get(":folderUuid")
  @RequireScopes("folders:read")
  async findOne(@Param("folderUuid", ParseUUIDPipe) folderUuid: string, @CurrentUser() user: AuthenticatedUser) {
    this.logger.log(`GET /folders/${folderUuid} - 특정 폴더 조회 요청`);

    const responseDto = await this.foldersService.findOne(folderUuid, user.userId);

    return ResponseBuilder.success<FolderResponseDto>()
      .status(HttpStatus.OK)
      .message("폴더 정보를 성공적으로 조회했습니다.")
      .data(responseDto)
      .build();
  }

  /**
   * 특정 폴더 이름 수정
   * PATCH /folders/:folderUuid
   */
  @Patch(":folderUuid")
  @RequireScopes("folders:write")
  async update(
    @Param("folderUuid", ParseUUIDPipe) folderUuid: string,
    @Body() requestDto: UpdateFolderRequestDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    this.logger.log(`PATCH /folders/${folderUuid} - 특정 폴더 이름 수정 요청`);

    const responseDto = await this.foldersService.update(folderUuid, requestDto, user.userId);

    return ResponseBuilder.success<FolderResponseDto>()
      .status(HttpStatus.OK)
      .message("폴더 이름이 성공적으로 수정되었습니다.")
      .data(responseDto)
      .build();
  }

  /**
   * 특정 폴더 삭제
   * DELETE /folders/:folderUuid
   */
  @Delete(":folderUuid")
  @RequireScopes("folders:write")
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param("folderUuid", ParseUUIDPipe) folderUuid: string, @CurrentUser() user: AuthenticatedUser) {
    this.logger.log(`DELETE /folders/${folderUuid} - 특정 폴더 삭제 요청`);

    await this.foldersService.remove(folderUuid, user.userId);

    // 204 No Content는 Response Body 없음
    return;
  }
}
