import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { FirebaseAuthService } from "./firebase-auth.service";

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly firebaseAuth: FirebaseAuthService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const header = request.headers.authorization;

    try {
      request.uid = await this.firebaseAuth.verifyIdToken(header);
      return true;
    } catch {
      throw new UnauthorizedException();
    }
  }
}