# 📚 Bibliothèque Familiale

Application web de partage de livres en famille, construite avec Next.js 14, TypeScript et Firebase.

## 🚀 Installation

1. **Cloner le projet** (déjà fait)

2. **Installer les dépendances**
   ```bash
   npm install
   ```

3. **Configurer Firebase**
   - Créez un projet sur [Firebase Console](https://console.firebase.google.com/)
   - Créez une application Web dans votre projet
   - Activez Firestore Database
   - Copiez les credentials Firebase

4. **Configurer les variables d'environnement**
   ```bash
   cp .env.local.example .env.local
   ```

   Puis éditez `.env.local` avec vos credentials Firebase :
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=votre_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=votre_projet.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=votre_projet_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=votre_projet.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=votre_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=votre_app_id
   ```

5. **Lancer le serveur de développement**
   ```bash
   npm run dev
   ```

6. **Ouvrir dans le navigateur**
   ```
   http://localhost:3000
   ```

## 📁 Structure du projet

```
sitemaman/
├── app/
│   ├── layout.tsx          # Layout principal
│   ├── page.tsx            # Page d'accueil
│   └── globals.css         # Styles globaux
├── components/
│   ├── AddBookForm.tsx     # Formulaire d'ajout de livre
│   ├── BookList.tsx        # Liste des livres
│   └── BookCard.tsx        # Carte d'un livre
├── lib/
│   ├── firebase.ts         # Configuration Firebase
│   └── firestore.ts        # Fonctions Firestore
├── types/
│   └── book.ts             # Types TypeScript
└── .env.local              # Variables d'environnement (à créer)
```

## ✨ Fonctionnalités actuelles

- ✅ Ajouter un livre (titre, auteur, ajouté par)
- ✅ Voir la liste des livres
- ✅ Design responsive avec Tailwind CSS

## 🔜 À venir

- Détail d'un livre
- Système d'avis et de notes
- Calcul de la moyenne des notes

## 🛠️ Technologies utilisées

- **Next.js 14** (App Router)
- **TypeScript**
- **Firebase** (Firestore)
- **Tailwind CSS**
- **React 19**

## 📝 Scripts disponibles

```bash
npm run dev      # Lancer en développement
npm run build    # Construire pour la production
npm run start    # Lancer en production
```

## 🔥 Configuration Firestore

Structure de la base de données :

```
Collection: books
Document {
  title: string
  author: string
  addedBy: string
  createdAt: timestamp
  averageRating: number
}

Sous-collection: books/{bookId}/reviews (à venir)
Document {
  userName: string
  rating: number (1-5)
  comment: string
  createdAt: timestamp
}
```

## 📄 Licence

Projet familial privé
