CREATE TABLE "users" (
  "user_id" SERIAL PRIMARY KEY,
  "email" text,
  "username" text,
  "password" text,
  "salt" text,
  "firstname" text,
  "lastname" text
);

CREATE TABLE "posts" (
  "post_id" SERIAL PRIMARY KEY,
  "workspace_id" int NOT NULL,
  "author_id" int NOT NULL,
  "header" text,
  "body" text
);

CREATE TABLE "chat_channel" (
  "channel_id" SERIAL PRIMARY KEY,
  "name" text NOT NULL
);

CREATE TABLE "channel_members" (
  "channel_id" int NOT NULL,
  "user_id" int NOT NULL
);

CREATE TABLE "chat_messages" (
  "message_id" SERIAL PRIMARY KEY,
  "channel_id" int NOT NULL,
  "author_id" int NOT NULL,
  "content" text
);

CREATE TABLE "workspaces" (
  "workspace_id" SERIAL PRIMARY KEY,
  "workspace_name" text NOT NULL,
  "workspace_bio" text
);

CREATE TABLE "projects" (
  "project_id" SERIAL PRIMARY KEY,
  "workspace_id" int NOT NULL DEFAULT 1,
  "name" text NOT NULL,
  "bio" text
);

CREATE TABLE "project_tags" (
  "tag_id" SERIAL PRIMARY KEY,
  "project_id" int,
  "tag_name" text
);

CREATE TABLE "ln_project_language" (
  "project_id" int,
  "p_lang_id" int
);

CREATE TABLE "programming_languages" (
  "lang_id" SERIAL PRIMARY KEY,
  "name" text,
  "bio" text
);

CREATE TABLE "permissions" (
  "permission_id" SERIAL PRIMARY KEY,
  "permission_name" text NOT NULL,
  "permission_value" text NOT NULL
);

CREATE TABLE "project_permissions" (
  "permission_id" int NOT NULL,
  "project_id" int NOT NULL
);

CREATE TABLE "workspace_permissions" (
  "permission_id" int NOT NULL,
  "workspace_id" int NOT NULL
);

CREATE TABLE "user_workspace_perms" (
  "workspace_id" int NOT NULL,
  "user_id" int NOT NULL,
  "permission_mask" int
);

CREATE TABLE "user_project_perms" (
  "project_id" int NOT NULL,
  "user_id" int NOT NULL,
  "permission_mask" int
);

CREATE TABLE "task_type" (
  "type_id" SERIAL PRIMARY KEY,
  "type_name" text
);

CREATE TABLE "tasks" (
  "task_id" SERIAL PRIMARY KEY,
  "project_id" int,
  "task_type" int NOT NULL,
  "task_name" text NOT NULL,
  "task_description" text,
  "task_status" int,
  "task_assignee" int
);

CREATE TABLE "task_status" (
  "status_id" SERIAL PRIMARY KEY,
  "project_id" int,
  "status_name" text NOT NULL,
  "status_description" text
);

CREATE TABLE "comments" (
  "comment_id" SERIAL PRIMARY KEY,
  "author_id" int NOT NULL,
  "content" text NOT NULL
);

CREATE TABLE "ln_post_comments" (
  "post_id" int,
  "comment_id" int
);

CREATE TABLE "ln_task_comments" (
  "task_id" int,
  "comment_id" int
);

ALTER TABLE "project_permissions" ADD FOREIGN KEY ("project_id") REFERENCES "projects" ("project_id");

ALTER TABLE "project_tags" ADD FOREIGN KEY ("project_id") REFERENCES "projects" ("project_id");

ALTER TABLE "ln_project_language" ADD FOREIGN KEY ("project_id") REFERENCES "projects" ("project_id");

ALTER TABLE "ln_project_language" ADD FOREIGN KEY ("p_lang_id") REFERENCES "programming_languages" ("lang_id");

ALTER TABLE "tasks" ADD FOREIGN KEY ("task_assignee") REFERENCES "users" ("user_id");

ALTER TABLE "task_status" ADD FOREIGN KEY ("project_id") REFERENCES "projects" ("project_id");

ALTER TABLE "tasks" ADD FOREIGN KEY ("task_type") REFERENCES "task_type" ("type_id");

ALTER TABLE "ln_task_comments" ADD FOREIGN KEY ("task_id") REFERENCES "tasks" ("task_id");

ALTER TABLE "ln_task_comments" ADD FOREIGN KEY ("comment_id") REFERENCES "comments" ("comment_id");

ALTER TABLE "tasks" ADD FOREIGN KEY ("project_id") REFERENCES "projects" ("project_id");

ALTER TABLE "tasks" ADD FOREIGN KEY ("task_status") REFERENCES "task_status" ("status_id");

ALTER TABLE "comments" ADD FOREIGN KEY ("author_id") REFERENCES "users" ("user_id");

ALTER TABLE "channel_members" ADD FOREIGN KEY ("channel_id") REFERENCES "chat_channel" ("channel_id");

ALTER TABLE "posts" ADD FOREIGN KEY ("author_id") REFERENCES "users" ("user_id");

ALTER TABLE "chat_messages" ADD FOREIGN KEY ("channel_id") REFERENCES "chat_channel" ("channel_id");

ALTER TABLE "chat_messages" ADD FOREIGN KEY ("author_id") REFERENCES "users" ("user_id");

ALTER TABLE "ln_post_comments" ADD FOREIGN KEY ("comment_id") REFERENCES "comments" ("comment_id");

ALTER TABLE "ln_post_comments" ADD FOREIGN KEY ("post_id") REFERENCES "posts" ("post_id");

ALTER TABLE "projects" ADD FOREIGN KEY ("workspace_id") REFERENCES "workspaces" ("workspace_id");

ALTER TABLE "workspace_permissions" ADD FOREIGN KEY ("permission_id") REFERENCES "permissions" ("permission_id");

ALTER TABLE "workspace_permissions" ADD FOREIGN KEY ("workspace_id") REFERENCES "workspaces" ("workspace_id");

ALTER TABLE "user_workspace_perms" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("user_id");

ALTER TABLE "user_project_perms" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("user_id");

ALTER TABLE "user_workspace_perms" ADD FOREIGN KEY ("workspace_id") REFERENCES "workspaces" ("workspace_id");

ALTER TABLE "user_project_perms" ADD FOREIGN KEY ("project_id") REFERENCES "projects" ("project_id");

ALTER TABLE "posts" ADD FOREIGN KEY ("workspace_id") REFERENCES "workspaces" ("workspace_id");
