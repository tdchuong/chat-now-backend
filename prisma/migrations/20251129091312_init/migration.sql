-- CreateEnum
CREATE TYPE "MessageType" AS ENUM ('TEXT', 'IMAGE', 'VIDEO', 'FILE', 'VOICE');

-- CreateEnum
CREATE TYPE "ReactionType" AS ENUM ('LIKE', 'LOVE', 'LAUGH', 'SAD', 'ANGRY');

-- CreateEnum
CREATE TYPE "RoomType" AS ENUM ('PRIVATE', 'GROUP', 'VOICE_CHANNEL');

-- CreateEnum
CREATE TYPE "RoomRole" AS ENUM ('ADMIN', 'MEMBER', 'KICKED');

-- CreateEnum
CREATE TYPE "UserFriendStatus" AS ENUM ('PENDING', 'ACCEPTED', 'DECLINED');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('USER', 'ADMIN', 'MODERATOR');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ONLINE', 'OFFLINE', 'AWAY', 'BUSY', 'INVISIBLE');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE', 'OTHER');

-- CreateTable
CREATE TABLE "messages" (
    "id" TEXT NOT NULL,
    "room_id" TEXT NOT NULL,
    "sender_id" TEXT NOT NULL,
    "type" "MessageType" NOT NULL DEFAULT 'TEXT',
    "content" TEXT,
    "file_url" TEXT,
    "file_size" INTEGER,
    "file_name" TEXT,
    "duration" INTEGER,
    "reply_to_id" TEXT,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "edited_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reactions" (
    "message_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "type" "ReactionType" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "read_receipts" (
    "message_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "read_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "rooms" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "type" "RoomType" NOT NULL DEFAULT 'PRIVATE',
    "avatar_url" TEXT,
    "is_pinned" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "rooms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "room_members" (
    "room_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "role" "RoomRole" NOT NULL DEFAULT 'MEMBER',
    "joined_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "update_at" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "typing_indicators" (
    "id" TEXT NOT NULL,
    "room_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "is_typing" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "typing_indicators_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_blocks" (
    "blocker_id" TEXT NOT NULL,
    "blocked_id" TEXT NOT NULL,
    "status" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "user_devices" (
    "id" SERIAL NOT NULL,
    "device_id" VARCHAR(36) NOT NULL,
    "fingerprint_hash" VARCHAR(64) NOT NULL,
    "user_id" TEXT,
    "device_name" TEXT,
    "platform" TEXT,
    "os" TEXT,
    "os_version" TEXT,
    "browser" TEXT,
    "browser_version" TEXT,
    "app_version" TEXT,
    "ip_first" TEXT,
    "ip_last" TEXT NOT NULL,
    "user_agent" TEXT,
    "is_trusted" BOOLEAN NOT NULL DEFAULT false,
    "is_blocked" BOOLEAN NOT NULL DEFAULT false,
    "last_active_at" TIMESTAMP(3) NOT NULL,
    "first_seen" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_seen" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_devices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_friends" (
    "user_id" TEXT NOT NULL,
    "friend_id" TEXT NOT NULL,
    "status" "UserFriendStatus" NOT NULL DEFAULT 'PENDING',
    "create_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "message" TEXT
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "username" VARCHAR(50) NOT NULL,
    "display_name" VARCHAR(100) NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "phone" VARCHAR(10) NOT NULL,
    "date_of_birth" TIMESTAMP(3) NOT NULL,
    "gender" "Gender" NOT NULL DEFAULT 'MALE',
    "role" "UserRole" NOT NULL DEFAULT 'USER',
    "status" "UserStatus" NOT NULL DEFAULT 'OFFLINE',
    "last_active_at" TIMESTAMP(3),
    "socket_id" TEXT,
    "avatar_url" TEXT DEFAULT 'https://avatar.iran.liara.run/public',
    "bio" TEXT,
    "is_verified" BOOLEAN NOT NULL DEFAULT false,
    "is_banned" BOOLEAN NOT NULL DEFAULT false,
    "banned_until" TIMESTAMP(3),
    "address_street" VARCHAR(255),
    "address_ward" VARCHAR(100),
    "address_district" VARCHAR(100),
    "address_city" VARCHAR(100),
    "address_country" TEXT DEFAULT 'Việt Nam',
    "latitude" DECIMAL(10,8),
    "longitude" DECIMAL(11,8),
    "online_status_visibility" TEXT NOT NULL DEFAULT 'everyone',
    "last_seen_visibility" TEXT NOT NULL DEFAULT 'friends',
    "profile_visibility" TEXT NOT NULL DEFAULT 'everyone',
    "location_visibility" TEXT NOT NULL DEFAULT 'friends',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "messages_room_id_created_at_idx" ON "messages"("room_id", "created_at");

-- CreateIndex
CREATE INDEX "messages_sender_id_idx" ON "messages"("sender_id");

-- CreateIndex
CREATE UNIQUE INDEX "reactions_message_id_user_id_key" ON "reactions"("message_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "read_receipts_message_id_user_id_key" ON "read_receipts"("message_id", "user_id");

-- CreateIndex
CREATE INDEX "rooms_type_idx" ON "rooms"("type");

-- CreateIndex
CREATE UNIQUE INDEX "room_members_room_id_user_id_key" ON "room_members"("room_id", "user_id");

-- CreateIndex
CREATE INDEX "typing_indicators_room_id_idx" ON "typing_indicators"("room_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_blocks_blocker_id_blocked_id_key" ON "user_blocks"("blocker_id", "blocked_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_devices_device_id_key" ON "user_devices"("device_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_devices_fingerprint_hash_key" ON "user_devices"("fingerprint_hash");

-- CreateIndex
CREATE INDEX "user_devices_user_id_idx" ON "user_devices"("user_id");

-- CreateIndex
CREATE INDEX "user_devices_fingerprint_hash_idx" ON "user_devices"("fingerprint_hash");

-- CreateIndex
CREATE INDEX "user_devices_last_seen_idx" ON "user_devices"("last_seen");

-- CreateIndex
CREATE INDEX "user_friends_user_id_idx" ON "user_friends"("user_id");

-- CreateIndex
CREATE INDEX "user_friends_friend_id_idx" ON "user_friends"("friend_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_friends_user_id_friend_id_key" ON "user_friends"("user_id", "friend_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "users_phone_key" ON "users"("phone");

-- CreateIndex
CREATE INDEX "users_username_idx" ON "users"("username");

-- CreateIndex
CREATE INDEX "users_status_idx" ON "users"("status");

-- CreateIndex
CREATE INDEX "users_last_active_at_idx" ON "users"("last_active_at");

-- CreateIndex
CREATE INDEX "users_address_city_idx" ON "users"("address_city");

-- CreateIndex
CREATE INDEX "users_latitude_longitude_idx" ON "users"("latitude", "longitude");

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_room_id_fkey" FOREIGN KEY ("room_id") REFERENCES "rooms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_reply_to_id_fkey" FOREIGN KEY ("reply_to_id") REFERENCES "messages"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reactions" ADD CONSTRAINT "reactions_message_id_fkey" FOREIGN KEY ("message_id") REFERENCES "messages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reactions" ADD CONSTRAINT "reactions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "read_receipts" ADD CONSTRAINT "read_receipts_message_id_fkey" FOREIGN KEY ("message_id") REFERENCES "messages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "read_receipts" ADD CONSTRAINT "read_receipts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "room_members" ADD CONSTRAINT "room_members_room_id_fkey" FOREIGN KEY ("room_id") REFERENCES "rooms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "room_members" ADD CONSTRAINT "room_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "typing_indicators" ADD CONSTRAINT "typing_indicators_room_id_fkey" FOREIGN KEY ("room_id") REFERENCES "rooms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "typing_indicators" ADD CONSTRAINT "typing_indicators_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_blocks" ADD CONSTRAINT "user_blocks_blocker_id_fkey" FOREIGN KEY ("blocker_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_blocks" ADD CONSTRAINT "user_blocks_blocked_id_fkey" FOREIGN KEY ("blocked_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_devices" ADD CONSTRAINT "user_devices_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_friends" ADD CONSTRAINT "user_friends_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_friends" ADD CONSTRAINT "user_friends_friend_id_fkey" FOREIGN KEY ("friend_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
