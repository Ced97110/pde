# Direction de design - Les Pieds dans l'eau

Date : 2026-11-06. Statut : proposition, rien n'est construit.
Référence analysée : casamomo.at, mesures dans `motion-notes.md`.
Contenu : le site existant (`content/`), trois gîtes à Sainte-Anne, Guadeloupe.

Niveaux de preuve utilisés ci-dessous :
- **[mesuré]** : relevé sur le DOM ou calculé.
- **[vidéo]** : observé image par image, sans valeur exacte.
- **[choix]** : décision de design, à tester.

## 0. Révision du 2026-11-06 (prioritaire sur tout ce qui suit)

Cette révision remplace les sections 2 à 7 quand elles se contredisent, et abandonne le kit « Jalousies ».

- **Interdits :** dégradés, fonds beige, boutons orange, boutons en pilule, persiennes.
- **Fond du site :** blanc. Accent et surlignage `#8AD6D1`. Texte `#062A2C`, secondaire `#0E4548`, fonds foncés `#0B3A3D`.
- **Typographie :** celle de kubehotel-saint-tropez.com, mesurée le 2026-11-06. Texte : Inter, 14 px, interligne 1,5, graisse 300, espacement -0,02em. Libellés : 12 px, graisse 500, capitales, +0,08em.
- **Titres :** Saphion sur la référence. Ici Neo Saphion Light, du même créateur, sous licence Web MyFonts (`app/fonts/`), en capitales. Échelle fluide : 43, 36,67, 30,33 et 23,17 px à 1440, soit `34px + 0,625vw` pour le plus grand.
- **Section 2 :** le texte se révèle mot par mot au défilement, sans fond coloré. Les mots suivants restent presque invisibles (12 %). L'étoile de mer entre par la gauche et le coquillage par la droite, liés au défilement, sans jamais couvrir le texte.
- **Section 1 :** cadre pâle, panneau blanc, petite photo en haut à gauche, vidéo verticale à droite, titre en bas à gauche, d'après la composition de hoteldutassosorrento.com, avec nos seuls contenus. Sur téléphone, vidéo plein écran et titre centré.
- **Section 3 :** une seule photo, `public/images/plage-sainte-anne.webp`, plein écran. Elle reste en place pendant que la section Gîtes la recouvre, et glisse plus lentement qu'elle : seule parallaxe du site, demandée explicitement. L'histoire WebGL est retirée et archivée dans `_ref/archive/section-3-webgl.zip`.
- **Transitions :** aucune entre les sections : ni marée, ni mer animée, ni bloc d'eau. Hors plage, aucune parallaxe sur le site.
- **Section 4 :** titre à droite sur fond blanc, révélé mot par mot au défilement comme le manifeste, puis photos bord à bord à la hauteur du viewport, sans marge : Sapotille et Maracudja en demi-écran, Carambole en plein écran dessous, et trois plein écrans empilés sur téléphone. Seul le nom du gîte est posé sur les photos, en blanc, voile noir uni à 53 % contrôlé à 4,5:1 sur les vraies photos. Au survol ou au focus clavier, fondu vers une autre photo du même gîte. Surface et capacité restent en texte simple, sans pastilles. Parallaxe à partir de 768 px uniquement.
- **En-tête :** langue en menu déroulant à l'extrême gauche, logo au centre, à droite La plage (lien externe, nouvel onglet), Nos gîtes (menu déroulant des 3 gîtes), Contact et le bouton Réserver. Cela remplace la navigation de la section 6. Photos, Tarifs, Situation et Avis passent dans le pied de page.
- **Réserver :** remplace tous les libellés « Vérifier les disponibilités » et mène au formulaire de contact.
- **Section 5 :** texte et services à gauche, photo `2026-10-31-24` à droite en attendant un portrait de Madame Panol.
- **Section 6 :** titre à droite, deux avis décalés en Neo Saphion capitales à 23 px, texte intégral des hôtes.
- **Jardin :** il n'y a pas de jardin. Pas de section Jardin, et les photos concernées servent seulement à présenter le site.
- **Section 8 :** supprimée. Le hero ne porte plus ni bouton ni lien : Réserver reste dans l'en-tête.
- **Pied de page :** fond `#0B3A3D`, sur les marges de page, logo 3D à 192 px à gauche (trois fois celui de l'en-tête) à la place du nom, avec le logo plat en secours, liens et contact sur la moitié droite.
- **Pages intérieures :** classe `.page` pour la marge et l'espace de section de l'accueil (112 px, 80 px sur mobile), `.reading` pour limiter le texte à 672 px. Blocs espacés de 64 px, 20 px sous un titre, grilles à 12 px, 0 pour les photos bord à bord, coins droits, filet de 1 px. Texte courant en `#062A2C`, `#0E4548` réservé aux métadonnées.
- **Titres :** 43 px pour le titre d'une page et les sections de l'accueil, 30 px pour une sous-section. Le prix n'est pas un titre. Contact s'ouvre sur « Nous contacter », la phrase passe en texte courant.
- **Texte :** deux graisses seulement, 300 et 500, boutons en 500. Tarifs sur téléphone en cartes empilées. Zones tactiles de 24 px minimum.
- **Contrôle :** `e2e/design-system.spec.ts` vérifie ces règles sur 6 pages.

## 1. Le principe

On reprend de Casa Momo la **méthode**, pas la **marque** : un grand titre qui s'ouvre sur le lieu, une grille à deux colonnes décalées, beaucoup de vide, et un mouvement rare mais précis.

On garde le kit validé (set B « Jalousies ») : la persienne reste la signature, et le ton reste chaleureux et sans prétention. Casa Momo vend un intérieur chic à des couples ; ce site s'adresse à des familles qui cherchent une adresse simple près de la plage. Le résultat doit donc être plus clair, plus lumineux et plus rapide que la référence.

Aucun texte, photo, police ou code du site de référence n'est repris. La composition du titre en deux blocs opposés est sa signature : on en garde l'idée en la traduisant, comme décrit en 7.

## 2. Grille

| Élément | Casa Momo [mesuré] | Ici [choix] |
|---|---|---|
| Marge latérale desktop | 48 px à 1440 | `clamp(16px, 3.33vw, 48px)` |
| Gouttière | 12 px | 12 px |
| Colonnes | 2 colonnes de 666 px | 12 colonnes, cartes sur 6 |
| Largeur du contenu | toute la largeur | toute la largeur, sans le `max-w-7xl` actuel pour les sections image |
| Texte courant | - | 60 à 68 caractères par ligne, sur 5 ou 6 colonnes |
| Marge mobile | 12 px | 16 px, pour éviter les débordements relevés sur la référence |

Les cartes alternent deux hauteurs, 515 et 773 px chez Casa Momo [mesuré]. Avec 3 gîtes au lieu de 8 cartes, la grille devient :

- **Sapotille** (70 m², le plus grand) : portrait, 6 colonnes à gauche.
- **Maracudja** (35 m²) : paysage, 6 colonnes à droite, calé en haut.
- **Carambole** (20 m²) : paysage, 6 colonnes à droite, sous Maracudja, avec le texte d'intro à gauche si la colonne reste vide.

Chaque carte garde le nom sous l'image, et à droite deux pastilles : surface et capacité. Ces données existent déjà dans `content/units.ts`.

## 3. Couleurs

On ne reprend ni `#0E1201`, ni `#FFF0CA`. Le rôle de chaque couleur est transposé dans la palette du kit :

| Rôle chez Casa Momo | Valeur | Ici |
|---|---|---|
| Scène sombre | `#0E1201` | `--persienne` `#20414A` |
| Clair chaud | `#FFF0CA` | `--ground` `#F2EFE9` |
| Pied de page terracotta | `#BC6F45` | `--corail` `#A7482A` |

Contrastes calculés [mesuré] :

| Paire | Ratio | Usage |
|---|---|---|
| `--ground` sur `--persienne` | 9,55 | Titres et texte sur scène sombre |
| `--ink` sur `--ground` | 14,79 | Texte courant |
| `--ink-muted` sur `--ground` | 6,38 | Texte secondaire |
| `--ground` sur `--corail` | 5,08 | Pied de page, tout texte |
| `--corail` sur `--ground` | 5,08 | Liens |
| `--corail-brand` sur `--ground` | 3,64 | Grands titres ou décor uniquement |
| `--ink` sur `--corail-brand` | 4,07 | À éviter pour du texte courant |

Le pied de page utilise `--corail`, pas `--corail-brand`.

## 4. Polices

| Police du site | Licence | Vérification |
|---|---|---|
| EL PACRE (Hishand Studio) | Payante pour un usage commercial, vendue sur MyFonts à partir de 18 $ | Confiance MEDIUM : Fontspace la liste en gratuit non commercial. Texte de licence non lu. |
| Lay Grotesk (Due Studio) | Commerciale, prix non trouvé | Confiance MEDIUM : une seule source tierce. |

Test rendu sur le vrai nom, avec accents : `type-test.png`.

**Titres : Gloock** (Duarte Pinto, Google Fonts, licence SIL OFL ; `latin` et `latin-ext` disponibles dans `next/font`). C'est la plus proche d'EL PACRE sur le contraste et la présence. Une seule graisse, 400.

- Alternative : **Fraunces**, en `opsz` 144 et `SOFT` 50, si Gloock paraît trop chic pour le ton « sans prétention ». Elle est plus douce, mais plus fine à grande taille.
- Écartées : Young Serif, trop rustique en bas de casse, et DM Serif Display, proche de Gloock mais avec moins de caractère.

**Texte : garder Archivo.** Au test, Hanken Grotesk et Instrument Sans sont proches de Lay Grotesk, mais la différence avec Archivo est trop faible à ces tailles pour justifier un changement du kit.

**Échelle** [choix] :

| Niveau | Taille |
|---|---|
| Titre du hero | `clamp(4.5rem, 11vw, 10rem)`, interligne 0,95 |
| Titre de section | `clamp(2.75rem, 6vw, 5.5rem)`, interligne 1,05 |
| Manifeste | `clamp(2rem, 4.2vw, 3.75rem)`, en Archivo |
| Texte courant | 18 px, interligne 1,5 |
| Libellés et pastilles | 14 px minimum |

Dans les titres, utiliser l'apostrophe typographique (`l’eau`). Le découpage lettre par lettre peut casser le crénage : à vérifier sur `Pi` et `l’e`.

## 5. Photos

C'est le plus gros écart avec la référence, et il ne se règle pas avec du code. Casa Momo montre des photos art-dirigées, chaudes et serrées. Les 38 photos de la galerie sont celles d'une annonce : grand-angle, ciel très saturé, cadres larges.

1. **Harmoniser sur la page d'accueil** : même température, ciels moins saturés, ombres plus douces, sans modifier ce que montrent les pièces.
2. **Recadrer serré** : en portrait et en détail plutôt qu'en vue de pièce entière.
3. **Sélection de départ** : `10-14-52` (balcon sur la verdure), `10-14-20`, `10-14-43`, `10-31-9` (plage), `10-31-14` (jardin), `10-31-24` (fleur). Les salles de bain restent dans la galerie.
4. **Repartir des originaux si possible** : toutes les images font 80 à 100 Ko pour 2000 px de large. À vérifier en plein écran, car les artefacts risquent de se voir sur une image bord à bord.
5. **Portrait de Madame Panol** : aucun dans la galerie. Il donnerait la même chaleur que la section « Hi, I'm Moritz ». À demander.

## 6. Rythme des sections

Page d'accueil Casa Momo : 19 157 px en desktop, 15 025 px en mobile [mesuré]. Elle tient cette longueur grâce à sa séquence épinglée de 4 101 px. Ici, il y a moins de contenu : viser **environ 10 000 à 11 000 px** en desktop [choix]. L'alternance à respecter est dense, puis respiration, puis dense.

| # | Section | Fond | Hauteur | Contenu |
|---|---|---|---|---|
| 1 | Hero | Vidéo | 100svh | Titre, sous-titre, bouton Disponibilités |
| 2 | Manifeste | Ground | 70 à 90svh | Une phrase courte, grande, alignée à droite |
| 3 | Persiennes | Persienne | 500vh | Lames 3D, puis histoire WebGL en continu : portail, chemin, plage |
| 4 | Gîtes | Ground | Environ 1 800 px | Grand titre aligné à droite, puis les 3 cartes |
| 5 | Chez Madame Panol | Surface | 100svh | Texte à gauche, photo à droite, services inclus |
| 6 | Avis | Ground | 60 à 80svh | 2 avis en grand, lien vers les autres |
| 7 | ~~Jardin~~ supprimée | - | - | Il n'y a pas de jardin : ces photos servent seulement à présenter le site |
| 8 | ~~Dites-nous vos dates~~ supprimée | - | - | - |
| 9 | Pied de page | Corail | 80 à 100svh | Liens, contact, nom en très grand |

La barre `.slats` entre les sections reste le seul séparateur décoratif. La barre de réservation mobile (`.mobile-booking-bar`) reste en place.

**Navigation** [choix] : 7 entrées, c'est trop pour ce style. Proposition : Nos gîtes, Tarifs, Situation et le bouton Disponibilités. Photos et Avis passent dans le pied de page.

## 7. Animations à refaire avec GSAP

GSAP 3.15.1 est déjà installé, et `SplitText` et `CustomEase` sont dans le paquet [mesuré]. Aucune dépendance n'est à ajouter. Garder le schéma actuel : `useEffect` et `gsap.matchMedia()` avec `(prefers-reduced-motion: no-preference)`.

| Priorité | Animation | Référence | Version ici |
|---|---|---|---|
| P1 | A. Entrée du titre | 3,8 s de mouvement [mesuré] | 2,4 s maximum |
| P1 | B. Libellés à lettres roulantes | 0,6 s, 10 ms par lettre [mesuré] | Identique |
| P1 | C. Parallaxe des cartes | 0,05 à 0,07 px/px [mesuré] | Identique |
| P2 | D. Masque arrondi au défilement | Arche vers rectangle sur 400 px [mesuré] | Une seule image, section 7 |
| P2 | E. Sortie des images par le haut | Opacité 1 vers 0,67 [mesuré] | Hero et section 7 |
| P2 | F. Changement de couleur du fond | Calque « Color Change » présent, timing inconnu | Du hero au manifeste |
| P3 | G. Pastille qui suit le curseur | Vue sur les cartes [vidéo] | Texte « Voir le gîte » |

### Courbe commune

Ajustée sur les mesures du survol : `cubic-bezier(0.52, 0, 0, 1)` sur 600 ms s'écarte de 2,8 % au plus de la courbe mesurée, sur la première lettre [mesuré]. Elle sert de courbe du site.

```ts
import { CustomEase } from "gsap/CustomEase";

gsap.registerPlugin(CustomEase);
CustomEase.create("roll", "M0,0 C0.52,0 0,1 1,1");
```

### A. Entrée du titre

Le titre se coupe en deux groupes, « Les Pieds » et « dans l’eau ».

| Temps | Référence [mesuré] | Ici [choix] |
|---|---|---|
| Entrée des lettres | 0,8 s, montée de 85 px | 0,8 s, montée de 0,5 em |
| Décalage du second groupe | 200 ms | 200 ms |
| Pause | 0,3 s | 0,15 s |
| Écart horizontal | 1,15 s, ±120 px | 0,7 s, jusqu'aux marges |
| Écart vertical | 1,5 s, vers les coins | 0,8 s, chevauche le précédent de 0,3 s |
| Vidéo | Masque arrondi puis plein écran [vidéo] | `clip-path: inset(... round ...)` jusqu'à 0, en même temps que l'écart vertical |

Le décalage entre lettres n'a pas été mesuré précisément. Partir de 30 ms et ajuster à l'œil, car « Les Pieds dans l'eau » a deux fois plus de lettres que CASA MOMO.

Pour éviter de copier la composition de la référence : le titre finit en bas de page sur deux lignes en escalier, « Les Pieds » à gauche et « dans l’eau » à droite, au-dessus du sous-titre et du bouton. L'ouverture reste un mouvement, pas une position figée dans les coins.

Règles à tenir :

- **Pas de blocage** : ni écran de chargement, ni défilement bloqué.
- **Une seule fois par session** : mémorisé avec `sessionStorage` dans un `try/catch` ; ensuite, état final direct.
- **Titre dans le HTML serveur** : `h1` réel, lisible sans JavaScript.
- **Découpage après les polices** : `autoSplit: true` avec le travail dans `onSplit`. Avec `aria: "auto"` par défaut, `SplitText` pose un `aria-label` et cache les fragments [mesuré].
- **Mobile** : pas d'écart horizontal, les deux lignes restent empilées.

```ts
SplitText.create(".hero-title", {
  type: "chars",
  autoSplit: true,
  onSplit: (self) =>
    gsap.from(self.chars, { y: "0.5em", autoAlpha: 0, duration: 0.8, stagger: 0.03, ease: "roll" }),
});
```

### B. Libellés à lettres roulantes

Structure relevée [mesuré] : libellé en `overflow: hidden`, texte accessible masqué, puis pour chaque lettre un emplacement `aria-hidden` qui contient une lettre invisible, une copie à `0` et une copie à `translateY(100%)`.

- **Entrée** : `yPercent` de 0 à -100 et de 100 à 0, `duration: 0.6`, `stagger: 0.01`, `ease: "roll"`.
- **Sortie** : animer les valeurs de retour avec un nouveau tween, pas avec `timeline.reverse()`, car le décalage reste de gauche à droite à la sortie [mesuré]. Stagger de 0,008.
- **Déclencheurs** : `mouseenter` et `focusin`, sous `(hover: hover)`. Rien sur tactile.
- **Portée** : navigation, liens du pied de page, boutons. Pas dans le texte courant.
- **Simplicité** : une transition CSS avec `transition-delay` ferait le même effet sans JavaScript. À envisager si le composant pèse à l'usage.

### C. Parallaxe des cartes

Pas de fondu ni de masque d'entrée : la référence n'en a pas à partir de 670 px du haut [mesuré]. Le `data-reveal="photo"` actuel, qui balaie l'image, est donc à retirer des photos concernées.

```ts
gsap.fromTo(
  image,
  { y: 35 },
  { y: -53, ease: "none", scrollTrigger: { trigger: card, start: "top bottom", end: "bottom top", scrub: true } },
);
```

L'image doit dépasser son cadre d'au moins 90 px en hauteur. Sur mobile, réduire de moitié ou retirer après test sur un vrai téléphone.

### D à G

- **D. Masque arrondi** : la référence morphe un `path()` dont l'arrondi part de 25 % de la largeur [mesuré]. Ici, `inset(0 round 25% 25% 0 0)` vers `inset(0 round 0)` sur 400 px de défilement, en `scrub`. À réserver à une seule image, pour que les persiennes restent la vraie signature.
- **E. Sortie** : `autoAlpha` de 1 à 0,67 en `scrub` sur le conteneur, quand l'image quitte le haut.
- **F. Fond** : le timing n'est pas mesuré, donc à régler à l'œil. Sans cet effet, la page reste correcte.
- **G. Pastille** : `gsap.quickTo` sur `x` et `y`, sous `(hover: hover)`. Elle complète le lien de la carte sans le remplacer.

## 8. Ce qu'on ne refait pas

- **Séquence « Feel at Home » épinglée** : elle demande des objets détourés qu'on n'a pas, et `ShutterReveal` joue déjà ce rôle de moment fort.
- **Intro longue** : presque 5 s, c'est trop pour une famille qui compare des dates sur son téléphone.
- **Lissage du défilement** : aucune raison d'ajouter `ScrollSmoother` ou une librairie.
- **Défauts mobiles de la référence** : textes de 8 et 11 px, zones tactiles de moins de 24 px, 2 débordements.
- **Titres de pages intérieures animés** : le mouvement reste concentré sur l'accueil et les libellés.

## 9. Critères de validation

- `prefers-reduced-motion` : tout le contenu visible, sans intro ni parallaxe. Un test Playwright pour le vérifier.
- Sans JavaScript : `h1`, texte et photos visibles.
- Clavier : les libellés réagissent au focus, le focus reste visible.
- Mobile 390 px : aucun débordement, texte de 14 px minimum, zones tactiles de 24 px minimum (`analyze_page_structure` avec `compare: "mobile"`).
- Contraste : 4,5 minimum sur le titre et le texte posés sur la vidéo, à mesurer sur plusieurs images. Le dégradé actuel ne doit partir que si ce seuil tient sans lui.
- Performance : l'intro ne doit pas retarder le LCP. Mesure avant et après avec `audit_url`.
- Mouvement : `analyze_scroll_map` ne voit pas tout, donc comparer les valeurs clés à la main.
- `pnpm lint`, `pnpm exec tsc --noEmit`, `pnpm test` et `pnpm test:e2e` passent.

## 10. Décisions à prendre

1. **Police de titre** : remplacer Zilla Slab par Gloock modifie le kit B. Recommandé, car c'est ce qui rapproche le plus du ton visé. Sinon, garder Zilla Slab et accepter un rendu plus franc et moins éditorial.
2. **Photos** : qui harmonise les images, et les originaux existent-ils ?
3. **Portrait de Madame Panol** : disponible ?
4. **Navigation réduite** : d'accord pour passer Photos et Avis dans le pied de page ?
5. **Fonds sombres** : d'accord pour la persienne sur les sections 3 et 8, sans mode sombre global ?

## Sources

- EL PACRE : [MyFonts](https://www.myfonts.com/collections/el-pacre-font-hishand-studio/), [Fontspace](https://www.fontspace.com/el-pacre-font-f153525), [befonts](https://befonts.com/el-pacre-font.html)
- Lay Grotesk : [maxibestof.one](https://maxibestof.one/typefaces/lay-grotesk/pairing/pp-editorial-old)
- Licences libres : [Gloock](https://github.com/duartp/gloock), [Fraunces](https://github.com/arrowtype/Fraunces), [Hanken Grotesk](https://github.com/marcologous/hanken-grotesk)
- GSAP : [SplitText](https://gsap.com/docs/v3/Plugins/SplitText), [gsap.matchMedia()](https://gsap.com/docs/v3/GSAP/gsap.matchMedia%28%29)
