-- CreateTable
CREATE TABLE "user" (
    "id" TEXT NOT NULL,
    "auth0Id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "picture" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "publicId" TEXT,
    "userId" TEXT NOT NULL,
    "prompt" TEXT,
    "previewUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_version" (
    "id" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "projectId" TEXT NOT NULL,
    "designData" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "project_version_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_auth0Id_key" ON "user"("auth0Id");

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "project_version_projectId_version_key" ON "project_version"("projectId", "version");

-- AddForeignKey
ALTER TABLE "project" ADD CONSTRAINT "project_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_version" ADD CONSTRAINT "project_version_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
