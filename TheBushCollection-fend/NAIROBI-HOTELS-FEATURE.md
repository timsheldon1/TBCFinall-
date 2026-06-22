# Nairobi Hotels Feature

## Overview
Added a dedicated section in the Collections page to showcase Nairobi hotels for pre-safari overnight stays.

## What Was Added

### 1. **New Nairobi Hotels Section** (`Collections.tsx`)
- **Featured Section**: Prominently displays Nairobi hotels with a distinctive amber/orange gradient background
- **Special Badge**: "Pre-Safari Accommodation" badge to highlight the purpose
- **Location Badge**: Orange "Nairobi" badge on each hotel card
- **Informational Panel**: Explains why staying in Nairobi is beneficial for safari travelers

### 2. **Key Features**
- Filters Nairobi hotels automatically (properties with "Nairobi" in location or type "hotel")
- Shows hotels before other property types for better visibility
- Includes helpful context about international flights and time zone adjustment
- Updated stats section to show count of Nairobi hotels

### 3. **Sample Data** (`add-nairobi-hotels.sql`)
Four Nairobi hotels have been prepared:
- **Nairobi Serena Hotel** - Luxury hotel in city center ($180/night)
- **The Boma Nairobi** - Boutique hotel near airport ($120/night)
- **Hemingways Nairobi** - Elegant hotel in Karen ($250/night)
- **Crowne Plaza Nairobi Airport** - Modern airport hotel ($140/night)

Each hotel includes:
- Detailed descriptions
- Amenities (airport transfers, WiFi, restaurants, etc.)
- Room options with pricing
- High-quality images
- Ratings and reviews

## How to Use

### Step 1: Add Hotels to Database
Run the SQL script in your Supabase SQL Editor:
```bash
# File: add-nairobi-hotels.sql
```

This will:
1. Insert 4 Nairobi hotels into `safari_properties`
2. Add room options for each hotel
3. Set appropriate amenities and pricing

### Step 2: View the Section
1. Navigate to the Collections page
2. The Nairobi Hotels section will appear first (if hotels exist)
3. Section features:
   - Amber/orange gradient background
   - "Pre-Safari Accommodation" badge
   - Explanation of why Nairobi stays are beneficial
   - Hotel cards with special "Nairobi" badges

### Step 3: Filter and Search
- Use the search bar to find specific hotels
- Filter by location: "Nairobi, Kenya"
- Filter by type: "hotel"

## Design Highlights

### Visual Elements
- **Color Scheme**: Amber/orange to differentiate from safari properties
- **Badge System**: Clear labeling for pre-safari accommodation
- **Informational Panel**: White card with orange accents explaining benefits
- **Responsive Grid**: 1-3 columns depending on screen size

### User Experience
- **Prominent Placement**: Shows before other property types
- **Clear Purpose**: Explains the role of Nairobi hotels in safari planning
- **Easy Booking**: Each hotel card links to booking flow
- **Stats Integration**: Nairobi hotel count in statistics section

## Benefits for Clients

1. **Convenience**: Easy to find overnight accommodation near airport
2. **Planning**: Helps clients understand the typical safari journey
3. **Rest**: Emphasizes importance of rest before safari
4. **Options**: Multiple price points and locations in Nairobi
5. **Transfers**: All hotels offer airport transfer services

## Technical Details

### Code Changes
- **File**: `src/pages/Collections.tsx`
- **Lines Added**: ~50 lines
- **New Logic**: 
  - Filter for Nairobi hotels
  - Conditional rendering of special section
  - Updated stats grid (4 to 5 columns)

### Database Schema
Uses existing `safari_properties` and `safari_rooms` tables:
- Type: "hotel"
- Location: "Nairobi, Kenya"
- Safari Zone: "Nairobi"

### Filtering Logic
```typescript
const nairobiHotels = filteredProperties.filter(p => 
  (p.location || '').toLowerCase().includes('nairobi') || 
  (p.type || '').toLowerCase() === 'hotel'
);
```

## Future Enhancements

Potential improvements:
1. Add "Add to Safari Package" button to combine hotel + safari
2. Show distance/time to airport
3. Add "Early Morning Departure" badge for hotels offering this
4. Integration with flight arrival times
5. Package deals (hotel + safari combo)
6. Map showing hotel locations in Nairobi

## Maintenance

### Adding More Hotels
To add more Nairobi hotels:
1. Use the same SQL INSERT pattern from `add-nairobi-hotels.sql`
2. Ensure location includes "Nairobi"
3. Set type as "hotel"
4. Add appropriate amenities (especially "Airport Transfer")

### Updating Content
- Hotel descriptions can be updated in the database
- Section text can be modified in `Collections.tsx` lines 185-215
- Colors and styling can be adjusted using Tailwind classes

---

**Status**: ✅ Complete and ready to use
**Next Step**: Run `add-nairobi-hotels.sql` in Supabase to populate hotels
