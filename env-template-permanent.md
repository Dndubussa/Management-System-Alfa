# Permanent Environment Configuration

## 🔧 **Create `.env.local` File**

Create a `.env.local` file in your project root with the following content:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_KEY=your-anon-key-here
VITE_USE_SUPABASE=true
```

## 📋 **How to Get Your Supabase Values**

1. **Go to your Supabase Dashboard**
2. **Click on Settings → API**
3. **Copy the Project URL** → Use as `VITE_SUPABASE_URL`
4. **Copy the anon/public key** → Use as `VITE_SUPABASE_KEY`

## 🎯 **What This Does**

- ✅ **`VITE_SUPABASE_URL`**: Tells the app where your Supabase project is
- ✅ **`VITE_SUPABASE_KEY`**: Provides authentication for Supabase API calls
- ✅ **`VITE_USE_SUPABASE=true`**: Forces Supabase usage (optional but recommended)

## 🚀 **Result**

With these environment variables set:
- ✅ **Development**: Uses Supabase (same as production)
- ✅ **Production**: Uses Supabase
- ✅ **Consistent behavior** across all environments
- ✅ **No more service selection issues**

## 📁 **File Location**

Create the file at: `G:\DEV\alfa-ms-new-main\.env.local`

**After creating this file, restart your development server for the changes to take effect!**
