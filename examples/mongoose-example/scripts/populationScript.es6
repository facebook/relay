import mongoose from 'mongoose';

import {UserSchema as User } from '../data/Models/UserSchema.es6';
import {HobbySchema as Hobby } from '../data/Models/HobbySchema.es6';

mongoose.connect('mongodb://localhost/test');

let hobbyCycling = new Hobby({
  title: 'cycling',
  description: 'a painful sport',
  type: "hobby"
});

let hobbyHorses = new Hobby({
  title: 'horses',
  description: 'to get in one with an animal',
  type: "hobby"
});

let hobbyFlying = new Hobby({
  title: 'flying',
  description: 'man and machine in one',
  type: "hobby"
});

let hobbySleeping = new Hobby({
  title: 'sleeping',
  description: 'resting for whole day',
  type: "hobby"
});


let userRichard = new User({
  name: "Richard",
  surname: "Stallman",
  age: 62,
  hobbies: [hobbyCycling, hobbyFlying],
  type: "user"
});

let userDonald = new User({
  name: "Donald",
  surname: "Knuth",
  age: 77,
  hobbies: [hobbyHorses, hobbySleeping],
  type: "user"
});

let userLinus = new User({
  name: "Linux",
  surname: "Torvalds",
  age: 45,
  hobbies: [hobbySleeping],
  type: "user"
});

let userTim = new User({
  name: "Tim",
  surname: "Berners-Lee",
  age: 60,
  hobbies: [hobbySleeping, hobbyHorses],
  friends: [userRichard, userDonald],
  type: "user"
});

let userMark = new User({
  name: "Mark",
  surname: "Zuckerberg",
  age: 31,
  hobbies: [hobbyCycling, hobbyFlying],
  friends: [userDonald, userLinus]
});

userDonald.friends = [userRichard, userTim, userLinus];
userRichard.friends = [userDonald, userTim, userLinus];
userLinus.friends = [userRichard, userDonald];

hobbyCycling.save();
hobbyFlying.save();
hobbyHorses.save();
hobbySleeping.save();

userRichard.save();
userDonald.save();
userLinus.save();
userTim.save();
userMark.save();


setTimeout(function () {
  console.log(userRichard._id);
  mongoose.disconnect();
}, 1000);