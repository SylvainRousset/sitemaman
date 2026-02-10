import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, Timestamp } from 'firebase/firestore';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Charger les variables d'environnement
dotenv.config({ path: join(__dirname, '..', '.env.local') });

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const books = [
  // A
  { author: "Atherton, Nancy", title: "Les secrets de Tante Dimity (1, 2)" },
  { author: "Asley, Philipa", title: "Un Noël au café des Cornouailles (1)" },

  // B
  { author: "Beaton, M.C.", title: "Les enquêtes de Lady Rose (1 à 3)" },
  { author: "Beaton, M.C.", title: "La saison des débutantes (Tome 1)" },
  { author: "Bénédict, Alexandra", title: "Meurtres sur le Christmas Express" },
  { author: "Bénédict, Alexandra", title: "Petits meurtres à Endgame" },
  { author: "Bizien, Jean-Luc", title: "Les enquêtes de l'aliéniste – La danse macabre" },
  { author: "Bowen, Rhys", title: "L'espionne royale (2 à 14, manque le 1)" },

  // C
  { author: "Chapman, Julia", title: "Les détectives du Yorkshire (1 à 10, manquent 2, 5, 10)" },
  { author: "Clanchy, Kate", title: "Crème anglaise" },
  { author: "Colgan, Jenny", title: "Rendez-vous au Cupcake Café" },
  { author: "Colgan, Jenny", title: "Une saison au bord de l'eau" },
  { author: "Colgan, Jenny", title: "La charmante librairie des jours heureux" },
  { author: "Colgan, Jenny", title: "La charmante librairie des flots tranquilles" },
  { author: "Colgan, Jenny", title: "L'hôtel du bord de l'eau sous la neige" },
  { author: "Crepin, William", title: "Les panthères grises – Amour et vieilles dentelles" },

  // D
  { author: "Dennison, Hannah", title: "Les mystères de Honeychurch" },
  { author: "Dennison, Hannah", title: "Fêtes fatales au manoir" },
  { author: "Dennison, Hannah", title: "Le chant du cygne" },
  { author: "Dennison, Hannah", title: "Les morts ont du souci à se faire" },
  { author: "Dennison, Hannah", title: "Bal mortel à Honeychurch" },
  { author: "Dennison, Hannah", title: "Arnaques et petits meurtres" },
  { author: "Dennison, Hannah", title: "Un Noël mortel" },
  { author: "Dennison, Hannah", title: "Petits meurtres en héritage" },

  // E
  { author: "Ellis, Bella", title: "Une enquête des sœurs Brontë – La mariée disparue" },

  // F
  { author: "Fellowes, Jessica", title: "Une funeste croisière" },
  { author: "Fellowes, Jessica", title: "Un parfum de scandale" },
  { author: "Fellowes, Julian", title: "Belgravia" },
  { author: "Fluke, Joanne", title: "Meurtres et cupcakes (1 à 13, manque le 1)" },

  // G
  { author: "Gibbons, Stella", title: "Le petit sapin de Noël" },

  // H
  { author: "Hannah, H.Y.", title: "Les thés meurtriers d'Oxford (1 à 2)" },
  { author: "Hannah, H.Y.", title: "Petits crimes et jardins secrets" },

  // J
  { author: "Japp, Andrea H.", title: "Pas de pissenlits pour le cadavre" },
  { author: "Jourgeaud, Bénédicte", title: "Le mari parfait d'Agatha Christie" },

  // K
  { author: "Kawaguchi, Toshikazu", title: "Tant que le café est encore chaud" },
  { author: "Kinsey, T.E.", title: "Les enquêtes de Lady Hardcastle" },
  { author: "Kinsey, T.E.", title: "Petits meurtres en campagne" },
  { author: "Kinsey, T.E.", title: "Meurtres dans un village anglais" },
  { author: "Kinsey, T.E.", title: "Meurtres en bord de mer" },

  // L
  { author: "Larmer, C.A.", title: "Le club des amateurs de romans policiers (1, 4, 6)" },
  { author: "Lee Strauss", title: "Un squelette dans le placard" },

  // M
  { author: "Marsh, Ngaio", title: "Les enquêtes de Roderick Alleyn (1 à 10, manque le 6)" },
  { author: "Martin, Faith", title: "Le secret de Briar's Hall" },
  { author: "Messina, Lynn", title: "Les enquêtes de Béatrice Hyde-Clare (1 à 5)" },
  { author: "Michelle Salter", title: "Une enquête de Iris Woodmore" },
  { author: "Monfils, Nadine", title: "Les enquêtes de Magritte (6 livres)" },
  { author: "Montclair, Allison", title: "Règlement de compte à Kensington" },

  // O
  { author: "Osman, Richard", title: "Le Murder Club du jeudi" },

  // P
  { author: "Peters, Elisabeth", title: "4 livres" },
  { author: "Pitocchi, Carine", title: "Cosy Christmas Mystery" },
  { author: "Pitocchi, Carine", title: "Retour à St Mary Hill" },

  // R
  { author: "Raybourn, Deanna", title: "Un étrange prélude" },
  { author: "Raybourn, Deanna", title: "Une périlleuse affaire" },
  { author: "Rebeihi, Ali", title: "Tante Alice enquête" },
  { author: "Rose, Olivia", title: "Meurtre sur le SS Andromeda" },
  { author: "Rose, Olivia", title: "Les mystères de Lady Elisabeth Hawthorne" },

  // S
  { author: "Safier, David", title: "Les enquêtes de Miss Merkel – Meurtre d'un baron allemand" },
  { author: "S.J. Nénette", title: "Sa Majesté mène l'enquête – Bal tragique à Windsor" },
  { author: "Stuart Turton", title: "Les sept morts d'Evelyn Hardcastle" },

  // T
  { author: "Thirkell, Angela", title: "Bienvenue à High Rising" },
  { author: "Thirkell, Angela", title: "Le parfum des fraises sauvages" },
  { author: "Thorogood, Robert", title: "Les dames de Marlow (1 à 4)" },
  { author: "Thorogood, Robert", title: "Meurtres au paradis" },
  { author: "Thorogood, Robert", title: "Falaises fatales" },
  { author: "Thorogood, Robert", title: "Meurtre avec préméditation" },
];

async function importBooks() {
  console.log(`🚀 Début de l'import de ${books.length} livres...\n`);

  let successCount = 0;
  let errorCount = 0;

  for (const book of books) {
    try {
      // Créer le livre
      const bookRef = await addDoc(collection(db, 'books'), {
        title: book.title,
        author: book.author,
        addedBy: 'Bibliothèque',
        createdAt: Timestamp.now(),
        averageRating: 0,
        totalReviews: 0,
      });

      console.log(`✓ ${book.author} - ${book.title}`);
      successCount++;
    } catch (error) {
      console.error(`✗ Erreur pour "${book.title}":`, error.message);
      errorCount++;
    }
  }

  console.log(`\n📊 Résultats:`);
  console.log(`   ✓ Succès: ${successCount}`);
  console.log(`   ✗ Échecs: ${errorCount}`);
  console.log(`\n✅ Import terminé!`);

  process.exit(0);
}

importBooks().catch((error) => {
  console.error('❌ Erreur fatale:', error);
  process.exit(1);
});
