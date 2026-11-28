import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
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
import { ApiBearerAuth, ApiBody, ApiCreatedResponse, ApiOperation, ApiTags } from "@nestjs/swagger";

@Controller("entries")
@UseGuards(AuthGuard)
@ApiTags("Diary entries")
@ApiBearerAuth()
export class DiaryController {
  constructor(
    private readonly diaryService: DiaryService
  ) {}

  @Post()
  @ApiOperation({ summary: "Create a diary entry" })
  @ApiBody({ schema: { type: "object", required: ["title", "originalText", "journal", "entryDate", "entryTime", "mood"], properties: { title: { type: "string", minLength: 1, maxLength: 200 }, originalText: { type: "string", minLength: 1, maxLength: 20000 }, journal: { type: "string", minLength: 1, maxLength: 100 }, entryDate: { type: "string", pattern: "^\\d{4}-\\d{2}-\\d{2}$" }, entryTime: { type: "string", pattern: "^\\d{2}:\\d{2}$" }, releaseDate: { type: "string" }, mood: { type: "integer", minimum: 1, maximum: 5 }, people: { type: "array", items: { type: "string" } }, tags: { type: "array", items: { type: "string" } }, isFavorite: { type: "boolean" }, isDraft: { type: "boolean", default: true }, writingMode: { type: "string", enum: ["verbatim", "lightfix", "review"] } } } })
  @ApiCreatedResponse({ description: "Entry document with generated identifiers, version and hash fields" })
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
    @Param("entryId") entryId: string,
    @Query("ownerUid") ownerUid?: string,
    @Query("access") access: "existence" | "summary" | "full" = "full",
  ) {
    return this.diaryService.getEntryForViewer(
      request.uid,
      ownerUid ?? request.uid,
      entryId,
      access,
    );
  }

  @Patch(":entryId")
  edit(
    @Req() request: any,
    @Param("entryId") entryId: string,
    @Body(new ZodValidationPipe(editEntrySchema))
    body: EditEntryDto,
  ) {
    return this.diaryService.editEntry(
      request.uid,
      request.uid,
      entryId,
      body
    );
  }

  @Post(":entryId/publish")
  publish(
    @Req() request: any,
    @Param("entryId") entryId: string,
  ) {
    return this.diaryService.publishDraft(request.uid, request.uid, entryId);
  }

  @Patch(":entryId/favorite")
  favorite(
    @Req() request: any,
    @Param("entryId") entryId: string,
    @Body() body: { isFavorite: boolean },
  ) {
    return this.diaryService.setFavorite(
      request.uid,
      request.uid,
      entryId,
      body.isFavorite
    );
  }

  @Delete(":entryId")
  hide(
    @Req() request: any,
    @Param("entryId") entryId: string,
  ) {
    return this.diaryService.hideEntry(
      request.uid,
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
