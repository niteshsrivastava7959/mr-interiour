CREATE TABLE "admins" (
	"id" serial PRIMARY KEY,
	"username" text NOT NULL UNIQUE,
	"password" text NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "projects" (
	"id" serial PRIMARY KEY,
	"title" text NOT NULL,
	"location" text NOT NULL,
	"category" text NOT NULL,
	"size" text NOT NULL,
	"imageUrl" text NOT NULL,
	"created_at" timestamp DEFAULT now()
);
