CREATE TABLE `apps` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`path` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	`github_org` text,
	`github_repo` text,
	`github_branch` text,
	`supabase_project_id` text,
	`supabase_parent_project_id` text,
	`neon_project_id` text,
	`neon_development_branch_id` text,
	`neon_preview_branch_id` text,
	`vercel_project_id` text,
	`vercel_project_name` text,
	`vercel_team_id` text,
	`vercel_deployment_url` text,
	`install_command` text,
	`start_command` text,
	`chat_context` text,
	`is_favorite` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE `chats` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`app_id` integer NOT NULL,
	`title` text,
	`initial_commit_hash` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`app_id`) REFERENCES `apps`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `language_model_providers` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`api_base_url` text NOT NULL,
	`env_var_name` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `language_models` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`display_name` text NOT NULL,
	`api_name` text NOT NULL,
	`builtin_provider_id` text,
	`custom_provider_id` text,
	`description` text,
	`max_output_tokens` integer,
	`context_window` integer,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`custom_provider_id`) REFERENCES `language_model_providers`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `mcp_servers` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`transport` text NOT NULL,
	`command` text,
	`args` text,
	`env_json` text,
	`url` text,
	`enabled` integer DEFAULT 0 NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `mcp_tool_consents` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`server_id` integer NOT NULL,
	`tool_name` text NOT NULL,
	`consent` text DEFAULT 'ask' NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`server_id`) REFERENCES `mcp_servers`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `uniq_mcp_consent` ON `mcp_tool_consents` (`server_id`,`tool_name`);--> statement-breakpoint
CREATE TABLE `messages` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`chat_id` integer NOT NULL,
	`role` text NOT NULL,
	`content` text NOT NULL,
	`approval_state` text,
	`source_commit_hash` text,
	`commit_hash` text,
	`request_id` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`chat_id`) REFERENCES `chats`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `prompts` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`content` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `versions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`app_id` integer NOT NULL,
	`commit_hash` text NOT NULL,
	`neon_db_timestamp` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`app_id`) REFERENCES `apps`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `versions_app_commit_unique` ON `versions` (`app_id`,`commit_hash`);