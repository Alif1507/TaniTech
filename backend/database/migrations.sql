-- Migrations to set up TaniTech Database Schema

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    full_name TEXT,
    phone TEXT,
    whatsapp_number TEXT,
    role TEXT CHECK (role IN ('petani', 'konsumen', 'admin')),
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create farmer_profiles table
CREATE TABLE IF NOT EXISTS public.farmer_profiles (
    user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    farm_name TEXT,
    farm_type TEXT,
    location TEXT,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    bio TEXT,
    rating_avg NUMERIC(2,1) DEFAULT 0 CHECK (rating_avg >= 0 AND rating_avg <= 5),
    crop_type TEXT,
    opt_in_whatsapp_alert BOOLEAN DEFAULT false,
    sustainability_score INT DEFAULT 0
);

-- Enable RLS on farmer_profiles
ALTER TABLE public.farmer_profiles ENABLE ROW LEVEL SECURITY;

-- Create consumer_profiles table
CREATE TABLE IF NOT EXISTS public.consumer_profiles (
    user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    address TEXT,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION
);

-- Enable RLS on consumer_profiles
ALTER TABLE public.consumer_profiles ENABLE ROW LEVEL SECURITY;

-- Create ai_conversations table
CREATE TABLE IF NOT EXISTS public.ai_conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    input_mode TEXT NOT NULL CHECK (input_mode IN ('basic', 'advanced')),
    komoditas TEXT NOT NULL,
    luas_lahan_m2 NUMERIC NOT NULL,
    lokasi TEXT NOT NULL,
    kondisi_saat_ini TEXT NOT NULL,
    budget NUMERIC NOT NULL,
    additional_data JSONB, -- jenis_tanah, kelembaban_tanah, curah_hujan_historis, etc.
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Enable RLS on ai_conversations
ALTER TABLE public.ai_conversations ENABLE ROW LEVEL SECURITY;

-- Create ai_recommendations table
CREATE TABLE IF NOT EXISTS public.ai_recommendations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES public.ai_conversations(id) ON DELETE CASCADE,
    solution_name TEXT NOT NULL,
    description TEXT NOT NULL,
    estimated_cost NUMERIC NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Enable RLS on ai_recommendations
ALTER TABLE public.ai_recommendations ENABLE ROW LEVEL SECURITY;

-- Create recommendation_components table
CREATE TABLE IF NOT EXISTS public.recommendation_components (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recommendation_id UUID NOT NULL REFERENCES public.ai_recommendations(id) ON DELETE CASCADE,
    component_name TEXT NOT NULL,
    description TEXT NOT NULL,
    price NUMERIC NOT NULL,
    image_url TEXT,
    buy_link_online TEXT,
    store_location_text TEXT,
    store_lat DOUBLE PRECISION,
    store_lng DOUBLE PRECISION
);

-- Enable RLS on recommendation_components
ALTER TABLE public.recommendation_components ENABLE ROW LEVEL SECURITY;

-- Create simulation_results table
CREATE TABLE IF NOT EXISTS public.simulation_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recommendation_id UUID NOT NULL REFERENCES public.ai_recommendations(id) ON DELETE CASCADE,
    current_yield_kg NUMERIC NOT NULL,
    projected_yield_kg NUMERIC NOT NULL,
    yield_increase_percent NUMERIC NOT NULL,
    current_failure_rate TEXT NOT NULL,
    projected_failure_rate TEXT NOT NULL,
    water_usage_reduction_percent NUMERIC NOT NULL,
    investment_cost NUMERIC NOT NULL,
    additional_income_per_cycle NUMERIC NOT NULL,
    breakeven_cycle INT NOT NULL,
    breakeven_months NUMERIC NOT NULL,
    projected_net_profit_year1 NUMERIC NOT NULL,
    risk_drought_before TEXT CHECK (risk_drought_before IN ('low', 'medium', 'high')),
    risk_drought_after TEXT CHECK (risk_drought_after IN ('low', 'medium', 'high')),
    risk_pest_level TEXT CHECK (risk_pest_level IN ('low', 'medium', 'high')),
    confidence_level NUMERIC NOT NULL,
    ai_insight_text TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Enable RLS on simulation_results
