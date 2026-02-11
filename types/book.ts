export interface Book {
  id: string;
  title: string;
  author: string;
  addedBy: string;
  createdAt: Date;
  averageRating?: number;
  totalReviews?: number;
  loanedTo?: string | null;
  loanedAt?: Date | null;
}

export interface BookInput {
  title: string;
  author: string;
  addedBy: string;
}
