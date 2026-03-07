CREATE TABLE "workflow_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" uuid,
	"reporter_id" uuid DEFAULT null,
	"event" text NOT NULL,
	"message" text NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "workflow_logs" ADD CONSTRAINT "workflow_logs_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workflow_logs" ADD CONSTRAINT "workflow_logs_reporter_id_reporters_id_fk" FOREIGN KEY ("reporter_id") REFERENCES "public"."reporters"("id") ON DELETE no action ON UPDATE no action;