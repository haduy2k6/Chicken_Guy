-- Chạy một lần trên production (synchronize đang tắt).
-- Ca chuyển tuyến là trạng thái kết thúc nên không còn theo dõi "nơi nhận đã xem".
ALTER TABLE "referrals" DROP COLUMN IF EXISTS "viewed_at";
