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
import { ApiBadRequestResponse, ApiBearerAuth, ApiBody, ApiCreatedResponse, ApiOperation, ApiQuery, ApiResponse, ApiTags, ApiUnauthorizedResponse } from "@nestjs/swagger";
import { entryAccessSchema, EntryAccessDto, favoriteSchema, FavoriteDto } from "./access.dto";

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
  @ApiBadRequestResponse({ description: "Invalid request data" })
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
  @ApiOperation({ summary: "List the authenticated owner's visible diary entries" })
  @ApiResponse({ status: 200, description: "Array of visible entry documents" })
  @ApiUnauthorizedResponse({ description: "Missing, invalid, or expired Firebase ID token" })
  list(@Req() request: any) {
    return this.diaryService.listEntries(request.uid);
  }

  @Get(":entryId")
  @ApiOperation({ summary: "Get an entry under owner or policy-controlled access" })
  @ApiQuery({ name: "ownerUid", required: false, example: "owner-uid" })
  @ApiQuery({ name: "access", required: false, enum: ["existence", "summary", "full"], example: "full" })
  @ApiBadRequestResponse({ description: "Invalid access query value" })
  getOne(
    @Req() request: any,
    @Param("entryId") entryId: string,
    @Query("ownerUid") ownerUid?: string,
    @Query("access", new ZodValidationPipe(entryAccessSchema)) access: EntryAccessDto = "full",
  ) {
    return this.diaryService.getEntryForViewer(
      request.uid,
      ownerUid ?? request.uid,
      entryId,
      access,
    );
  }

  @Patch(":entryId")
  @ApiOperation({ summary: "Edit an unpublished draft entry" })
  @ApiResponse({ status: 200, schema: { example: { entryId: "entry-123", currentVersion: 2, updatedAt: "2026-11-28T10:30:00.000Z" } } })
  @ApiBadRequestResponse({ description: "Invalid request data" })
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
  @ApiOperation({ summary: "Publish a draft into the owner's append-only hash chain" })
  @ApiCreatedResponse({ schema: { example: { entryId: "entry-123", previousHash: "GENESIS", entryHash: "sha256-hex", sequence: 1, publishedAt: "2026-11-28T10:30:00.000Z" } } })
  publish(
    @Req() request: any,
    @Param("entryId") entryId: string,
  ) {
    return this.diaryService.publishDraft(request.uid, request.uid, entryId);
  }

  @Patch(":entryId/favorite")
  @ApiOperation({ summary: "Set an entry's favorite state" })
  @ApiBody({ schema: { type: "object", additionalProperties: false, required: ["isFavorite"], properties: { isFavorite: { type: "boolean", example: true } } } })
  @ApiResponse({ status: 200, schema: { example: { entryId: "entry-123", isFavorite: true } } })
  @ApiBadRequestResponse({ description: "Invalid request data" })
  favorite(
    @Req() request: any,
    @Param("entryId") entryId: string,
    @Body(new ZodValidationPipe(favoriteSchema)) body: FavoriteDto,
  ) {
    return this.diaryService.setFavorite(
      request.uid,
      request.uid,
      entryId,
      body.isFavorite
    );
  }

  @Delete(":entryId")
  @ApiOperation({ summary: "Hide an entry from the owner's visible diary list" })
  @ApiResponse({ status: 200, schema: { example: { entryId: "entry-123", isHidden: true } } })
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
  @ApiOperation({ summary: "List the owner's saved draft versions" })
  @ApiResponse({ status: 200, description: "Array of entry version snapshots" })
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
