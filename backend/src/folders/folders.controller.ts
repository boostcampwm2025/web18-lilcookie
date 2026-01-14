import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpStatus,
  HttpCode,
  Inject,
  type LoggerService,
} from "@nestjs/common";
import { WINSTON_MODULE_NEST_PROVIDER } from "nest-winston";
import { FoldersService } from "./folders.service";
import { ResponseBuilder } from "../common/builders/response.builder";
import { CreateFolderRequestDto } from "./dto/create-folder.request.dto";
import { UpdateFolderRequestDto } from "./dto/update-folder.request.dto";
import { FolderResponseDto } from "./dto/folder.response.dto";

@Controller("folders")
export class FoldersController {
  constructor(
    private readonly foldersService: FoldersService,
    @Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: LoggerService,
  ) {}

  // 폴더 생성
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() requestDto: CreateFolderRequestDto) {
    this.logger.log(`POST /api/folders - 폴더 생성 요청: ${requestDto.folderName}`);

    const folder = await this.foldersService.create(requestDto);
    const responseDto = FolderResponseDto.from(folder);

    return ResponseBuilder.success<FolderResponseDto>()
      .status(HttpStatus.CREATED)
      .message("폴더가 성공적으로 생성되었습니다")
      .data(responseDto)
      .build();
  }

  // 팀의 모든 폴더 조회
  @Get()
  async findAllByTeam(@Query("teamId") teamId: string) {
    this.logger.log(`GET /api/folders?teamId=${teamId} - 폴더 목록 조회`);

    const folders = await this.foldersService.findAllByTeam(teamId);
    const responseDtos = folders.map((folder) => FolderResponseDto.from(folder));

    return ResponseBuilder.success<FolderResponseDto[]>()
      .status(HttpStatus.OK)
      .message("폴더 목록을 성공적으로 조회했습니다")
      .data(responseDtos)
      .build();
  }

  // 특정 폴더 조회
  @Get(":folderId")
  async findOne(@Param("folderId") folderId: string) {
    this.logger.log(`GET /api/folders/${folderId} - 폴더 단건 조회`);

    const folder = await this.foldersService.findOne(folderId);
    const responseDto = FolderResponseDto.from(folder);

    return ResponseBuilder.success<FolderResponseDto>()
      .status(HttpStatus.OK)
      .message("폴더를 성공적으로 조회했습니다")
      .data(responseDto)
      .build();
  }

  // 폴더의 하위 폴더 조회
  @Get(":folderId/subfolders")
  async findSubfolders(@Param("folderId") folderId: string) {
    this.logger.log(`GET /api/folders/${folderId}/subfolders - 하위 폴더 조회`);

    const subfolders = await this.foldersService.findSubfolders(folderId);
    const responseDtos = subfolders.map((folder) => FolderResponseDto.from(folder));

    return ResponseBuilder.success<FolderResponseDto[]>()
      .status(HttpStatus.OK)
      .message("하위 폴더를 성공적으로 조회했습니다")
      .data(responseDtos)
      .build();
  }

  // 폴더 이름 수정
  @Put(":folderId")
  async update(@Param("folderId") folderId: string, @Body() requestDto: UpdateFolderRequestDto) {
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
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param("folderId") folderId: string) {
    this.logger.log(`DELETE /api/folders/${folderId} - 폴더 삭제`);

    await this.foldersService.remove(folderId);

    // 204 No Content는 Response Body 없음
    return;
  }
}
