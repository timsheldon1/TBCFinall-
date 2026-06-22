# User Registration & Authentication Setup

This guide explains how user signup details are automatically stored in Supabase when users create accounts.

## Overview

When users sign up through the website, their information is automatically stored in both:
1. **Supabase Auth** (built-in authentication)
2. **Custom `users` table** (profile and role information)

## Database Trigger Setup

Run this SQL in your Supabase SQL Editor:

```sql
-- Copy and paste the contents of create-user-trigger.sql
```

This creates:
- ✅ Automatic user creation in `users` table when someone signs up
- ✅ Row Level Security policies for user data protection
- ✅ Automatic timestamp updates
- ✅ Role-based access control

## What Happens During Signup

1. **User fills signup form** → Enters name, email, password
2. **Form submits to Supabase Auth** → Creates auth user with metadata
3. **Database trigger fires** → Automatically creates record in `users` table
4. **User is redirected** → Can now login and access protected features

## Users Table Structure

```sql
users (
  id UUID PRIMARY KEY,           -- Matches auth.users.id
  email TEXT UNIQUE NOT NULL,    -- User's email address
  full_name TEXT,               -- User's full name
  phone TEXT,                   -- Optional phone number
  nationality TEXT,             -- Optional nationality
  dietary_restrictions TEXT[],  -- Optional dietary preferences
  emergency_contact JSONB,      -- Optional emergency contact
  role TEXT DEFAULT 'guest',    -- User role (guest, admin, etc.)
  created_at TIMESTAMP,         -- Account creation date
  updated_at TIMESTAMP          -- Last update timestamp
)
```

## RLS Policies Created

- **Users can view own profile** → Users can only see their own data
- **Users can update own profile** → Users can modify their own information
- **Service role can create users** → Allows the trigger to create records
- **Admins can manage all users** → Admin users have full access

## Testing the Setup

1. **Run the SQL trigger script** in Supabase SQL Editor
2. **Test signup** by creating a new account on your website
3. **Check users table** in Supabase dashboard - new user should appear automatically
4. **Test login** with the new account
5. **Verify permissions** - user should be able to leave reviews

## Troubleshooting

### User not created in users table
- Check if trigger script ran successfully
- Verify RLS policies allow the trigger to insert
- Check Supabase logs for any errors

### Authentication errors
- Ensure environment variables are set correctly
- Check that Supabase project is properly configured
- Verify email confirmation settings in Supabase Auth

### Permission errors
- Check RLS policies in Supabase dashboard
- Ensure user has proper role assigned
- Verify auth context is working in the app

## Integration with Reviews

Once users are properly created in the database:
- ✅ Users can login and access review forms
- ✅ User bookings are linked to their account
- ✅ Reviews are associated with authenticated users
- ✅ User profiles can be extended with more fields
