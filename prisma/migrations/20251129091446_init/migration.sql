/*
  Warnings:

  - You are about to drop the `messages` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `reactions` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `read_receipts` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `room_members` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `rooms` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `typing_indicators` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `user_blocks` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `user_devices` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `user_friends` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `users` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "messages" DROP CONSTRAINT "messages_reply_to_id_fkey";

-- DropForeignKey
ALTER TABLE "messages" DROP CONSTRAINT "messages_room_id_fkey";

-- DropForeignKey
ALTER TABLE "messages" DROP CONSTRAINT "messages_sender_id_fkey";

-- DropForeignKey
ALTER TABLE "reactions" DROP CONSTRAINT "reactions_message_id_fkey";

-- DropForeignKey
ALTER TABLE "reactions" DROP CONSTRAINT "reactions_user_id_fkey";

-- DropForeignKey
ALTER TABLE "read_receipts" DROP CONSTRAINT "read_receipts_message_id_fkey";

-- DropForeignKey
ALTER TABLE "read_receipts" DROP CONSTRAINT "read_receipts_user_id_fkey";

-- DropForeignKey
ALTER TABLE "room_members" DROP CONSTRAINT "room_members_room_id_fkey";

-- DropForeignKey
ALTER TABLE "room_members" DROP CONSTRAINT "room_members_user_id_fkey";

-- DropForeignKey
ALTER TABLE "typing_indicators" DROP CONSTRAINT "typing_indicators_room_id_fkey";

-- DropForeignKey
ALTER TABLE "typing_indicators" DROP CONSTRAINT "typing_indicators_user_id_fkey";

-- DropForeignKey
ALTER TABLE "user_blocks" DROP CONSTRAINT "user_blocks_blocked_id_fkey";

-- DropForeignKey
ALTER TABLE "user_blocks" DROP CONSTRAINT "user_blocks_blocker_id_fkey";

-- DropForeignKey
ALTER TABLE "user_devices" DROP CONSTRAINT "user_devices_user_id_fkey";

-- DropForeignKey
ALTER TABLE "user_friends" DROP CONSTRAINT "user_friends_friend_id_fkey";

-- DropForeignKey
ALTER TABLE "user_friends" DROP CONSTRAINT "user_friends_user_id_fkey";

-- DropTable
DROP TABLE "messages";

-- DropTable
DROP TABLE "reactions";

-- DropTable
DROP TABLE "read_receipts";

-- DropTable
DROP TABLE "room_members";

-- DropTable
DROP TABLE "rooms";

-- DropTable
DROP TABLE "typing_indicators";

-- DropTable
DROP TABLE "user_blocks";

-- DropTable
DROP TABLE "user_devices";

-- DropTable
DROP TABLE "user_friends";

-- DropTable
DROP TABLE "users";

-- DropEnum
DROP TYPE "Gender";

-- DropEnum
DROP TYPE "MessageType";

-- DropEnum
DROP TYPE "ReactionType";

-- DropEnum
DROP TYPE "RoomRole";

-- DropEnum
DROP TYPE "RoomType";

-- DropEnum
DROP TYPE "UserFriendStatus";

-- DropEnum
DROP TYPE "UserRole";

-- DropEnum
DROP TYPE "UserStatus";
