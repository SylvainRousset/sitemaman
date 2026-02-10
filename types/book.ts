export interface Book {
  id: string;
  title: string;
  author: string;
  addedBy: string;
  createdAt: Date;
  averageRating?: number;
  totalReviews?: number;
}

export interface BookInput {
  title: string;
  author: string;
  addedBy: string;
}
