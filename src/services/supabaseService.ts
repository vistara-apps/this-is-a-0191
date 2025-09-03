import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { User, ClaimBatch, Photo } from '../types';

// These would typically be in environment variables
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'your-supabase-url';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-supabase-anon-key';

class SupabaseService {
  private supabase: SupabaseClient;
  
  constructor() {
    this.supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }

  // Auth methods
  async signUp(email: string, password: string): Promise<{ user: any; error: any }> {
    const { data, error } = await this.supabase.auth.signUp({
      email,
      password,
    });
    
    if (data.user && !error) {
      // Create a user record in the users table
      await this.createUserProfile(data.user.id, email);
    }
    
    return { user: data.user, error };
  }

  async signIn(email: string, password: string): Promise<{ user: any; error: any }> {
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    return { user: data.user, error };
  }

  async signOut(): Promise<{ error: any }> {
    const { error } = await this.supabase.auth.signOut();
    return { error };
  }

  async resetPassword(email: string): Promise<{ error: any }> {
    const { error } = await this.supabase.auth.resetPasswordForEmail(email);
    return { error };
  }

  async getCurrentUser(): Promise<{ user: any; error: any }> {
    const { data, error } = await this.supabase.auth.getUser();
    return { user: data.user, error };
  }

  async getSession(): Promise<{ session: any; error: any }> {
    const { data, error } = await this.supabase.auth.getSession();
    return { session: data.session, error };
  }

  // User profile methods
  async createUserProfile(userId: string, email: string): Promise<{ user: any; error: any }> {
    const { data, error } = await this.supabase
      .from('users')
      .insert([
        { 
          id: userId, 
          email, 
          subscription_plan: 'basic',
          created_at: new Date()
        }
      ])
      .select()
      .single();
    
    return { user: data, error };
  }

  async getUserProfile(userId: string): Promise<{ user: any; error: any }> {
    const { data, error } = await this.supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();
    
    return { user: data, error };
  }

  async updateUserProfile(userId: string, updates: Partial<User>): Promise<{ user: any; error: any }> {
    const { data, error } = await this.supabase
      .from('users')
      .update({
        email: updates.email,
        subscription_plan: updates.subscriptionPlan,
        // Add other fields as needed
      })
      .eq('id', userId)
      .select()
      .single();
    
    return { user: data, error };
  }

  // Claim batch methods
  async createClaimBatch(batch: Omit<ClaimBatch, 'id'>): Promise<{ batch: any; error: any }> {
    const { data, error } = await this.supabase
      .from('claim_batches')
      .insert([
        {
          user_id: batch.userId,
          uploaded_at: batch.uploadedAt,
          processed_at: batch.processedAt,
          status: batch.status,
          report_url: batch.reportUrl
        }
      ])
      .select()
      .single();
    
    return { batch: data, error };
  }

  async getClaimBatches(userId: string): Promise<{ batches: any[]; error: any }> {
    const { data, error } = await this.supabase
      .from('claim_batches')
      .select('*, photos(*)')
      .eq('user_id', userId)
      .order('uploaded_at', { ascending: false });
    
    return { batches: data || [], error };
  }

  async getClaimBatch(batchId: string): Promise<{ batch: any; error: any }> {
    const { data, error } = await this.supabase
      .from('claim_batches')
      .select('*, photos(*)')
      .eq('id', batchId)
      .single();
    
    return { batch: data, error };
  }

  async updateClaimBatch(batchId: string, updates: Partial<ClaimBatch>): Promise<{ batch: any; error: any }> {
    const { data, error } = await this.supabase
      .from('claim_batches')
      .update({
        processed_at: updates.processedAt,
        status: updates.status,
        report_url: updates.reportUrl
      })
      .eq('id', batchId)
      .select()
      .single();
    
    return { batch: data, error };
  }

  // Photo methods
  async createPhoto(photo: Omit<Photo, 'id'>, batchId: string): Promise<{ photo: any; error: any }> {
    const { data, error } = await this.supabase
      .from('photos')
      .insert([
        {
          batch_id: batchId,
          url: photo.url,
          name: photo.name,
          size: photo.size,
          ai_tags: photo.aiTags,
          is_duplicate: photo.isDuplicate,
          quality_score: photo.qualityScore,
          damage_type: photo.damageType,
          location_tag: photo.locationTag,
          processed_at: photo.processedAt
        }
      ])
      .select()
      .single();
    
    return { photo: data, error };
  }

  async getPhotos(batchId: string): Promise<{ photos: any[]; error: any }> {
    const { data, error } = await this.supabase
      .from('photos')
      .select('*')
      .eq('batch_id', batchId);
    
    return { photos: data || [], error };
  }

  // Storage methods
  async uploadPhoto(file: File, userId: string): Promise<{ url: string; error: any }> {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/${Date.now()}.${fileExt}`;
    const filePath = `photos/${fileName}`;
    
    const { data, error } = await this.supabase.storage
      .from('claim-photos')
      .upload(filePath, file);
    
    if (error) {
      return { url: '', error };
    }
    
    const { data: urlData } = this.supabase.storage
      .from('claim-photos')
      .getPublicUrl(filePath);
    
    return { url: urlData.publicUrl, error: null };
  }

  async deletePhoto(filePath: string): Promise<{ error: any }> {
    const { error } = await this.supabase.storage
      .from('claim-photos')
      .remove([filePath]);
    
    return { error };
  }
}

export const supabaseService = new SupabaseService();

