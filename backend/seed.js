require('dotenv').config();
const mongoose = require('mongoose');
const Movie = require('./models/Movie');
const Cinema = require('./models/Cinema');

const id = () => new mongoose.Types.ObjectId();

const ids = {
  ironMan: id(),
  firstAvenger: id(),
  avengers: id(),
  civilWar: id(),
  ragnarok: id(),
  infinityWar: id(),
  endgame: id(),
  doomsday: id()
};

const movies = [
  {
    _id: ids.ironMan,
    title: 'Iron Man',
    releaseYear: 2008,
    runtime: 126,
    prerequisites: []
  },
  {
    _id: ids.firstAvenger,
    title: 'Captain America: The First Avenger',
    releaseYear: 2011,
    runtime: 123,
    prerequisites: []
  },
  {
    _id: ids.avengers,
    title: 'The Avengers',
    releaseYear: 2012,
    runtime: 143,
    prerequisites: [ids.ironMan, ids.firstAvenger]
  },
  {
    _id: ids.civilWar,
    title: 'Captain America: Civil War',
    releaseYear: 2016,
    runtime: 147,
    prerequisites: [ids.avengers]
  },
  {
    _id: ids.ragnarok,
    title: 'Thor: Ragnarok',
    releaseYear: 2017,
    runtime: 130,
    prerequisites: []
  },
  {
    _id: ids.infinityWar,
    title: 'Avengers: Infinity War',
    releaseYear: 2018,
    runtime: 149,
    prerequisites: [ids.civilWar, ids.ragnarok]
  },
  {
    _id: ids.endgame,
    title: 'Avengers: Endgame',
    releaseYear: 2019,
    runtime: 181,
    prerequisites: [ids.infinityWar]
  },
  {
    _id: ids.doomsday,
    title: 'Avengers: Doomsday',
    releaseYear: 2026,
    runtime: 120,
    prerequisites: [ids.endgame]
  }
];

const cinemas = [
  { name: 'Cinema A', bundleSizes: [1, 3, 4] },
  { name: 'Cinema B', bundleSizes: [2, 5] },
  { name: 'Cinema C', bundleSizes: [6, 9, 20] },
  { name: 'Cinema D', bundleSizes: [4, 6] }
];

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);

  await Movie.deleteMany({});
  await Cinema.deleteMany({});

  await Movie.insertMany(movies);
  await Cinema.insertMany(cinemas);

  console.log('Seeded 8 movies and 4 cinemas.');
  await mongoose.disconnect();
}

seed()
  .then(() => process.exit(0))
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
