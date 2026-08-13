/**
 * Funciones de utilidad para sincronizar favoritos y eventos guardados del usuario logeado.
 */

export function getUserSavedItems(): { favoritePropertyIds: string[]; savedEventIds: string[] } {
  if (typeof window === 'undefined') return { favoritePropertyIds: [], savedEventIds: [] };
  const userStr = localStorage.getItem('user');
  if (!userStr) return { favoritePropertyIds: [], savedEventIds: [] };
  try {
    const user = JSON.parse(userStr);
    return {
      favoritePropertyIds: Array.isArray(user.favoritePropertyIds) ? user.favoritePropertyIds : [],
      savedEventIds: Array.isArray(user.savedEventIds) ? user.savedEventIds : [],
    };
  } catch (_) {
    return { favoritePropertyIds: [], savedEventIds: [] };
  }
}

export async function toggleFavoritePropertyApi(propertyId: string): Promise<{
  success: boolean;
  requireLogin?: boolean;
  isFavorite?: boolean;
  favoritePropertyIds?: string[];
}> {
  const token = localStorage.getItem('token');
  if (!token) return { success: false, requireLogin: true };

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/favorites/property/${propertyId}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) throw new Error('No se pudo actualizar favoritos');

    const data = await res.json();
    const storedUserStr = localStorage.getItem('user');
    if (storedUserStr) {
      try {
        const parsed = JSON.parse(storedUserStr);
        parsed.favoritePropertyIds = data.favoritePropertyIds;
        localStorage.setItem('user', JSON.stringify(parsed));
      } catch (_) {}
    }

    window.dispatchEvent(new Event('user-favorites-updated'));
    return { success: true, isFavorite: data.isFavorite, favoritePropertyIds: data.favoritePropertyIds };
  } catch (err) {
    return { success: false };
  }
}

export async function toggleSavedEventApi(eventId: string): Promise<{
  success: boolean;
  requireLogin?: boolean;
  isSaved?: boolean;
  savedEventIds?: string[];
}> {
  const token = localStorage.getItem('token');
  if (!token) return { success: false, requireLogin: true };

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/favorites/event/${eventId}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) throw new Error('No se pudo actualizar eventos guardados');

    const data = await res.json();
    const storedUserStr = localStorage.getItem('user');
    if (storedUserStr) {
      try {
        const parsed = JSON.parse(storedUserStr);
        parsed.savedEventIds = data.savedEventIds;
        localStorage.setItem('user', JSON.stringify(parsed));
      } catch (_) {}
    }

    window.dispatchEvent(new Event('user-favorites-updated'));
    return { success: true, isSaved: data.isSaved, savedEventIds: data.savedEventIds };
  } catch (err) {
    return { success: false };
  }
}
