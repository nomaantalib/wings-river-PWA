// Database & Storage Interface Layer — Re-exporting from MVC Models & Controllers
export type { Reservation } from '@/models/ReservationModel';
export type { MenuItem, MenuPageDefinition } from '@/models/MenuModel';
export type { BlogPost } from '@/models/BlogModel';
export type { GalleryItem } from '@/models/GalleryModel';
export type { Review, ContactMessage } from '@/models/ReviewModel';

export { MENU_BOOKLET_PAGES, INITIAL_MENU_ITEMS } from '@/models/MenuModel';
export { INITIAL_BLOGS } from '@/models/BlogModel';
export { INITIAL_GALLERY } from '@/models/GalleryModel';
export { INITIAL_REVIEWS } from '@/models/ReviewModel';

export type { EventBanner } from '@/controllers/StorageController';

export {
  // Reservations
  getStoredReservations,
  saveReservation,
  updateReservationStatus,
  deleteReservation,
  // Gallery
  getStoredGalleryItems,
  saveGalleryItem,
  updateGalleryItem,
  deleteGalleryItem,
  // Menu
  getStoredMenuItems,
  saveMenuItem,
  updateMenuItem,
  deleteMenuItem,
  // Blogs
  getStoredBlogs,
  saveBlog,
  updateBlog,
  deleteBlog,
  // Reviews
  getStoredReviews,
  saveReview,
  deleteReview,
  // Contact
  getStoredContactMessages,
  saveContactMessage,
  deleteContactMessage,
  // Event Banners
  getStoredEventBanners,
  saveEventBanner,
  updateEventBanner,
  deleteEventBanner,
  toggleEventBanner,
} from '@/controllers/StorageController';
