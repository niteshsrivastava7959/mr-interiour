CREATE TABLE IF NOT EXISTS `projects` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`location` text NOT NULL,
	`category` text NOT NULL,
	`size` text NOT NULL,
	`image_url` text NOT NULL,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP)
);

CREATE TABLE IF NOT EXISTS `admins` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`username` text NOT NULL,
	`password` text NOT NULL,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP)
);

CREATE UNIQUE INDEX IF NOT EXISTS `admins_username_unique` ON `admins` (`username`);
