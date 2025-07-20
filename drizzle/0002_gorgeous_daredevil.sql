CREATE TABLE `searches` (
	`id` text PRIMARY KEY NOT NULL,
	`query` text NOT NULL,
	`results` integer NOT NULL,
	`searched_at` integer NOT NULL
);
