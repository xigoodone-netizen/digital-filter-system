CREATE TABLE `l6_statistics` (
	`id` int AUTO_INCREMENT NOT NULL,
	`draw_number` varchar(3) NOT NULL,
	`is_hit` int NOT NULL,
	`draw_time` timestamp NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `l6_statistics_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `layer_results` (
	`id` int AUTO_INCREMENT NOT NULL,
	`layer_id` varchar(2) NOT NULL,
	`numbers` text NOT NULL,
	`count` int NOT NULL,
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `layer_results_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `lottery_draws` (
	`id` int AUTO_INCREMENT NOT NULL,
	`number` varchar(3) NOT NULL,
	`original_number` varchar(4),
	`statistical_number` int,
	`game_time` timestamp NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `lottery_draws_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `lottery_scores` (
	`id` int AUTO_INCREMENT NOT NULL,
	`number` varchar(3) NOT NULL,
	`sum` int NOT NULL,
	`span` int NOT NULL,
	`sum_score` varchar(10) NOT NULL,
	`span_score` varchar(10) NOT NULL,
	`hot_cold_score` varchar(10) NOT NULL,
	`hit_score` varchar(10) NOT NULL,
	`total_score` varchar(10) NOT NULL,
	`contains_key_code` int DEFAULT 0,
	`is_edge_value` int DEFAULT 0,
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `lottery_scores_id` PRIMARY KEY(`id`),
	CONSTRAINT `lottery_scores_number_unique` UNIQUE(`number`)
);
