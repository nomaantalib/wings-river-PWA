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

export type { RideTicket } from '@/models/WaterSportsModel';
export { WATER_SPORTS_RIDES } from '@/models/WaterSportsModel';

export type { HeroSlide, HeroSettings } from '@/models/HeroModel';
export { DEFAULT_HERO_SETTINGS, DEFAULT_HERO_SLIDES } from '@/models/HeroModel';

export type { FloorPlanLayout, FloorObject, ObjectCategory, ObjectShape } from '@/models/FloorPlanModel';
export { INITIAL_FLOOR_PLAN } from '@/models/FloorPlanModel';

export {
  getStoredReservations,
  saveReservation,
  updateReservationStatus,
  deleteReservation,
  getStoredGalleryItems,
  saveGalleryItem,
  updateGalleryItem,
  deleteGalleryItem,
  getStoredMenuItems,
  saveMenuItem,
  updateMenuItem,
  deleteMenuItem,
  saveOrder,
  saveCallRequest,
  getStoredBlogs,
  saveBlog,
  updateBlog,
  deleteBlog,
  getStoredReviews,
  saveReview,
  deleteReview,
  getStoredContactMessages,
  saveContactMessage,
  deleteContactMessage,
  getStoredEventBanners,
  saveEventBanner,
  updateEventBanner,
  deleteEventBanner,
  toggleEventBanner,
  getStoredWaterSports,
  saveWaterSports,
  updateWaterSports,
  deleteWaterSports,
  getStoredMenuPages,
  saveMenuPage,
  updateMenuPage,
  deleteMenuPage,
  getStoredHeroSettings,
  saveHeroSettings,
  getStoredCategories,
  saveCategory,
  deleteCategory,
  getStoredFaqs,
  saveFaq,
  deleteFaq,
  getStoredTeamMembers,
  saveTeamMember,
  deleteTeamMember,
  getStoredOffers,
  saveOffer,
  deleteOffer,
  getStoredMedia,
  saveMediaItem,
  deleteMediaItem,
  getStoredAuditLogs,
  getStoredPages,
  savePage,
  deletePage,
  getApiUrl,
  getSiteSettings,
  saveSiteSettings,
  SITE_SETTINGS_DEFAULTS,
  getDashboardStats,
  uploadMediaFile,
  uploadCloudinaryFile,
  updateMediaItem,
  getCloudinaryOptimizedUrl,
  getStoredPromoPages,
  savePromoPage,
  deletePromoPage,
  getStoredFloorPlan,
  saveFloorPlan,
  notifySync,
  subscribeToSync,
  createDiningSession,
  closeDiningSession,
} from '@/controllers/StorageController';

export type {
  DiningSession,
  MenuCategory,
  OfferDiscount,
  FaqItem,
  TeamMember,
  MediaItem,
  SitePage,
  AuditLog,
  EventBanner,
  SiteSettings,
  PromoPage,
} from '@/controllers/StorageController';
