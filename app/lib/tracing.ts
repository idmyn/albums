import { NodeSdk } from "@effect/opentelemetry";
import { BatchSpanProcessor } from "@opentelemetry/sdk-trace-base";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { Effect, Layer, Scope } from "effect";

const otelLayer = NodeSdk.layer(() => ({
  resource: { serviceName: "albums" },
  spanProcessor: new BatchSpanProcessor(new OTLPTraceExporter()),
}));

const scope = Effect.runSync(Scope.make());
export const runtime = Layer.toRuntime(otelLayer).pipe(
  Scope.extend(scope),
  Effect.runSync
);
