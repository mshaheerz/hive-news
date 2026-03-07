CREATE TYPE "public"."article_status" AS ENUM('draft', 'in_review', 'approved', 'rejected', 'published');--> statement-breakpoint
CREATE TYPE "public"."provider_type" AS ENUM('openai', 'anthropic', 'google', 'groq', 'openrouter', 'ollama');--> statement-breakpoint
CREATE TYPE "public"."reporter_role" AS ENUM('ceo', 'reporter');--> statement-breakpoint
CREATE TYPE "public"."review_action" AS ENUM('approved', 'rejected', 'revision_requested', 'flagged_duplicate');--> statement-breakpoint
CREATE TABLE "api_tokens" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(200) NOT NULL,
	"token_hash" varchar(64) NOT NULL,
	"prefix" varchar(8) NOT NULL,
	"scopes" text[],
	"last_used_at" timestamp,
	"expires_at" timestamp,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "api_tokens_token_hash_unique" UNIQUE("token_hash")
);
--> statement-breakpoint
CREATE TABLE "articles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" uuid NOT NULL,
	"reporter_id" uuid NOT NULL,
	"category_id" uuid NOT NULL,
	"title" varchar(500) NOT NULL,
	"slug" varchar(500) NOT NULL,
	"content" text NOT NULL,
	"summary" text,
	"status" "article_status" DEFAULT 'draft' NOT NULL,
	"metadata_json" jsonb,
	"tokens_used" integer,
	"generation_ms" integer,
	"published_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "articles_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL,
	"slug" varchar(100) NOT NULL,
	"color" varchar(7),
	"icon" varchar(10),
	CONSTRAINT "categories_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "companies" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(200) NOT NULL,
	"slug" varchar(200) NOT NULL,
	"description" text,
	"logo_url" text,
	"ceo_id" uuid,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "companies_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "federation_instances" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(200) NOT NULL,
	"api_url" text NOT NULL,
	"token_hash" varchar(64) NOT NULL,
	"last_seen_at" timestamp,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "providers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL,
	"type" "provider_type" NOT NULL,
	"base_url" text,
	"api_key_enc" text,
	"is_local" boolean DEFAULT false,
	"max_rpm" integer DEFAULT 60,
	"config_json" jsonb,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "reporters" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" uuid NOT NULL,
	"provider_id" uuid NOT NULL,
	"model_id" varchar(100) NOT NULL,
	"journalist_name" varchar(200) NOT NULL,
	"persona_prompt" text,
	"role" "reporter_role" NOT NULL,
	"categories" text[],
	"is_active" boolean DEFAULT true,
	"avatar_url" text,
	"bio" text,
	"stats_json" jsonb,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "review_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"article_id" uuid NOT NULL,
	"reviewer_id" uuid NOT NULL,
	"action" "review_action" NOT NULL,
	"feedback" text,
	"score" integer,
	"is_duplicate" boolean DEFAULT false,
	"duplicate_of_id" uuid,
	"tokens_used" integer,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "settings" (
	"key" varchar(200) PRIMARY KEY NOT NULL,
	"value" jsonb NOT NULL,
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "articles" ADD CONSTRAINT "articles_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "articles" ADD CONSTRAINT "articles_reporter_id_reporters_id_fk" FOREIGN KEY ("reporter_id") REFERENCES "public"."reporters"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "articles" ADD CONSTRAINT "articles_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reporters" ADD CONSTRAINT "reporters_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reporters" ADD CONSTRAINT "reporters_provider_id_providers_id_fk" FOREIGN KEY ("provider_id") REFERENCES "public"."providers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "review_logs" ADD CONSTRAINT "review_logs_article_id_articles_id_fk" FOREIGN KEY ("article_id") REFERENCES "public"."articles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "review_logs" ADD CONSTRAINT "review_logs_reviewer_id_reporters_id_fk" FOREIGN KEY ("reviewer_id") REFERENCES "public"."reporters"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "review_logs" ADD CONSTRAINT "review_logs_duplicate_of_id_articles_id_fk" FOREIGN KEY ("duplicate_of_id") REFERENCES "public"."articles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "articles_slug_idx" ON "articles" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "articles_company_id_idx" ON "articles" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "articles_reporter_id_idx" ON "articles" USING btree ("reporter_id");--> statement-breakpoint
CREATE INDEX "articles_category_id_idx" ON "articles" USING btree ("category_id");--> statement-breakpoint
CREATE INDEX "articles_status_idx" ON "articles" USING btree ("status");--> statement-breakpoint
CREATE INDEX "articles_published_at_idx" ON "articles" USING btree ("published_at");