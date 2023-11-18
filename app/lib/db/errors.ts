import type { LibsqlError } from "@libsql/client";

class PrimaryKeyError {
  readonly _tag = "PrimaryKeyError";
}

class UnknownDatabaseError {
  readonly _tag = "UnknownDatabaseError";
  constructor(readonly message: string) {}
}

export function mapDbError(_error: unknown) {
  const error = _error as LibsqlError;
  if (error.code === "SQLITE_CONSTRAINT_PRIMARYKEY") {
    return new PrimaryKeyError();
  }

  console.log(error);

  return new UnknownDatabaseError(error.message);
}
