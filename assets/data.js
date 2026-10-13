/* ---------------------------------------------------------------------
   All the hand-edited content for the hobby sections lives here.
   Edit this file and the page updates — no build step, no rebuild.
   --------------------------------------------------------------------- */

window.SITE_DATA = {

  reading: {
    goal: { target: 24, done: 17, year: 2026 },

    // Newest first. `colour` is the spine colour on the shelf.
    recent: [
      { title: 'Piranesi',                 author: 'Susanna Clarke',   stars: 5,   colour: '#a9ddc9' },
      { title: 'The Thursday Murder Club', author: 'Richard Osman',    stars: 3.5, colour: '#e8945c' },
      { title: 'Project Hail Mary',        author: 'Andy Weir',        stars: 5,   colour: '#7ab0c4' },
      { title: 'Klara and the Sun',        author: 'Kazuo Ishiguro',   stars: 4,   colour: '#cbd9a6' },
      { title: 'The Spare Room',           author: 'Helen Garner',     stars: 4.5, colour: '#b58fb8' },
      { title: 'Shuggie Bain',             author: 'Douglas Stuart',   stars: 4.5, colour: '#e8c15c' },
      { title: 'Small Things Like These',  author: 'Claire Keegan',    stars: 5,   colour: '#a9ddc9' },
      { title: 'Babel',                    author: 'R. F. Kuang',      stars: 4,   colour: '#7ab0c4' }
    ],

    perYear: [
      { year: 2021, count: 9  },
      { year: 2022, count: 14 },
      { year: 2023, count: 21 },
      { year: 2024, count: 18 },
      { year: 2025, count: 26 },
      { year: 2026, count: 17 }
    ],

    funLine: 'Longest book this year: 545 pages. Shortest: 116. I am not above a short one.'
  },

  watching: {
    // Your four favourites. Add `poster: "/assets/four/name.jpg"` to use
    // a real poster image instead of the text tile.
    four: [
      { title: 'In Bruges',        stars: 5 },
      { title: 'Arrival',          stars: 5 },
      { title: 'Hot Fuzz',         stars: 5 },
      { title: 'The Thing',        stars: 5 }
    ],

    recent: [
      { title: 'Dune: Part Two', year: 2024, stars: 4.5 },
      { title: 'The Zone of Interest', year: 2023, stars: 4 },
      { title: 'Past Lives', year: 2023, stars: 4.5 },
      { title: 'Godzilla Minus One', year: 2023, stars: 4 },
      { title: 'Nope', year: 2022, stars: 3.5 }
    ],

    // Index 0 = half a star, index 9 = five stars.
    ratings: [1, 2, 5, 9, 18, 27, 34, 41, 22, 11],

    funLine: 'Mean rating 3.6. I am a soft touch and I have made peace with it.'
  },

  playing: {
    trophies: { platinum: 4, gold: 31, silver: 96, bronze: 412 },
    recent: [
      { name: 'Elden Ring',            meta: '68%' },
      { name: "Baldur's Gate 3",       meta: '41%' },
      { name: 'Hades II',              meta: '83%' },
      { name: 'Return of the Obra Dinn', meta: '100% ◆' }
    ],
    funLine: 'Mostly played between 21:00 and 23:30, which tells you everything.'
  }
};
