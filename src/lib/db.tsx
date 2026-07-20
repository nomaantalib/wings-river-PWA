// Database & Storage Interface Layer - Re-exporting from MVC Models & Controllers
export type { Reservation } from '@/models/ReservationModel';
export type { MenuItem, MenuPageDefinition } from '@/models/MenuModel';
export type { BlogPost } from '@/models/BlogModel';
export type { GalleryItem } from '@/models/GalleryModel';
export type { Review, ContactMessage } from '@/models/ReviewModel';

export { MENU_BOOKLET_PAGES, INITIAL_MENU_ITEMS } from '@/models/MenuModel';
export { INITIAL_BLOGS } from '@/models/BlogModel';
export { INITIAL_GALLERY } from '@/models/GalleryModel';
export { INITIAL_REVIEWS } from '@/models/ReviewModel';

export {
  getStoredReservations,
  saveReservation,
  updateReservationStatus,
  getStoredGalleryItems,
  saveGalleryItem,
  deleteGalleryItem,
  getStoredMenuItems,
  saveMenuItem,
  getStoredBlogs,
  saveBlog,
  getStoredReviews,
  saveReview,
  getStoredContactMessages,
  saveContactMessage
} from '@/controllers/StorageController';
