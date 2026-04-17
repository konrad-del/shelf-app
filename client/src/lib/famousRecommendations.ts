export interface FamousPick {
  person: string;
  role: string;
  books: { title: string; author: string }[];
}

export const FAMOUS_PICKS: FamousPick[] = [
  {
    person: "Elon Musk",
    role: "CEO of Tesla & SpaceX",
    books: [
      { title: "Zero to One", author: "Peter Thiel" },
      { title: "Foundation", author: "Isaac Asimov" },
      { title: "Surely You're Joking Mr. Feynman", author: "Richard Feynman" },
      { title: "Atlas Shrugged", author: "Ayn Rand" },
      { title: "Dune", author: "Frank Herbert" },
      { title: "The Hitchhiker's Guide to the Galaxy", author: "Douglas Adams" },
      { title: "Superintelligence", author: "Nick Bostrom" },
      { title: "Structures", author: "J. E. Gordon" },
      { title: "The Lord of the Rings", author: "J.R.R. Tolkien" },
      { title: "Liftoff", author: "Eric Berger" },
    ],
  },
  {
    person: "Bill Gates",
    role: "Co-founder of Microsoft",
    books: [
      { title: "Sapiens", author: "Yuval Noah Harari" },
      { title: "Shoe Dog", author: "Phil Knight" },
      { title: "Factfulness", author: "Hans Rosling" },
      { title: "Why We Sleep", author: "Matthew Walker" },
      { title: "Educated", author: "Tara Westover" },
      { title: "The Better Angels of our Nature", author: "Steven Pinker" },
      { title: "Bad Blood", author: "John Carreyrou" },
      { title: "Range", author: "David Epstein" },
      { title: "Business Adventures", author: "John Brooks" },
      { title: "The Gene", author: "Siddhartha Mukherjee" },
    ],
  },
  {
    person: "Warren Buffett",
    role: "CEO of Berkshire Hathaway",
    books: [
      { title: "The Intelligent Investor", author: "Benjamin Graham" },
      { title: "Poor Charlie's Almanack", author: "Charlie Munger" },
      { title: "Shoe Dog", author: "Phil Knight" },
      { title: "The Outsiders", author: "William Thorndike" },
      { title: "Business Adventures", author: "John Brooks" },
      { title: "Security Analysis", author: "Benjamin Graham" },
      { title: "The Most Important Thing", author: "Howard Marks" },
      { title: "Common Stocks and Uncommon Profits", author: "Philip Fisher" },
    ],
  },
  {
    person: "Sam Altman",
    role: "CEO of OpenAI",
    books: [
      { title: "Zero to One", author: "Peter Thiel" },
      { title: "Meditations", author: "Marcus Aurelius" },
      { title: "Foundation", author: "Isaac Asimov" },
      { title: "Superintelligence", author: "Nick Bostrom" },
      { title: "Man's Search for Meaning", author: "Viktor Frankl" },
      { title: "Thinking, Fast and Slow", author: "Daniel Kahneman" },
      { title: "Endurance", author: "Alfred Lansing" },
      { title: "The Republic", author: "Plato" },
      { title: "Anna Karenina", author: "Leo Tolstoy" },
      { title: "Skunk Works", author: "Ben R. Rich" },
    ],
  },
  {
    person: "Patrick Collison",
    role: "Co-founder & CEO of Stripe",
    books: [
      { title: "Poor Charlie's Almanack", author: "Charlie Munger" },
      { title: "7 Powers", author: "Hamilton Helmer" },
      { title: "The Dream Machine", author: "M. Mitchell Waldrop" },
      { title: "The Beginning of Infinity", author: "David Deutsch" },
      { title: "A Pattern Language", author: "Christopher Alexander" },
      { title: "The Alchemy of Air", author: "Thomas Hager" },
      { title: "Democracy in America", author: "Alexis de Tocqueville" },
      { title: "Scientific Freedom", author: "Donald Braben" },
    ],
  },
  {
    person: "Tobi Lütke",
    role: "CEO of Shopify",
    books: [
      { title: "High Output Management", author: "Andrew Grove" },
      { title: "Antifragile", author: "Nassim Nicholas Taleb" },
      { title: "The Three-Body Problem", author: "Cixin Liu" },
      { title: "Snow Crash", author: "Neal Stephenson" },
      { title: "Thinking in Systems", author: "Donella H. Meadows" },
      { title: "The Design of Everyday Things", author: "Don Norman" },
      { title: "Mindset", author: "Carol Dweck" },
      { title: "Finite and Infinite Games", author: "James Carse" },
      { title: "Grit", author: "Angela Duckworth" },
      { title: "Clear Thinking", author: "Shane Parrish" },
    ],
  },
  {
    person: "Satya Nadella",
    role: "CEO of Microsoft",
    books: [
      { title: "Mindset", author: "Carol Dweck" },
      { title: "Nonviolent Communication", author: "Marshall Rosenberg" },
      { title: "No Rules Rules", author: "Reed Hastings" },
      { title: "AI Superpowers", author: "Kai-Fu Lee" },
      { title: "The Boys in the Boat", author: "Daniel James Brown" },
      { title: "Competing in the Age of AI", author: "Marco Iansiti" },
      { title: "Hit Refresh", author: "Satya Nadella" },
    ],
  },
  {
    person: "Mark Cuban",
    role: "Entrepreneur & Investor",
    books: [
      { title: "Principles", author: "Ray Dalio" },
      { title: "The Lean Startup", author: "Eric Ries" },
      { title: "The Innovator's Dilemma", author: "Clayton Christensen" },
      { title: "Rework", author: "Jason Fried" },
      { title: "The Fountainhead", author: "Ayn Rand" },
      { title: "Linchpin", author: "Seth Godin" },
    ],
  },
  {
    person: "Sheryl Sandberg",
    role: "Former COO of Facebook",
    books: [
      { title: "Originals", author: "Adam Grant" },
      { title: "Radical Candor", author: "Kim Scott" },
      { title: "Measure What Matters", author: "John Doerr" },
      { title: "Blitzscaling", author: "Reid Hoffman" },
      { title: "Lean In", author: "Sheryl Sandberg" },
      { title: "Now, Discover Your Strengths", author: "Don Clifton" },
    ],
  },
  {
    person: "Steve Jobs",
    role: "Co-founder of Apple",
    books: [
      { title: "The Innovator's Dilemma", author: "Clayton Christensen" },
      { title: "Autobiography of a Yogi", author: "Paramahansa Yogananda" },
      { title: "Zen Mind, Beginner's Mind", author: "Shunryu Suzuki" },
      { title: "Moby Dick", author: "Herman Melville" },
      { title: "King Lear", author: "William Shakespeare" },
      { title: "Be Here Now", author: "Ram Dass" },
    ],
  },
  {
    person: "LeBron James",
    role: "NBA Champion, LA Lakers",
    books: [
      { title: "The Alchemist", author: "Paulo Coelho" },
      { title: "The Godfather", author: "Mario Puzo" },
      { title: "Leadership", author: "Doris Kearns Goodwin" },
      { title: "Decoded", author: "Jay-Z" },
      { title: "The Hunger Games", author: "Suzanne Collins" },
    ],
  },
  {
    person: "Bob Iger",
    role: "CEO of Walt Disney Company",
    books: [
      { title: "The Wright Brothers", author: "David McCullough" },
      { title: "Educated", author: "Tara Westover" },
      { title: "Between the World and Me", author: "Ta-Nehisi Coates" },
      { title: "Becoming", author: "Michelle Obama" },
      { title: "Born to Run", author: "Bruce Springsteen" },
    ],
  },
  {
    person: "Tim Cook",
    role: "CEO of Apple",
    books: [
      { title: "Shoe Dog", author: "Phil Knight" },
      { title: "When Breath Becomes Air", author: "Paul Kalanithi" },
      { title: "Trillion Dollar Coach", author: "Eric Schmidt" },
      { title: "March", author: "John Lewis" },
    ],
  },
  {
    person: "Bryan Johnson",
    role: "Founder of Kernel & OS Fund",
    books: [
      { title: "Zero to One", author: "Peter Thiel" },
      { title: "Outlive", author: "Peter Attia" },
      { title: "Endurance", author: "Alfred Lansing" },
      { title: "Hooked", author: "Nir Eyal" },
      { title: "Indistractable", author: "Nir Eyal" },
    ],
  },
  {
    person: "Kevin Systrom",
    role: "Co-founder of Instagram",
    books: [
      { title: "Principles", author: "Ray Dalio" },
      { title: "The Lean Startup", author: "Eric Ries" },
      { title: "The Tipping Point", author: "Malcolm Gladwell" },
      { title: "The Signal and the Noise", author: "Nate Silver" },
      { title: "Blink", author: "Malcolm Gladwell" },
      { title: "Nudge", author: "Richard Thaler" },
    ],
  },
];

// Flatten into a deduplicated list of all books with which famous people recommend them
export interface FamousBook {
  title: string;
  author: string;
  recommendedBy: { person: string; role: string }[];
}

export function getAllFamousBooks(): FamousBook[] {
  const map = new Map<string, FamousBook>();
  for (const pick of FAMOUS_PICKS) {
    for (const book of pick.books) {
      const key = `${book.title.toLowerCase()}__${book.author.toLowerCase()}`;
      if (!map.has(key)) {
        map.set(key, { title: book.title, author: book.author, recommendedBy: [] });
      }
      map.get(key)!.recommendedBy.push({ person: pick.person, role: pick.role });
    }
  }
  // Sort by number of recommenders desc
  return Array.from(map.values()).sort((a, b) => b.recommendedBy.length - a.recommendedBy.length);
}
