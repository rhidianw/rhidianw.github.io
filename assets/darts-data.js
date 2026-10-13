/* ---------------------------------------------------------------------
   Content for the darts game. Edit freely — the game reads from here.

   FACTS: revealed one at a time, each time you hit a segment you have
   not hit before. Add, remove or reword as you like; the game copes
   with any number of them.
   --------------------------------------------------------------------- */

window.DARTS_DATA = {

  facts: [
    "I did a PhD in physics at the University of York — four years of experimental data at a scale where you cannot eyeball a mistake.",
    "Before York I read physics at Swansea, and came out the other side with First Class Honours.",
    "I spent a competitive three-month research attachment at Jefferson Lab in Virginia.",
    "I won the Talk Prize at the HUGS International Summer School in 2022.",
    "Best Theoretical Physics Project Award, University of York, 2020.",
    "I taught the undergraduate Python module for four years alongside the PhD.",
    "My first serious code was C++ and ROOT, held together largely by stubbornness.",
    "On an internship I built real-time analysis software for a Raman spectrometer, supporting cancer detection research.",
    "At Companies House I worked on address data quality — the unglamorous backbone of fraud prevention.",
    "These days I'm a data engineer, mostly persuading systems that disagree with each other to stop it.",
    "I'm based in York.",
    "Favourite player: Jonny Clayton. The Ferret.",
    "Luke Humphries — Cool Hand Luke. Nerveless under a finish.",
    "Luke Littler, who was winning majors at an age when I was still being taught long division.",
    "James Wade, the Machine, still turning up and still winning.",
    "Gary Anderson has the purest throw in the sport and I will not be taking questions.",
    "Michael van Gerwen. Mighty Mike. The standard everyone else got measured against.",
    "Gerwyn Price — the Iceman, and a professional rugby player before he ever threw for money.",
    "A physics degree makes you insufferable about dart trajectories. Mass, drag, parabola, the lot.",
    "I will never not go for the treble twenty. This is a character flaw and I have accepted it."
  ],

  // Shown on specific special hits rather than consuming a fact.
  special: {
    bull: "Bullseye. Fifty. Nothing clever to say — that was just good.",
    outerBull: "Outer bull, twenty-five. The polite version of a bullseye.",
    treble20: "TREBLE TWENTY. The big one.",
    miss: "Off the board entirely. We've all done it. Mostly in front of people."
  },

  // PDC Order of Merit, top 32, after the 2026 World Grand Prix.
  // Prize money in £thousands. Source: dartsnews.com, 6 October 2026.
  rankingsAsOf: "6 October 2026, after the World Grand Prix",

  favourites: [
    "Luke Littler", "Luke Humphries", "Gerwyn Price", "James Wade",
    "Jonny Clayton", "Michael van Gerwen", "Gary Anderson"
  ],

  rankings: [
    [1,  "Luke Littler",        3124],
    [2,  "Luke Humphries",      1081],
    [3,  "Gian van Veen",       1029.75],
    [4,  "Gerwyn Price",        793],
    [5,  "James Wade",          686.25],
    [6,  "Jonny Clayton",       684],
    [7,  "Danny Noppert",       615],
    [8,  "Josh Rock",           613],
    [9,  "Michael van Gerwen",  608.5],
    [10, "Gary Anderson",       591.75],
    [11, "Nathan Aspinall",     583],
    [12, "Wessel Nijman",       577],
    [13, "Stephen Bunting",     570.75],
    [14, "Ryan Searle",         569.75],
    [15, "Ross Smith",          562.25],
    [16, "Jermaine Wattimena",  547.75],
    [17, "Chris Dobey",         537.25],
    [18, "Luke Woodhouse",      511],
    [19, "Krzysztof Ratajski",  440],
    [20, "Dirk van Duijvenbode",427.5],
    [21, "Damon Heta",          413.25],
    [22, "Rob Cross",           397],
    [23, "Martin Schindler",    392.75],
    [24, "Ryan Joyce",          391],
    [25, "Cameron Menzies",     375],
    [26, "Kevin Doets",         373],
    [27, "Andrew Gilding",      358.75],
    [28, "Daryl Gurney",        305],
    [29, "Niels Zonneveld",     291.25],
    [30, "Dave Chisnall",       280.75],
    [31, "Joe Cullen",          280],
    [32, "Ritchie Edhouse",     278]
  ]
};
