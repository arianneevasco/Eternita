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
import { ZodValidationPipe } from "../common/zod-validation.pipe";
import {
  createEntrySchema,
  editEntrySchema,
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
  create(
    @Req() request: any,
    @Body(new ZodValidationPipe(createEntrySchema))
    body: CreateEntryDto
  ) {
    return this.diaryService.createEntry(
      request.uid,
      body
    );
  }

  @Get()
  list(@Req() request: any) {
    return this.diaryService.listEntries(request.uid);
  }

  @Get(":entryId")
  getOne(
    @Req() request: any,
    @Param("entryId") entryId: string
  ) {
    return this.diaryService.getEntry(
      request.uid,
      entryId
    );
  }

  @Patch(":entryId")
  edit(
    @Req() request: any,
    @Param("entryId") entryId: string,
    @Body(new ZodValidationPipe(editEntrySchema))
    body: EditEntryDto
  ) {
    return this.diaryService.editEntry(
      request.uid,
      entryId,
      body
    );
  }

  @Patch(":entryId/favorite")
  favorite(
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
  hide(
    @Req() request: any,
    @Param("entryId") entryId: string
  ) {
    return this.diaryService.hideEntry(
      request.uid,
      entryId
    );
  }

  @Get(":entryId/versions")
  versions(
    @Req() request: any,
    @Param("entryId") entryId: string
  ) {
    return this.diaryService.listVersions(
      request.uid,
      entryId
    );
  }
}