export interface Review {
  id: string;
  bookId: string;
  reviewerName: string;
  rating?: number;  // 1-5 étoiles (optionnel)
  comment?: string; // texte (optionnel)
  createdAt: Date;
  updatedAt: Date;
}

export interface ReviewInput {
  reviewerName: string;
  rating?: number;
  comment?: string;
}
