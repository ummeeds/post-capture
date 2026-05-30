export interface TweetUser {
  id: string;
  name: string;
  screen_name: string;
  avatar_url: string;
  verified: boolean;
  verified_type: string;
  profile_image_shape: string;
}

export interface VideoVariant {
  bitrate: number;
  content_type: string;
  url: string;
}

export interface TweetMedia {
  type: string;
  url: string;
  preview_url?: string;
  width?: number;
  height?: number;
  video_urls: VideoVariant[];
}

export interface Tweet {
  id: string;
  text: string;
  created_at: string;
  user: TweetUser;
  likes: number;
  retweets: number;
  replies: number;
  views?: number;
  media: TweetMedia[];
}

export type Theme = "light" | "dark";
export type AspectRatio = "auto" | "1:1" | "4:5" | "3:4" | "9:16";

export const SOLID_COLORS = [
  { value: "#ffffff", label: "White" },
  { value: "#000000", label: "Black" },
  { value: "transparent", label: "Transparent" },
  { value: "#1DA1F2", label: "Blue" },
  { value: "#17bf63", label: "Green" },
  { value: "#794bc4", label: "Purple" },
  { value: "#e0245e", label: "Red" },
];

export const GRADIENTS = [
  { value: "linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)", label: "Ocean" },
  { value: "linear-gradient(135deg, #ff7e5f 0%, #feb47b 100%)", label: "Sunset" },
  { value: "linear-gradient(135deg, #8A2387 0%, #E94057 50%, #F27121 100%)", label: "Prism" },
];

export function defaultBgForTheme(theme: Theme): string {
  return theme === "dark" ? "#000000" : "#ffffff";
}

export interface CaptureOptions {
  theme: Theme;
  background: string;
  show_metrics: boolean;
  show_media: boolean;
  show_timestamp: boolean;
  show_verified: boolean;
  square_avatar: boolean;
  aspect_ratio: AspectRatio;
  scale: number;
  width: number;
}

export const defaultCaptureOptions: CaptureOptions = {
  theme: "dark",
  background: "#000000",
  show_metrics: true,
  show_media: true,
  show_timestamp: false,
  show_verified: true,
  square_avatar: false,
  aspect_ratio: "auto",
  scale: 1,
  width: 550,
};

export type ExportFormat = "png" | "pdf";
