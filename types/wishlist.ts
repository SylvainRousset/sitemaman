export interface Wishlist {
  id: string;
  title: string;
  author: string;
  addedBy: string;
  createdAt: Date;
}

export interface WishlistInput {
  title: string;
  author: string;
  addedBy: string;
}
