import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from "@nestjs/common";
import { DiaryService } from "./diary.service";
import { AuthGuard } from "../auth/auth.guard";
import {
  CreateEntryDto,
  EditEntryDto,
} from "./dto";

@Controller("entries")
@UseGuards(AuthGuard)
export class DiaryController {
  constructor(
    private readonly diaryService: DiaryService
  ) {}

  @Post()
  async create(
    @Req() request: any,
    @Body() body: CreateEntryDto
  ) {
    return this.diaryService.createEntry(
      request.uid,
      body
    );
  }

  @Get()
  async list(@Req() request: any) {
    return this.diaryService.listEntries(request.uid);
  }

  @Get(":entryId")
  async getOne(
    @Req() request: any,
    @Param("entryId") entryId: string
  ) {
    return this.diaryService.getEntry(
      request.uid,
      entryId
    );
  }

  @Patch(":entryId")
  async edit(
    @Req() request: any,
    @Param("entryId") entryId: string,
    @Body() body: EditEntryDto
  ) {
    return this.diaryService.editEntry(
      request.uid,
      entryId,
      body
    );
  }

  @Patch(":entryId/favorite")
  async favorite(
    @Req() request: any,
    @Param("entryId") entryId: string,
    @Body() body: { isFavorite: boolean }
  ) {
    return this.diaryService.setFavorite(
      request.uid,
      entryId,
      body.isFavorite
    );
  }

  @Delete(":entryId")
  async hide(
    @Req() request: any,
    @Param("entryId") entryId: string
  ) {
    return this.diaryService.hideEntry(
      request.uid,
      entryId
    );
  }

  @Get(":entryId/versions")
  async versions(
    @Req() request: any,
    @Param("entryId") entryId: string
  ) {
    return this.diaryService.listVersions(
      request.uid,
      entryId
    );
  }
}