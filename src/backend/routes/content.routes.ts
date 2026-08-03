import { Hono } from 'hono';
import { AppContext, Env, AppVariables } from '../types';
import { getDB } from '../utils/db';
import { successResponse } from '../utils/response';
import { ContentService } from '../services/content.service';
import { ReviewService } from '../services/review.service';
import { ContactService } from '../services/contact.service';

const contentRoutes = new Hono<{ Bindings: Env; Variables: AppVariables }>();

async function getBody(c: AppContext) {
  return c.req.json().catch(() => ({}));
}

// Blogs
contentRoutes.get('/blogs', async (c: AppContext) => successResponse(c, await ContentService.getBlogs(getDB(c))));
contentRoutes.post('/blogs', async (c: AppContext) => successResponse(c, await ContentService.saveBlog(getDB(c), await getBody(c))));
contentRoutes.delete('/blogs/:id', async (c: AppContext) => successResponse(c, await ContentService.deleteBlog(getDB(c), c.req.param('id') || '')));

// Gallery
contentRoutes.get('/gallery', async (c: AppContext) => successResponse(c, await ContentService.getGallery(getDB(c))));
contentRoutes.post('/gallery', async (c: AppContext) => successResponse(c, await ContentService.saveGallery(getDB(c), await getBody(c))));
contentRoutes.delete('/gallery/:id', async (c: AppContext) => successResponse(c, await ContentService.deleteGallery(getDB(c), c.req.param('id') || '')));

// Water Sports
contentRoutes.get('/watersports', async (c: AppContext) => successResponse(c, await ContentService.getWaterSports(getDB(c))));
contentRoutes.post('/watersports', async (c: AppContext) => successResponse(c, await ContentService.saveWaterSport(getDB(c), await getBody(c))));
contentRoutes.delete('/watersports/:id', async (c: AppContext) => successResponse(c, await ContentService.deleteWaterSport(getDB(c), c.req.param('id') || '')));

// Team
contentRoutes.get('/team', async (c: AppContext) => successResponse(c, await ContentService.getTeam(getDB(c))));
contentRoutes.post('/team', async (c: AppContext) => successResponse(c, await ContentService.saveTeamMember(getDB(c), await getBody(c))));
contentRoutes.delete('/team/:id', async (c: AppContext) => successResponse(c, await ContentService.deleteTeamMember(getDB(c), c.req.param('id') || '')));

// Offers
contentRoutes.get('/offers', async (c: AppContext) => successResponse(c, await ContentService.getOffers(getDB(c))));
contentRoutes.post('/offers', async (c: AppContext) => successResponse(c, await ContentService.saveOffer(getDB(c), await getBody(c))));
contentRoutes.delete('/offers/:id', async (c: AppContext) => successResponse(c, await ContentService.deleteOffer(getDB(c), c.req.param('id') || '')));

// FAQs
contentRoutes.get('/faqs', async (c: AppContext) => successResponse(c, await ContentService.getFaqs(getDB(c))));
contentRoutes.post('/faqs', async (c: AppContext) => successResponse(c, await ContentService.saveFaq(getDB(c), await getBody(c))));
contentRoutes.delete('/faqs/:id', async (c: AppContext) => successResponse(c, await ContentService.deleteFaq(getDB(c), c.req.param('id') || '')));

// Banners & Events
const getBannersHandler = async (c: AppContext) => successResponse(c, await ContentService.getBanners(getDB(c)));
const postBannerHandler = async (c: AppContext) => successResponse(c, await ContentService.saveBanner(getDB(c), await getBody(c)));
const deleteBannerHandler = async (c: AppContext) => successResponse(c, await ContentService.deleteBanner(getDB(c), c.req.param('id') || ''));

contentRoutes.get('/banners', getBannersHandler);
contentRoutes.get('/events', getBannersHandler);
contentRoutes.post('/banners', postBannerHandler);
contentRoutes.post('/events', postBannerHandler);
contentRoutes.delete('/banners/:id', deleteBannerHandler);
contentRoutes.delete('/events/:id', deleteBannerHandler);

// Pages & Promo
contentRoutes.get('/promopages', async (c: AppContext) => successResponse(c, await ContentService.getPromoPages(getDB(c))));
contentRoutes.post('/promopages', async (c: AppContext) => successResponse(c, await ContentService.savePromoPage(getDB(c), await getBody(c))));
contentRoutes.delete('/promopages/:id', async (c: AppContext) => successResponse(c, await ContentService.deletePromoPage(getDB(c), c.req.param('id') || '')));

contentRoutes.get('/pages', async (c: AppContext) => successResponse(c, await ContentService.getPages(getDB(c))));
contentRoutes.post('/pages', async (c: AppContext) => successResponse(c, await ContentService.savePage(getDB(c), await getBody(c))));
contentRoutes.delete('/pages/:id', async (c: AppContext) => successResponse(c, await ContentService.deletePage(getDB(c), c.req.param('id') || '')));

// Reviews
const getReviewsHandler = async (c: AppContext) => successResponse(c, await ReviewService.getReviews(getDB(c)));
const postReviewHandler = async (c: AppContext) => successResponse(c, await ReviewService.saveReview(getDB(c), await getBody(c)));
const deleteReviewHandler = async (c: AppContext) => successResponse(c, await ReviewService.deleteReview(getDB(c), c.req.param('id') || ''));

contentRoutes.get('/reviews', getReviewsHandler);
contentRoutes.get('/testimonials', getReviewsHandler);
contentRoutes.post('/reviews', postReviewHandler);
contentRoutes.post('/testimonials', postReviewHandler);
contentRoutes.delete('/reviews/:id', deleteReviewHandler);
contentRoutes.delete('/testimonials/:id', deleteReviewHandler);

// Contact
const getContactHandler = async (c: AppContext) => successResponse(c, await ContactService.getContactMessages(getDB(c)));
const postContactHandler = async (c: AppContext) => successResponse(c, await ContactService.saveContactMessage(getDB(c), await getBody(c)));
const deleteContactHandler = async (c: AppContext) => successResponse(c, await ContactService.deleteContactMessage(getDB(c), c.req.param('id') || ''));

contentRoutes.get('/contact', getContactHandler);
contentRoutes.get('/inquiries', getContactHandler);
contentRoutes.get('/messages', getContactHandler);
contentRoutes.post('/contact', postContactHandler);
contentRoutes.post('/inquiries', postContactHandler);
contentRoutes.post('/messages', postContactHandler);
contentRoutes.delete('/contact/:id', deleteContactHandler);
contentRoutes.delete('/inquiries/:id', deleteContactHandler);
contentRoutes.delete('/messages/:id', deleteContactHandler);

export default contentRoutes;
