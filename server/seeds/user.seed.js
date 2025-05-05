import { config } from "dotenv";
import User from "../src/models/user.model.js";
import connectDB from "../src/config/db.js";
import bcrypt from "bcryptjs";

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

connectDB();
const seedDatabase = async () => {
  try {
    

    // Hash each user's password before inserting into the database
    const hashedUsers = await Promise.all(
      seedUsers.map(async (user) => {
        // generate salt
        const salt = await bcrypt.genSalt(10);
        // hash password
        // hash password with salt
        const hashedpassword = await bcrypt.hash(user.password, salt);
        return {
          ...user,
          password: hashedpassword, // replace plain password with hashed password
        };
      })
    );

    await User.insertMany(hashedUsers);
    console.log("Database seeded successfully");
  } catch (error) {
    console.error("Error seeding database:", error);
  }
};


// arg import:data

// arg destroy:data
if (process.argv[2] === "destroy") {
  console.log("Deleting all data...");
  await User.deleteMany({});
  console.log("All data deleted successfully");
  process.exit(0);
}
// arg import:data
if (process.argv[2] === "import") {
  console.log("Importing data...");
  await seedDatabase();
  console.log("Data imported successfully");
  process.exit(0);
}


