import { Controller, Get } from "@nestjs/common";
import { getDb } from "../config/firebase";
import { ApiOperation, ApiTags } from "@nestjs/swagger";

@Controller("health")
@ApiTags("Health")
export class HealthController {
  @Get("database")
  @ApiOperation({ summary: "Check backend Firestore connectivity" })
  async database() {
    const db = getDb();
    await db.collection("health").doc("connection").get();

    return {
      status: "ok",
      database: "reachable",
    };
  }
}