ALTER TABLE public.simulation_results ENABLE ROW LEVEL SECURITY;

-- Create simulation_scenarios table
CREATE TABLE IF NOT EXISTS public.simulation_scenarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    simulation_id UUID NOT NULL REFERENCES public.simulation_results(id) ON DELETE CASCADE,
    scenario_label TEXT NOT NULL CHECK (scenario_label IN ('A', 'B', 'C', 'D')),
    scenario_name TEXT NOT NULL,
    total_cost NUMERIC NOT NULL,
    projected_yield_kg NUMERIC NOT NULL,
    breakeven_cycle INT NOT NULL,
    is_within_budget BOOLEAN NOT NULL,
    ai_recommendation_note TEXT
);

-- Enable RLS on simulation_scenarios
ALTER TABLE public.simulation_scenarios ENABLE ROW LEVEL SECURITY;

-- Create categories table
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Enable RLS on categories
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- Create food_posts table
CREATE TABLE IF NOT EXISTS public.food_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    consumer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category_id UUID NOT NULL REFERENCES public.categories(id),
    quantity_needed NUMERIC NOT NULL,
    quantity_fulfilled NUMERIC DEFAULT 0 NOT NULL,
    unit TEXT NOT NULL,
    budget_min NUMERIC NOT NULL,
    budget_max NUMERIC NOT NULL,
    location TEXT NOT NULL,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    deadline DATE NOT NULL,
    status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'partially_fulfilled', 'closed', 'completed', 'cancelled')),
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Enable RLS on food_posts
ALTER TABLE public.food_posts ENABLE ROW LEVEL SECURITY;

-- Create post_offers table
CREATE TABLE IF NOT EXISTS public.post_offers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES public.food_posts(id) ON DELETE CASCADE,
    farmer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    item_name TEXT NOT NULL,
    item_description TEXT NOT NULL,
    image_url TEXT,
    price_per_unit NUMERIC NOT NULL,
    quantity_offered NUMERIC NOT NULL,
    message TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'withdrawn', 'expired')),
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Enable RLS on post_offers
ALTER TABLE public.post_offers ENABLE ROW LEVEL SECURITY;

-- Create transactions table
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES public.food_posts(id) ON DELETE CASCADE,
    offer_id UUID NOT NULL REFERENCES public.post_offers(id) ON DELETE CASCADE,
    consumer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    farmer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    final_price NUMERIC NOT NULL,
    final_quantity NUMERIC NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Enable RLS on transactions
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Create reviews table
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_id UUID NOT NULL REFERENCES public.transactions(id) ON DELETE CASCADE,
    reviewer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    reviewee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Enable RLS on reviews
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Create education_articles table
CREATE TABLE IF NOT EXISTS public.education_articles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    category TEXT NOT NULL, -- e.g., 'sustainability'
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Enable RLS on education_articles
ALTER TABLE public.education_articles ENABLE ROW LEVEL SECURITY;

-- Create faqs table
CREATE TABLE IF NOT EXISTS public.faqs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Enable RLS on faqs
ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;

-- Create notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Enable RLS on notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Create weather_alerts table
CREATE TABLE IF NOT EXISTS public.weather_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farmer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    weather_summary TEXT NOT NULL,
    risk_type TEXT NOT NULL,
    risk_level TEXT NOT NULL CHECK (risk_level IN ('low', 'medium', 'high')),
    recommendation TEXT NOT NULL,
    source TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Enable RLS on weather_alerts
ALTER TABLE public.weather_alerts ENABLE ROW LEVEL SECURITY;

---------------------------------------------------------
-- DB TRIGGERS & FUNCTIONS
---------------------------------------------------------

