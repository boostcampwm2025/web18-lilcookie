import { SetMetadata, UseGuards, applyDecorators } from "@nestjs/common";
import { OidcGuard } from "./oidc.guard";
import { ScopesGuard } from "./scopes.guard";

export const SCOPES_KEY = "scopes";

export const Scopes = (...scopes: string[]) => SetMetadata(SCOPES_KEY, scopes);

export const RequireScopes = (...scopes: string[]) =>
  applyDecorators(UseGuards(OidcGuard, ScopesGuard), Scopes(...scopes));
