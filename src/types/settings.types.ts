export interface HeroSettings {
  badge: string;
  title: string;
  highlightText: string;
  subtitle: string;
  primaryCtaText: string;
  primaryCtaLink: string;
  secondaryCtaText: string;
  secondaryCtaLink: string;
  bgImageUrl: string;
  bgVideoUrl: string;
  features: { icon: string; title: string; desc: string }[];
}

export interface AuditLog {
  id: string;
  user_id: string;
  action: string;
  details: string;
  created_at: string;
}

export interface SiteSettings {
  site_name?: string;
  phone?: string;
  whatsapp?: string;
  instagram?: string;
  maps_url?: string;
  slogan?: string;
  [key: string]: any;
}