-- 1. Trigger handler to automatically create public profiles upon Auth User creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, phone, whatsapp_number, role, avatar_url)
    VALUES (
        new.id,
        new.email,
        COALESCE(new.raw_user_meta_data->>'full_name', ''),
        COALESCE(new.raw_user_meta_data->>'phone', ''),
        COALESCE(new.raw_user_meta_data->>'whatsapp_number', ''),
        COALESCE(new.raw_user_meta_data->>'role', 'konsumen'),
        COALESCE(new.raw_user_meta_data->>'avatar_url', '')
    );

    -- Create corresponding sub-profile depending on role
    IF COALESCE(new.raw_user_meta_data->>'role', 'konsumen') = 'petani' THEN
        INSERT INTO public.farmer_profiles (user_id)
        VALUES (new.id);
    ELSIF COALESCE(new.raw_user_meta_data->>'role', 'konsumen') = 'konsumen' THEN
        INSERT INTO public.consumer_profiles (user_id)
        VALUES (new.id);
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Bind trigger to auth.users
CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 2. Trigger handler to recalculate farmer profile ratings when a review is added/modified
CREATE OR REPLACE FUNCTION public.update_farmer_rating()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.farmer_profiles
    SET rating_avg = COALESCE(
        (SELECT AVG(rating)::numeric(2,1)
         FROM public.reviews
         WHERE reviewee_id = NEW.reviewee_id), 0
    )
    WHERE user_id = NEW.reviewee_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_review_upsert
    AFTER INSERT OR UPDATE ON public.reviews
    FOR EACH ROW EXECUTE FUNCTION public.update_farmer_rating();

-- 3. Trigger handler to recalculate farmer profile ratings when a review is deleted
CREATE OR REPLACE FUNCTION public.update_farmer_rating_on_delete()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.farmer_profiles
    SET rating_avg = COALESCE(
        (SELECT AVG(rating)::numeric(2,1)
         FROM public.reviews
         WHERE reviewee_id = OLD.reviewee_id), 0
    )
    WHERE user_id = OLD.reviewee_id;
    
    RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_review_delete
    AFTER DELETE ON public.reviews
    FOR EACH ROW EXECUTE FUNCTION public.update_farmer_rating_on_delete();

-- 4. Trigger handler to update food post quantity_fulfilled when offers are accepted
CREATE OR REPLACE FUNCTION public.update_food_post_fulfillment()
RETURNS TRIGGER AS $$
DECLARE
    total_accepted NUMERIC;
    needed_qty NUMERIC;
    post_owner UUID;
