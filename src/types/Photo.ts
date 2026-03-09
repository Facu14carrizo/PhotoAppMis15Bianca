export interface Photo {
  id: string;
  imageUrl: string;
  userName?: string;
  title?: string;
  createdAt: Date;
  likesCount?: number;
  likedBy?: string[];
}
