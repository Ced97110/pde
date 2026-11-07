export interface Review {
  author: string;
  date: { fr: string; en: string };
  // Guest's original French, spelling lightly corrected. The English is our translation.
  text: { fr: string; en: string };
}

export const reviews: Review[] = [
  {
    author: "Monique",
    date: { fr: "décembre 2018", en: "December 2018" },
    text: {
      fr: "Nous avons passé un excellent séjour dans ce gîte situé face à la plage. La terrasse et le jardin sont fort agréables et l'environnement est très calme. Les propriétaires sont particulièrement accueillants.",
      en: "We had an excellent stay in this gîte facing the beach. The terrace and garden are very pleasant and the surroundings are very quiet. The owners are especially welcoming.",
    },
  },
  {
    author: "Beatrice",
    date: { fr: "octobre 2018", en: "October 2018" },
    text: {
      fr: "Dans un gîte où l'on est reçu comme des amis par des gens charmants et pleins de petites attentions à votre égard, nous en garderons un merveilleux souvenir.",
      en: "A gîte where you are welcomed like friends by charming people full of small attentions. We will keep a wonderful memory of it.",
    },
  },
  {
    author: "Matthias",
    date: { fr: "janvier 2019", en: "January 2019" },
    text: {
      fr: "Très jolie résidence les pieds dans l'eau bénéficiant d'une vue imprenable sur la mer. Les logements sont très basiques mais confortables.",
      en: "A very pretty residence right on the water with an unbeatable sea view. The apartments are very basic but comfortable.",
    },
  },
];
