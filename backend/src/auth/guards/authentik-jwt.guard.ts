import { Injectable } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

@Injectable()
export class AuthentikJwtGuard extends AuthGuard("authentik-jwt") {}
