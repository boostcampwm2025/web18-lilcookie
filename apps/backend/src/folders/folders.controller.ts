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
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from "@nestjs/swagger";
import { WINSTON_MODULE_NEST_PROVIDER } from "nest-winston";
import { FoldersService } from "./folders.service";
import { ResponseBuilder } from "../common/builders/response.builder";
import { OidcGuard } from "../oidc/guards/oidc.guard";
import { RequireScopes } from "../oidc/guards/scopes.decorator";
import { CurrentUser } from "../oidc/decorators/current-user.decorator";
import type { AuthenticatedUser } from "../oidc/interfaces/oidc.interface";
import { ZodValidationPipe } from "../common/zod-validation.pipe";
import {
  CreateFolderRequestSchema,
  PatchFolderRequestSchema,
  type CreateFolderRequest,
  type PatchFolderRequest,
} from "@repo/api";
import { FolderResponseDto } from "./dto/folder.response.dto";

@ApiTags("folders")
@Controller("folders")
@UseGuards(OidcGuard)
export class FoldersController {
  constructor(
    private readonly foldersService: FoldersService,
    @Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: LoggerService,
  ) {}

  @Post()
  @RequireScopes("folders:write")
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "폴더 생성", description: "새로운 폴더를 생성합니다" })
  @ApiResponse({ status: 201, description: "폴더가 성공적으로 생성되었습니다" })
  @ApiResponse({ status: 400, description: "잘못된 요청" })
  @ApiResponse({ status: 403, description: "권한 없음" })
  async create(
    @Body(new ZodValidationPipe(CreateFolderRequestSchema))
    requestDto: CreateFolderRequest,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    this.logger.log(`POST /folders - 새로운 폴더 생성 요청: ${requestDto.folderName}`);

    const responseDto = await this.foldersService.create(requestDto.teamUuid, requestDto.folderName, user.userId);

    return ResponseBuilder.success<FolderResponseDto>()
      .status(HttpStatus.CREATED)
      .message("폴더가 성공적으로 생성되었습니다.")
      .data(responseDto)
      .build();
  }

  @Get()
  @RequireScopes("folders:read")
  @ApiOperation({ summary: "특정 팀의 폴더 목록 조회", description: "특정 팀의 모든 폴더를 조회합니다" })
  @ApiQuery({ name: "teamUuid", type: String, description: "팀 UUID", required: true })
  @ApiResponse({ status: 200, description: "폴더 목록을 성공적으로 조회했습니다" })
  @ApiResponse({ status: 403, description: "권한 없음" })
  @ApiResponse({ status: 404, description: "팀을 찾을 수 없음" })
  async findAllByTeam(@Query("teamUuid", ParseUUIDPipe) teamUuid: string, @CurrentUser() user: AuthenticatedUser) {
    this.logger.log(`GET /folders?teamUuid=${teamUuid} - 특정 팀의 모든 폴더 조회 요청`);

    const responseDtos = await this.foldersService.findAllByTeam(teamUuid, user.userId);

    return ResponseBuilder.success<FolderResponseDto[]>()
      .status(HttpStatus.OK)
      .message("폴더들을 성공적으로 조회했습니다.")
      .data(responseDtos)
      .build();
  }

  @Get(":folderUuid")
  @RequireScopes("folders:read")
  @ApiOperation({ summary: "특정 폴더 조회", description: "폴더 UUID로 특정 폴더를 조회합니다" })
  @ApiParam({ name: "folderUuid", type: String, description: "폴더 UUID" })
  @ApiResponse({ status: 200, description: "폴더 정보를 성공적으로 조회했습니다" })
  @ApiResponse({ status: 403, description: "권한 없음" })
  @ApiResponse({ status: 404, description: "폴더를 찾을 수 없음" })
  async findOne(@Param("folderUuid", ParseUUIDPipe) folderUuid: string, @CurrentUser() user: AuthenticatedUser) {
    this.logger.log(`GET /folders/${folderUuid} - 특정 폴더 조회 요청`);

    const responseDto = await this.foldersService.findOne(folderUuid, user.userId);

    return ResponseBuilder.success<FolderResponseDto>()
      .status(HttpStatus.OK)
      .message("폴더 정보를 성공적으로 조회했습니다.")
      .data(responseDto)
      .build();
  }

  @Patch(":folderUuid")
  @RequireScopes("folders:write")
  @ApiOperation({ summary: "폴더 이름 수정", description: "특정 폴더의 이름을 수정합니다" })
  @ApiParam({ name: "folderUuid", type: String, description: "폴더 UUID" })
  @ApiResponse({ status: 200, description: "폴더 이름이 성공적으로 수정되었습니다" })
  @ApiResponse({ status: 400, description: "잘못된 요청" })
  @ApiResponse({ status: 403, description: "권한 없음" })
  @ApiResponse({ status: 404, description: "폴더를 찾을 수 없음" })
  async update(
    @Param("folderUuid", ParseUUIDPipe) folderUuid: string,
    @Body(new ZodValidationPipe(PatchFolderRequestSchema))
    requestDto: PatchFolderRequest,
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

  @Delete(":folderUuid")
  @RequireScopes("folders:write")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "폴더 삭제", description: "특정 폴더를 삭제합니다" })
  @ApiParam({ name: "folderUuid", type: String, description: "폴더 UUID" })
  @ApiResponse({ status: 204, description: "폴더가 성공적으로 삭제되었습니다" })
  @ApiResponse({ status: 403, description: "권한 없음" })
  @ApiResponse({ status: 404, description: "폴더를 찾을 수 없음" })
  async remove(@Param("folderUuid", ParseUUIDPipe) folderUuid: string, @CurrentUser() user: AuthenticatedUser) {
    this.logger.log(`DELETE /folders/${folderUuid} - 특정 폴더 삭제 요청`);

    await this.foldersService.remove(folderUuid, user.userId);

    // 204 No Content는 Response Body 없음
    return;
  }
}
