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
  // Water Sports
  getStoredWaterSports,
  saveWaterSports,
  updateWaterSports,
  deleteWaterSports,
  // Menu Pages
  getStoredMenuPages,
  saveMenuPage,
  updateMenuPage,
  deleteMenuPage,
  // Hero Settings
  getStoredHeroSettings,
  saveHeroSettings,

  // Menu Categories

  getStoredCategories,
  saveCategory,
  deleteCategory,
  // FAQs
  getStoredFaqs,
  saveFaq,
  deleteFaq,
  // Team Members
  getStoredTeamMembers,
  saveTeamMember,
  deleteTeamMember,
  // Offers
  getStoredOffers,
  saveOffer,
  deleteOffer,
  // Media Library
  getStoredMedia,
  saveMediaItem,
  deleteMediaItem,
  // Audit Logs
  getStoredAuditLogs,
  // Dynamic Pages
  getStoredPages,
  savePage,
  deletePage,
  // Helper
  getApiUrl,
  // Site Settings & Dashboard
  getSiteSettings,
  saveSiteSettings,
  SITE_SETTINGS_DEFAULTS,

  getDashboardStats,
  uploadMediaFile,
  uploadCloudinaryFile,
  updateMediaItem,
  getCloudinaryOptimizedUrl,
  // Promo Pages
  getStoredPromoPages,
  savePromoPage,
  deletePromoPage,
  // Floor Plan Layout
  getStoredFloorPlan,
  saveFloorPlan,
} from '@/controllers/StorageController';

export type {
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
