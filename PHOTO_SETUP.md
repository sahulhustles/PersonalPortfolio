# Profile Photo Setup Guide

## ✅ What's Been Added

1. **Profile Photo Display**
   - Photo appears on Home page (hero section) - circular
   - Photo appears on About page - rounded rectangle
   - Photos are automatically loaded from Supabase

2. **Admin Panel Photo Management**
   - Upload photos directly from admin panel
   - Support for JPG, PNG, WebP formats
   - Max file size: 5MB
   - Upload to Supabase Storage (or fallback to base64)
   - Remove/delete photos
   - Enter photo URL manually (for external images)

## 📋 Setup Instructions

### Step 1: Update Database Schema

If you already have the `about_content` table, run this migration:

**Go to Supabase Dashboard → SQL Editor → New Query**

```sql
-- Add profile_photo_url column
ALTER TABLE about_content 
ADD COLUMN IF NOT EXISTS profile_photo_url TEXT;
```

Or run the file: `sql/add-profile-photo-column.sql`

### Step 2: Set Up Supabase Storage (Recommended)

1. **Create Storage Bucket:**
   - Go to Supabase Dashboard → Storage
   - Click "Create Bucket"
   - Name: `portfolio-assets`
   - Make it **Public** (toggle ON)
   - Click "Create bucket"

2. **Set Up Storage Policies:**
   - Go to Supabase Dashboard → Storage → Policies
   - Select the `portfolio-assets` bucket
   - Run the SQL from `sql/storage-setup.sql` in the SQL Editor

Or manually create policies:
   - Allow public SELECT (read)
   - Allow public INSERT (upload)
   - Allow public DELETE (remove)

### Step 3: Test Photo Upload

1. Go to your admin panel: `admin-login.html`
2. Login with your credentials
3. Go to "About Page" tab
4. In "Profile Photo" section:
   - Click "Choose File" and select an image
   - Click "Upload Photo"
   - Photo should appear in preview
   - Check your website - photo should appear on Home and About pages

## 🔧 How It Works

### Upload Options

1. **File Upload (Recommended):**
   - Uploads to Supabase Storage
   - Automatic URL generation
   - Images stored in `portfolio-assets/profile-photos/` folder

2. **URL Input:**
   - Enter any image URL (e.g., from Imgur, Cloudinary, etc.)
   - Useful for external hosting

### Photo Display

- **Home Page**: Circular photo (200px max-width) above hero title
- **About Page**: Rounded rectangle photo (250px max-width) above "My Journey" section

## 🎨 Styling

Photos are styled to match your website design:
- Professional shadows and borders
- Responsive sizing
- Smooth loading
- Hidden if no photo is uploaded

## ⚠️ Important Notes

1. **Storage Limits:**
   - Supabase free tier: 1GB storage
   - Each photo typically 100-500KB
   - Recommended: Optimize images before upload

2. **Image Optimization Tips:**
   - Use JPEG for photos (smaller file size)
   - Recommended dimensions: 400x400px to 800x800px
   - Use online tools like TinyPNG or Squoosh to compress

3. **Fallback:**
   - If Supabase Storage is not set up, photos are stored as base64 in localStorage
   - This works but is not recommended for production

## 🐛 Troubleshooting

### Photo not uploading?
- Check browser console (F12) for errors
- Verify Supabase Storage bucket exists and is public
- Check storage policies are set correctly

### Photo not displaying?
- Check if photo URL is saved in database
- Verify photo URL is accessible
- Check browser console for loading errors

### Storage errors?
- Make sure bucket name is exactly `portfolio-assets`
- Verify bucket is set to Public
- Check storage policies allow public access

## 📝 Next Steps

1. Run the database migration SQL
2. Create the Supabase Storage bucket
3. Upload your profile photo through admin panel
4. Enjoy your new photo feature! 🎉

---

**Note:** All existing functionality remains unchanged. The photo feature is completely optional and your website works perfectly without it.

