import api, { initAuthFromStorage } from '@/lib/api';
import { ItineraryDayForm } from '@/types/package';

/**
 * Fetch itinerary days for a package and save itinerary for a package
 * Replaces old Supabase-based itinerary helpers with backend API calls
 */
export const fetchItinerariesForPackage = async (packageId: string): Promise<ItineraryDayForm[]> => {
  try {
    initAuthFromStorage();
    const res = await api.get(`/packages/${packageId}`);
    if (res?.data?.success && res.data.package) {
      const pkg = res.data.package;
      // Normalise to the front-end form shape
      const itinerary = (pkg.itinerary || []).map((d: any) => ({
        day: d.dayNumber ?? d.day ?? 0,
        title: d.title || d.name || '',
        description: d.description || d.location || '',
        activities: d.activities || [],
        image: d.image || ''
      }));
      return itinerary as ItineraryDayForm[];
    }
    return [];
  } catch (err) {
    console.error('Error fetching itineraries for package', packageId, err);
    return [];
  }
};

export const saveItineraryForPackage = async (packageId: string, days: ItineraryDayForm[]) => {
  try {
    initAuthFromStorage();
    // Map to expected backend shape
    const itinerary = days.map(d => ({
      dayNumber: d.day,
      title: d.title,
      description: d.description,
      activities: d.activities || [],
      image: d.image || ''
    }));

    const res = await api.put(`/packages/${packageId}`, { itinerary });
    return res?.data;
  } catch (err) {
    console.error('Error saving itinerary for package', packageId, err);
    throw err;
  }
};

export default fetchItinerariesForPackage;
