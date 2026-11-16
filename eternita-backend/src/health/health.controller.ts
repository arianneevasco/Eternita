import { Controller, Get } from "@nestjs/common";
import { getDb } from "../config/firebase";

@Controller("health")
export class HealthController {
  @Get("database")
  async database() {
    const db = getDb();

    await db.collection("health").doc("connection").set({
      checkedAt: new Date(),
    });

    return {
      status: "ok",
      database: "reachable",
    };
  }
}