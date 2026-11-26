import { UnauthorizedException, ValidationPipe, Module } from "@nestjs/common";
import type { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import request from "supertest";
import { jest } from "@jest/globals";

const emulatorAvailable = Boolean(process.env.FIRESTORE_EMULATOR_HOST);

jest.setTimeout(30_000);

(emulatorAvailable ? describe : describe.skip)("people HTTP integration", () => {
  let app: INestApplication;
  let getDb: typeof import("../src/config/firebase").getDb;
  let AuthGuard: new (...args: any[]) => any;

  beforeAll(async () => {
    jest.unstable_mockModule("../src/auth/auth.guard", () => ({
      AuthGuard: class TestAuthGuard {
        canActivate(context: any) {
          const req = context.switchToHttp().getRequest();
          const uid = req.headers["x-test-uid"];
          if (typeof uid !== "string" || !uid) throw new UnauthorizedException();
          req.uid = uid;
          return true;
        }
      },
    }));

    const peopleModule = await import("../src/people/people.controller");
    const authModule = await import("../src/auth/auth.guard");
    const configModule = await import("../src/config/firebase");
    getDb = configModule.getDb;
    AuthGuard = authModule.AuthGuard as new (...args: any[]) => any;

    @Module({
      controllers: [peopleModule.PeopleController],
      providers: [AuthGuard],
    })
    class IntegrationModule {}

    const moduleRef = await Test.createTestingModule({ imports: [IntegrationModule] })
      .compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
    await app.init();
  });

  afterAll(async () => {
    if (app) await app.close();
  });

  it("redeems an invitation exactly once and returns only safe people fields", async () => {
    const ownerUid = `owner-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const recipientUid = `recipient-${Date.now()}-${Math.random().toString(36).slice(2)}`;

    const inviteResponse = await request(app.getHttpServer())
      .post("/invites")
      .set("x-test-uid", ownerUid)
      .send({ handle: "recipient", name: "Recipient" })
      .expect(201);

    const joined = await request(app.getHttpServer())
      .post("/auth/join")
      .set("x-test-uid", recipientUid)
      .send({ code: inviteResponse.body.code, name: "Recipient Name" })
      .expect(201);

    expect(joined.body).toMatchObject({ uid: recipientUid, role: "recipient", ownerUid });

    const duplicate = await request(app.getHttpServer())
      .post("/auth/join")
      .set("x-test-uid", `recipient-duplicate-${Date.now()}`)
      .send({ code: inviteResponse.body.code, name: "Other" })
      .expect(201);
    expect(duplicate.body).toEqual({ error: "Invalid or already used invitation code" });

    const people = await request(app.getHttpServer())
      .get("/people")
      .set("x-test-uid", ownerUid)
      .expect(200);
    expect(people.body.people[0]).toEqual({
      uid: recipientUid,
      role: "recipient",
      ownerUid,
      name: "Recipient Name",
      handle: "recipient",
    });
    expect(people.body.people[0]).not.toHaveProperty("settings");
    expect(people.body.people[0]).not.toHaveProperty("deceased");

    const db = getDb();
    const inviteSnapshot = await db.collection("invites").doc(inviteResponse.body.inviteId).get();
    expect(inviteSnapshot.data()).toMatchObject({ status: "used", usedByUid: recipientUid });
  });

  it("rejects expired invitations and concurrent redemption leaves one used invite", async () => {
    const db = getDb();
    const expiredCode = `EXPIRED-${Date.now()}`;
    await db.collection("invites").add({
      ownerUid: `owner-expired-${Date.now()}`,
      code: expiredCode,
      handle: "expired",
      name: "Expired",
      status: "pending",
      createdAt: new Date(),
      expiresAt: new Date(Date.now() - 1000),
    });

    const expired = await request(app.getHttpServer())
      .post("/auth/join")
      .set("x-test-uid", `expired-user-${Date.now()}`)
      .send({ code: expiredCode, name: "Expired" })
      .expect(201);
    expect(expired.body).toEqual({ error: "Invitation expired" });

    const code = `RACE-${Date.now()}`;
    await db.collection("invites").add({
      ownerUid: `owner-race-${Date.now()}`,
      code,
      handle: "race",
      name: "Race",
      status: "pending",
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 60_000),
    });

    const [first, second] = await Promise.all([
      request(app.getHttpServer()).post("/auth/join").set("x-test-uid", `race-a-${Date.now()}`).send({ code, name: "A" }),
      request(app.getHttpServer()).post("/auth/join").set("x-test-uid", `race-b-${Date.now()}`).send({ code, name: "B" }),
    ]);

    expect([first.body.error, second.body.error].filter(Boolean)).toHaveLength(1);
  });
});
