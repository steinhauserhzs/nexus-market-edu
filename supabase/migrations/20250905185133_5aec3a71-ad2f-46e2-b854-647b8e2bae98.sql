-- Create table for AI code reviews
CREATE TABLE public.code_reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  file_name TEXT NOT NULL,
  review_type TEXT NOT NULL CHECK (review_type IN ('security', 'performance', 'functionality', 'complete')),
  issues_found INTEGER NOT NULL DEFAULT 0,
  overall_score INTEGER NOT NULL DEFAULT 0 CHECK (overall_score >= 0 AND overall_score <= 100),
  critical_issues INTEGER NOT NULL DEFAULT 0,
  high_issues INTEGER NOT NULL DEFAULT 0,
  medium_issues INTEGER NOT NULL DEFAULT 0,
  low_issues INTEGER NOT NULL DEFAULT 0,
  review_data JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.code_reviews ENABLE ROW LEVEL SECURITY;

-- Create policies for code reviews
CREATE POLICY "Only admins can view code reviews" 
ON public.code_reviews 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM profiles p
  WHERE p.id = auth.uid() AND p.role = 'admin'
));

CREATE POLICY "System can insert code reviews" 
ON public.code_reviews 
FOR INSERT 
WITH CHECK (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_code_reviews_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_code_reviews_updated_at
BEFORE UPDATE ON public.code_reviews
FOR EACH ROW
EXECUTE FUNCTION public.update_code_reviews_updated_at();

-- Create indexes for better performance
CREATE INDEX idx_code_reviews_file_name ON public.code_reviews(file_name);
CREATE INDEX idx_code_reviews_review_type ON public.code_reviews(review_type);
CREATE INDEX idx_code_reviews_created_at ON public.code_reviews(created_at DESC);
CREATE INDEX idx_code_reviews_critical_issues ON public.code_reviews(critical_issues) WHERE critical_issues > 0;