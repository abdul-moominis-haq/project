-- Function to handle new user profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, name, location)
  VALUES (
    new.id, 
    new.raw_user_meta_data->>'name',
    new.raw_user_meta_data->>'location'
  );
  RETURN new;
END;
$$ language plpgsql security definer;

-- Trigger the function every time a user is created
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Create RLS policies for profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policy to allow users to view and edit their own profile
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Policy to allow profile creation (handled by trigger)
CREATE POLICY "Enable insert for users based on user_id" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Similar policies for other tables
ALTER TABLE public.crops ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own crops" ON public.crops
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own crops" ON public.crops
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own crops" ON public.crops
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own crops" ON public.crops
  FOR DELETE USING (auth.uid() = user_id);

-- Weather data policies
ALTER TABLE public.weather_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own weather data" ON public.weather_data
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own weather data" ON public.weather_data
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Community posts policies
ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all community posts" ON public.community_posts
  FOR SELECT USING (true);

CREATE POLICY "Users can insert own posts" ON public.community_posts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own posts" ON public.community_posts
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own posts" ON public.community_posts
  FOR DELETE USING (auth.uid() = user_id);

-- Comments policies
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all comments" ON public.comments
  FOR SELECT USING (true);

CREATE POLICY "Users can insert own comments" ON public.comments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own comments" ON public.comments
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own comments" ON public.comments
  FOR DELETE USING (auth.uid() = user_id);
