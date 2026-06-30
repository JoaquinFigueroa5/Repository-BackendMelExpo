-- CreateTable
CREATE TABLE `incidents` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `toolId` INTEGER NULL,
    `title` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NOT NULL,
    `severity` VARCHAR(191) NOT NULL DEFAULT 'low',
    `status` VARCHAR(191) NOT NULL DEFAULT 'open',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `resolvedAt` DATETIME(3) NULL,
    `resolution` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `incidents` ADD CONSTRAINT `incidents_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `incidents` ADD CONSTRAINT `incidents_toolId_fkey` FOREIGN KEY (`toolId`) REFERENCES `Tool`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
