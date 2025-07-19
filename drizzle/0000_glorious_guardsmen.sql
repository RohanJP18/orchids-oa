CREATE TABLE `made_for_you` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`artist` text NOT NULL,
	`album` text NOT NULL,
	`image` text,
	`duration` integer NOT NULL,
	`description` text,
	`category` text DEFAULT 'playlist' NOT NULL
);
--> statement-breakpoint
CREATE TABLE `popular_albums` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`artist` text NOT NULL,
	`album` text NOT NULL,
	`image` text,
	`duration` integer NOT NULL,
	`release_year` integer,
	`genre` text
);
--> statement-breakpoint
CREATE TABLE `recently_played` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`artist` text NOT NULL,
	`album` text NOT NULL,
	`image` text,
	`duration` integer NOT NULL,
	`played_at` integer NOT NULL
);
