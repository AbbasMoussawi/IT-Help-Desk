-- IT HELP DESK DATABASE

-- Table Role
CREATE TABLE "role" (
    "ID" SERIAL PRIMARY KEY,
    "RoleName" CHRACTER VARYING(150) NOT NULL UNIQUE,
    "CreatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- Table User
CREATE TABLE "user" (
    "ID" SERIAL PRIMARY KEY,
    "FullName" VARCHAR(150) NOT NULL,
    "Email" VARCHAR(150) NOT NULL UNIQUE,
    "PasswordHash" TEXT NOT NULL,
    "RoleId" INT NOT NULL,
    "IsActive" BOOLEAN DEFAULT TRUE,
    "CreatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    "UpdatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- Table verify_code
CREATE TABLE verify_code (
    "ID" SERIAL PRIMARY KEY,
    "Email" VARCHAR(255) NOT NULL,
    "Code" VARCHAR(6) NOT NULL,
    "ExpiresAt" TIMESTAMP NOT NULL,
    "IsUsed" BOOLEAN DEFAULT FALSE,
    "CreatedAt" TIMESTAMP DEFAULT NOW()
);


-- Table ticket
CREATE TABLE ticket(
    "ID" integer NOT NULL DEFAULT nextval('"ticket_ID_seq"'::regclass),
    "TicketNumber" character varying(20) COLLATE pg_catalog."default",
    "Title" character varying(255) COLLATE pg_catalog."default" NOT NULL,
    "Description" text COLLATE pg_catalog."default",
    "CreatedByUserId" integer NOT NULL,
    "AssignedToUserId" integer,
    "DepartmentId" integer,
    "CategoryId" integer,
    "PriorityId" integer,
    "StatusId" integer,
    "CreatedAt" timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" timestamp without time zone,
    "IsActive" boolean NOT NULL DEFAULT true,
    CONSTRAINT ticket_pkey PRIMARY KEY ("ID"),
    CONSTRAINT "ticket_AssignedToUserId_fkey" FOREIGN KEY ("AssignedToUserId")
        REFERENCES public."user" ("ID") MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION,
    CONSTRAINT "ticket_CategoryId_fkey" FOREIGN KEY ("CategoryId")
        REFERENCES public.category ("ID") MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION,
    CONSTRAINT "ticket_CreatedByUserId_fkey" FOREIGN KEY ("CreatedByUserId")
        REFERENCES public."user" ("ID") MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION,
    CONSTRAINT "ticket_DepartmentId_fkey" FOREIGN KEY ("DepartmentId")
        REFERENCES public.department ("ID") MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION,
    CONSTRAINT "ticket_PriorityId_fkey" FOREIGN KEY ("PriorityId")
        REFERENCES public.priority ("ID") MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION,
    CONSTRAINT "ticket_StatusId_fkey" FOREIGN KEY ("StatusId")
        REFERENCES public.status ("ID") MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
)


-- Table status
CREATE TABLE status(
     "ID" integer NOT NULL DEFAULT nextval('"status_ID_seq"'::regclass),
    "StatusName" character varying(50) COLLATE pg_catalog."default" NOT NULL,
    "CreatedAt" timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT status_pkey PRIMARY KEY ("ID")
)

-- Table priority
CREATE TABLE priority(
    "ID" integer NOT NULL DEFAULT nextval('"priority_ID_seq"'::regclass),
    "PriorityName" character varying(50) COLLATE pg_catalog."default" NOT NULL,
    "PriorityLevel" integer NOT NULL,
    "CreatedAt" timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT priority_pkey PRIMARY KEY ("ID")
)

-- Table Category
CREATE TABLE category(
     "ID" integer NOT NULL DEFAULT nextval('"category_ID_seq"'::regclass),
    "CategoryName" character varying(100) COLLATE pg_catalog."default" NOT NULL,
    "Description" text COLLATE pg_catalog."default",
    "CreatedAt" timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT category_pkey PRIMARY KEY ("ID")
)

-- Table attachment
CREATE TABLE attachment(
    "ID" integer NOT NULL DEFAULT nextval('"attachment_ID_seq"'::regclass),
    "TicketId" integer NOT NULL,
    "UploadedByUserID" integer NOT NULL,
    "FilePath" character varying(255) COLLATE pg_catalog."default",
    "FileType" character varying(50) COLLATE pg_catalog."default",
    "FileSize" integer,
    "CreatedAt" timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT attachment_pkey PRIMARY KEY ("ID"),
    CONSTRAINT "attachment_TicketID_fkey" FOREIGN KEY ("TicketId")
        REFERENCES public.ticket ("ID") MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE
)

-- Table comment
CREATE TABLE comment(
    "ID" integer NOT NULL DEFAULT nextval('"comment_ID_seq"'::regclass),
    "TicketId" integer NOT NULL,
    "UserId" integer NOT NULL,
    "CommentText" text COLLATE pg_catalog."default" NOT NULL,
    "IsInternal" boolean DEFAULT false,
    "CreatedAt" timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT comment_pkey PRIMARY KEY ("ID"),
    CONSTRAINT "comment_TicketId_fkey" FOREIGN KEY ("TicketId")
        REFERENCES public.ticket ("ID") MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE
)

-- Table ticket_activity
CREATE TABLE ticket_activity(
    "ID" integer NOT NULL DEFAULT nextval('"ticket_activity_ID_seq"'::regclass),
    "TicketId" integer NOT NULL,
    "UserId" integer NOT NULL,
    "Action" character varying(100) COLLATE pg_catalog."default" NOT NULL,
    "OldValue" text COLLATE pg_catalog."default",
    "NewValue" text COLLATE pg_catalog."default",
    "CreatedAt" timestamp without time zone DEFAULT now(),
    CONSTRAINT ticket_activity_pkey PRIMARY KEY ("ID"),
    CONSTRAINT fk_ticket_activity_ticket FOREIGN KEY ("TicketId")
        REFERENCES public.ticket ("ID") MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE,
    CONSTRAINT fk_ticket_activity_user FOREIGN KEY ("UserId")
        REFERENCES public."user" ("ID") MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE
)