BEGIN
    -- Only trigger if status changed to accepted, or if it changed from accepted to something else
    IF (TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status) OR (TG_OP = 'INSERT') THEN
        -- Recalculate total quantity fulfilled for this post
        SELECT COALESCE(SUM(quantity_offered), 0)
        INTO total_accepted
        FROM public.post_offers
        WHERE post_id = COALESCE(NEW.post_id, OLD.post_id) AND status = 'accepted';

        -- Update the food post and get quantity_needed and consumer_id
        UPDATE public.food_posts
        SET quantity_fulfilled = total_accepted
        WHERE id = COALESCE(NEW.post_id, OLD.post_id)
        RETURNING quantity_needed, consumer_id INTO needed_qty, post_owner;

        -- If new offer is accepted, we also handle post status transition
        IF (TG_OP = 'UPDATE' AND OLD.status != 'accepted' AND NEW.status = 'accepted') OR (TG_OP = 'INSERT' AND NEW.status = 'accepted') THEN
            -- Check if total accepted quantity >= quantity_needed, and if so, auto-close the post
            IF total_accepted >= needed_qty THEN
                UPDATE public.food_posts
                SET status = 'closed'
                WHERE id = COALESCE(NEW.post_id, OLD.post_id) AND status NOT IN ('closed', 'completed', 'cancelled');
                
                -- Auto-expire pending offers
                UPDATE public.post_offers
                SET status = 'expired'
                WHERE post_id = COALESCE(NEW.post_id, OLD.post_id) AND status = 'pending';
            ELSIF total_accepted > 0 THEN
                UPDATE public.food_posts
                SET status = 'partially_fulfilled'
                WHERE id = COALESCE(NEW.post_id, OLD.post_id) AND status = 'open';
            END IF;
        END IF;

        -- If status changed FROM accepted to something else (e.g. withdrawn, expired)
        IF (TG_OP = 'UPDATE' AND OLD.status = 'accepted' AND NEW.status != 'accepted') THEN
            IF total_accepted >= needed_qty THEN
                UPDATE public.food_posts
                SET status = 'closed'
                WHERE id = COALESCE(NEW.post_id, OLD.post_id) AND status NOT IN ('closed', 'completed', 'cancelled');
            ELSIF total_accepted > 0 THEN
                UPDATE public.food_posts
                SET status = 'partially_fulfilled'
                WHERE id = COALESCE(NEW.post_id, OLD.post_id) AND status IN ('open', 'closed');
            ELSE
                UPDATE public.food_posts
                SET status = 'open'
                WHERE id = COALESCE(NEW.post_id, OLD.post_id) AND status IN ('partially_fulfilled', 'closed');
            END IF;
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_post_offer_status_change
    AFTER INSERT OR UPDATE ON public.post_offers
    FOR EACH ROW EXECUTE FUNCTION public.update_food_post_fulfillment();

---------------------------------------------------------
-- ROW LEVEL SECURITY (RLS) POLICIES
---------------------------------------------------------

-- 1. Profiles Policies
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles
    FOR SELECT USING (true);

CREATE POLICY "Users can update their own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- 2. Farmer Profiles Policies
CREATE POLICY "Farmer profiles are viewable by everyone" ON public.farmer_profiles
    FOR SELECT USING (true);

CREATE POLICY "Farmers can update their own profile" ON public.farmer_profiles
    FOR UPDATE USING (auth.uid() = user_id);

-- 3. Consumer Profiles Policies
CREATE POLICY "Consumer profiles are viewable by everyone" ON public.consumer_profiles
    FOR SELECT USING (true);

CREATE POLICY "Consumers can update their own profile" ON public.consumer_profiles
    FOR UPDATE USING (auth.uid() = user_id);

-- 4. AI Conversations Policies
CREATE POLICY "Users can view their own AI conversations" ON public.ai_conversations
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own AI conversations" ON public.ai_conversations
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 5. AI Recommendations Policies
CREATE POLICY "Users can view recommendations for their conversations" ON public.ai_recommendations
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.ai_conversations
            WHERE ai_conversations.id = conversation_id AND ai_conversations.user_id = auth.uid()
        )
    );

CREATE POLICY "Users/System can insert AI recommendations" ON public.ai_recommendations
    FOR INSERT WITH CHECK (true); -- System/App performs insertions, validation in API

-- 6. Recommendation Components Policies
CREATE POLICY "Users can view recommendation components" ON public.recommendation_components
    FOR SELECT USING (true);

CREATE POLICY "System can insert recommendation components" ON public.recommendation_components
    FOR INSERT WITH CHECK (true);

-- 7. Simulation Results Policies
CREATE POLICY "Users can view their own simulations" ON public.simulation_results
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.ai_recommendations rec
            JOIN public.ai_conversations conv ON conv.id = rec.conversation_id
            WHERE rec.id = recommendation_id AND conv.user_id = auth.uid()
        )
    );

CREATE POLICY "System can insert simulation results" ON public.simulation_results
    FOR INSERT WITH CHECK (true);

-- 8. Simulation Scenarios Policies
CREATE POLICY "Users can view simulation scenarios" ON public.simulation_scenarios
    FOR SELECT USING (true);

