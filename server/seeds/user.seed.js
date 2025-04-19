import { config } from "dotenv";
import User from "../src/models/user.model.js";
import connectDB from "../src/config/db.js";

config();

const seedUsers = [
  {
    "email": "liya.kebede@example.com",
    "fullName": "Liya Kebede",
    "password": "123456",
    "profilePic": "https://randomuser.me/api/portraits/women/1.jpg"
  },
  {
    "email": "melat.birhane@example.com",
    "fullName": "Melat Birhane",
    "password": "123456",
    "profilePic": "https://randomuser.me/api/portraits/women/2.jpg"
  },
  {
    "email": "rediet.abera@example.com",
    "fullName": "Rediet Abera",
    "password": "123456",
    "profilePic": "https://randomuser.me/api/portraits/women/3.jpg"
  },
  {
    "email": "danait.tsegaye@example.com",
    "fullName": "Danait Tsegaye",
    "password": "123456",
    "profilePic": "https://randomuser.me/api/portraits/women/4.jpg"
  },
  {
    "email": "tsion.demissie@example.com",
    "fullName": "Tsion Demissie",
    "password": "123456",
    "profilePic": "https://randomuser.me/api/portraits/women/5.jpg"
  },
  {
    "email": "helen.gebremariam@example.com",
    "fullName": "Helen Gebremariam",
    "password": "123456",
    "profilePic": "https://randomuser.me/api/portraits/women/6.jpg"
  },
  {
    "email": "saron.tamiru@example.com",
    "fullName": "Saron Tamiru",
    "password": "123456",
    "profilePic": "https://randomuser.me/api/portraits/women/7.jpg"
  },
  {
    "email": "samrawit.tadesse@example.com",
    "fullName": "Samrawit Tadesse",
    "password": "123456",
    "profilePic": "https://randomuser.me/api/portraits/women/8.jpg"
  },
  {
    "email": "abel.tamirat@example.com",
    "fullName": "Abel Tamirat",
    "password": "123456",
    "profilePic": "https://randomuser.me/api/portraits/men/1.jpg"
  },
  {
    "email": "biruk.solomon@example.com",
    "fullName": "Biruk Solomon",
    "password": "123456",
    "profilePic": "https://randomuser.me/api/portraits/men/2.jpg"
  },
  {
    "email": "eyob.tekle@example.com",
    "fullName": "Eyob Tekle",
    "password": "123456",
    "profilePic": "https://randomuser.me/api/portraits/men/3.jpg"
  },
  {
    "email": "nahom.gebre@example.com",
    "fullName": "Nahom Gebre",
    "password": "123456",
    "profilePic": "https://randomuser.me/api/portraits/men/4.jpg"
  },
  {
    "email": "meles.bekele@example.com",
    "fullName": "Meles Bekele",
    "password": "123456",
    "profilePic": "https://randomuser.me/api/portraits/men/5.jpg"
  },
  {
    "email": "kidus.mekonnen@example.com",
    "fullName": "Kidus Mekonnen",
    "password": "123456",
    "profilePic": "https://randomuser.me/api/portraits/men/6.jpg"
  },
  {
    "email": "henok.abebe@example.com",
    "fullName": "Henok Abebe",
    "password": "123456",
    "profilePic": "https://randomuser.me/api/portraits/men/7.jpg"
  }
]


const seedDatabase = async () => {
  try {
    await connectDB();

    await User.insertMany(seedUsers);
    console.log("Database seeded successfully");
  } catch (error) {
    console.error("Error seeding database:", error);
  }
};

// Call the function
seedDatabase();
console.log("Seeding in progress...");
