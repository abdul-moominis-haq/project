-- SmartAgri Row Level Security Policies
-- Migration: 20250820000001_smartagri_rls_policies.sql

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own farms" ON public.farms;
DROP POLICY IF EXISTS "Users can insert own farms" ON public.farms;
DROP POLICY IF EXISTS "Users can update own farms" ON public.farms;
DROP POLICY IF EXISTS "Users can delete own farms" ON public.farms;
DROP POLICY IF EXISTS "Users can view own fields" ON public.fields;
DROP POLICY IF EXISTS "Users can manage own fields" ON public.fields;
DROP POLICY IF EXISTS "Users can view own crops" ON public.crops;
DROP POLICY IF EXISTS "Users can manage own crops" ON public.crops;
DROP POLICY IF EXISTS "Anyone can view published posts" ON public.posts;
DROP POLICY IF EXISTS "Users can manage own posts" ON public.posts;
DROP POLICY IF EXISTS "Anyone can view comments" ON public.comments;
DROP POLICY IF EXISTS "Users can manage own comments" ON public.comments;
DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can manage own preferences" ON public.user_preferences;
DROP POLICY IF EXISTS "Anyone can view crop types" ON public.crop_types;

-- Profiles: Users can view and edit their own profile
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Public profile viewing for community features
CREATE POLICY "Users can view public profiles" ON public.profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.user_preferences up 
            WHERE up.user_id = profiles.id 
            AND up.profile_visibility = 'public'
        ) OR auth.uid() = id
    );

-- Farms: Users can manage their own farms
CREATE POLICY "Users can view own farms" ON public.farms
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own farms" ON public.farms
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own farms" ON public.farms
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own farms" ON public.farms
    FOR DELETE USING (auth.uid() = user_id);

-- Fields: Users can manage fields in their farms
CREATE POLICY "Users can view own fields" ON public.fields
    FOR SELECT USING (
        auth.uid() IN (
            SELECT user_id FROM public.farms WHERE id = farm_id
        )
    );

CREATE POLICY "Users can manage own fields" ON public.fields
    FOR ALL USING (
        auth.uid() IN (
            SELECT user_id FROM public.farms WHERE id = farm_id
        )
    );

-- Crop Types: Everyone can view, only system/admin can modify
CREATE POLICY "Anyone can view crop types" ON public.crop_types
    FOR SELECT USING (true);

CREATE POLICY "System can insert crop types" ON public.crop_types
    FOR INSERT WITH CHECK (true); -- For system inserts via API

-- Crops: Users can manage crops in their fields
CREATE POLICY "Users can view own crops" ON public.crops
    FOR SELECT USING (
        auth.uid() IN (
            SELECT f.user_id FROM public.farms f
            JOIN public.fields fi ON f.id = fi.farm_id
            WHERE fi.id = field_id
        )
    );

CREATE POLICY "Users can manage own crops" ON public.crops
    FOR ALL USING (
        auth.uid() IN (
            SELECT f.user_id FROM public.farms f
            JOIN public.fields fi ON f.id = fi.farm_id
            WHERE fi.id = field_id
        )
    );

-- IoT Devices: Users can manage devices in their farms/fields
CREATE POLICY "Users can view own iot devices" ON public.iot_devices
    FOR SELECT USING (
        auth.uid() IN (
            SELECT user_id FROM public.farms WHERE id = farm_id
        ) OR 
        auth.uid() IN (
            SELECT f.user_id FROM public.farms f
            JOIN public.fields fi ON f.id = fi.farm_id
            WHERE fi.id = field_id
        )
    );

CREATE POLICY "Users can manage own iot devices" ON public.iot_devices
    FOR ALL USING (
        auth.uid() IN (
            SELECT user_id FROM public.farms WHERE id = farm_id
        ) OR 
        auth.uid() IN (
            SELECT f.user_id FROM public.farms f
            JOIN public.fields fi ON f.id = fi.farm_id
            WHERE fi.id = field_id
        )
    );

-- Sensor Readings: Users can view readings from their devices
CREATE POLICY "Users can view own sensor readings" ON public.sensor_readings
    FOR SELECT USING (
        device_id IN (
            SELECT id FROM public.iot_devices WHERE 
            auth.uid() IN (
                SELECT user_id FROM public.farms WHERE id = farm_id
            ) OR 
            auth.uid() IN (
                SELECT f.user_id FROM public.farms f
                JOIN public.fields fi ON f.id = fi.farm_id
                WHERE fi.id = field_id
            )
        )
    );

CREATE POLICY "System can insert sensor readings" ON public.sensor_readings
    FOR INSERT WITH CHECK (true); -- For IoT device inserts

-- Weather Data: Everyone can view (public data)
CREATE POLICY "Anyone can view weather data" ON public.weather_data
    FOR SELECT USING (true);

CREATE POLICY "System can insert weather data" ON public.weather_data
    FOR INSERT WITH CHECK (true); -- For weather service inserts

-- Posts: Users can view all posts, manage their own
CREATE POLICY "Anyone can view published posts" ON public.posts
    FOR SELECT USING (is_published = true);

CREATE POLICY "Users can manage own posts" ON public.posts
    FOR ALL USING (auth.uid() = user_id);

-- Comments: Users can view all comments, manage their own
CREATE POLICY "Anyone can view comments" ON public.comments
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.posts WHERE id = post_id AND is_published = true)
    );

CREATE POLICY "Users can manage own comments" ON public.comments
    FOR ALL USING (auth.uid() = user_id);

-- Post Likes: Users can manage their own likes
CREATE POLICY "Users can view post likes" ON public.post_likes
    FOR SELECT USING (true);

CREATE POLICY "Users can manage own post likes" ON public.post_likes
    FOR ALL USING (auth.uid() = user_id);

-- Comment Likes: Users can manage their own likes
CREATE POLICY "Users can view comment likes" ON public.comment_likes
    FOR SELECT USING (true);

CREATE POLICY "Users can manage own comment likes" ON public.comment_likes
    FOR ALL USING (auth.uid() = user_id);

-- Recommendations: Users can only see their own
CREATE POLICY "Users can view own recommendations" ON public.recommendations
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own recommendations" ON public.recommendations
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "System can insert recommendations" ON public.recommendations
    FOR INSERT WITH CHECK (true); -- For AI system inserts

-- Weather Alerts: Users can only see their own
CREATE POLICY "Users can view own weather alerts" ON public.weather_alerts
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own weather alerts" ON public.weather_alerts
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "System can insert weather alerts" ON public.weather_alerts
    FOR INSERT WITH CHECK (true); -- For weather service inserts

-- Notifications: Users can only see their own
CREATE POLICY "Users can view own notifications" ON public.notifications
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications" ON public.notifications
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "System can insert notifications" ON public.notifications
    FOR INSERT WITH CHECK (true); -- For system notifications

-- User preferences: Users can manage their own preferences
CREATE POLICY "Users can manage own preferences" ON public.user_preferences
    FOR ALL USING (auth.uid() = user_id);