CREATE POLICY "System can insert simulation scenarios" ON public.simulation_scenarios
    FOR INSERT WITH CHECK (true);

-- 9. Categories Policies
CREATE POLICY "Categories are viewable by everyone" ON public.categories
    FOR SELECT USING (true);

CREATE POLICY "Only admins can modify categories" ON public.categories
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );

-- 10. Food Posts Policies
CREATE POLICY "Food posts are viewable by everyone" ON public.food_posts
    FOR SELECT USING (true);

CREATE POLICY "Consumers can create food posts" ON public.food_posts
    FOR INSERT WITH CHECK (
        auth.uid() = consumer_id AND
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'konsumen'
        )
    );

CREATE POLICY "Consumers can update/delete their own food posts" ON public.food_posts
    FOR UPDATE USING (auth.uid() = consumer_id);

CREATE POLICY "Consumers can delete their own food posts" ON public.food_posts
    FOR DELETE USING (auth.uid() = consumer_id);

-- 11. Post Offers Policies
CREATE POLICY "Offers are viewable by the post owner and the offerer" ON public.post_offers
    FOR SELECT USING (
        auth.uid() = farmer_id OR
        EXISTS (
            SELECT 1 FROM public.food_posts
            WHERE food_posts.id = post_id AND food_posts.consumer_id = auth.uid()
        )
    );

CREATE POLICY "Farmers can create offers" ON public.post_offers
    FOR INSERT WITH CHECK (
        auth.uid() = farmer_id AND
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'petani'
        )
    );

CREATE POLICY "Farmers can update/delete their pending offers" ON public.post_offers
    FOR UPDATE USING (auth.uid() = farmer_id AND status = 'pending');

CREATE POLICY "Post owners can update offer status (accept/reject)" ON public.post_offers
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.food_posts
            WHERE food_posts.id = post_id AND food_posts.consumer_id = auth.uid()
        )
    );

-- 12. Transactions Policies
CREATE POLICY "Transactions are viewable by consumer and farmer involved" ON public.transactions
    FOR SELECT USING (auth.uid() = consumer_id OR auth.uid() = farmer_id);

CREATE POLICY "Post owners can create transactions (via accept offer)" ON public.transactions
    FOR INSERT WITH CHECK (auth.uid() = consumer_id);

CREATE POLICY "Involved parties can update transaction status" ON public.transactions
    FOR UPDATE USING (auth.uid() = consumer_id OR auth.uid() = farmer_id);

-- 13. Reviews Policies
CREATE POLICY "Reviews are viewable by everyone" ON public.reviews
    FOR SELECT USING (true);

CREATE POLICY "Involved parties can create reviews for completed transactions" ON public.reviews
    FOR INSERT WITH CHECK (
        (auth.uid() = reviewer_id) AND
        EXISTS (
            SELECT 1 FROM public.transactions
            WHERE transactions.id = transaction_id AND 
                  transactions.status = 'completed' AND
                  (transactions.consumer_id = auth.uid() OR transactions.farmer_id = auth.uid())
        )
    );

-- 14. Education Articles Policies
CREATE POLICY "Articles are viewable by everyone" ON public.education_articles
    FOR SELECT USING (true);

CREATE POLICY "Only admins can modify articles" ON public.education_articles
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );

-- 15. FAQs Policies
CREATE POLICY "FAQs are viewable by everyone" ON public.faqs
    FOR SELECT USING (true);

CREATE POLICY "Only admins can modify FAQs" ON public.faqs
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );

-- 16. Notifications Policies
CREATE POLICY "Users can manage their own notifications" ON public.notifications
    FOR ALL USING (auth.uid() = user_id);

-- 17. Weather Alerts Policies
CREATE POLICY "Farmers can view their own weather alerts" ON public.weather_alerts
    FOR SELECT USING (auth.uid() = farmer_id);

CREATE POLICY "System can manage weather alerts" ON public.weather_alerts
    FOR ALL USING (true);
