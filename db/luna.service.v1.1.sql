ALTER TABLE "task_type"
    ADD COLUMN "project_id" INT NOT NULL;

ALTER TABLE "task_type" ADD FOREIGN KEY ("project_id") REFERENCES "projects" ("project_id");

ALTER TABLE "permissions"
    ADD COLUMN "is_admin" boolean NOT NULL DEFAULT false;


ALTER TABLE "chat_channel"
    ADD COLUMN "is_deleted" boolean NOT NULL DEFAULT false;
