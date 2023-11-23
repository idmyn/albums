import { NodeSdk } from "@effect/opentelemetry";
import { BatchSpanProcessor } from "@opentelemetry/sdk-trace-base";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";

export const otelLayer = NodeSdk.layer(() => ({
  resource: { serviceName: "albums" },
  spanProcessor: new BatchSpanProcessor(new OTLPTraceExporter()),
}));
