const request = require("supertest");
const bcrypt = require("bcrypt");

// Mocks des modèles
jest.mock("../models/Users");
const User = require("../models/Users");

// Création d'une app Express de test
const express = require("express");
const cors = require("cors");
const usersRouter = require("../route/users");

const app = express();
app.use(cors());
app.use(express.json());
app.use("/users", usersRouter);


describe("Route POST /users/signin", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });


    // Utilisateur trouvé, password ok
  test("Connexion réussie avec email et mot de passe corrects", async () => {

      // creation de la BD simulé
    const hashedPassword = bcrypt.hashSync("password123", 10);
    const mockUser = {
      _id: "mockUserId123",
      userName: "testuser",
      email: "test@example.com",
      password: hashedPassword,
      token: "mockToken123",
    };
    // le mockUser sera retourné lors du findOne
    User.findOne.mockResolvedValue(mockUser);


    const response = await request(app)
      .post("/users/signin")
      .send({ email: "test@example.com", password: "password123" })
      .expect(200);

    expect(response.body.result).toBe(true);
    expect(response.body.token).toBe("mockToken123");
    expect(response.body.userName).toBe("testuser");
    expect(response.body.id).toBe("mockUserId123");
    expect(response.body.isConnected).toBe(true);
  });

  // Utilisateur trouvé mais pas le bon password
  test("Échec, mot de passe est incorrect", async () => {

      // creation de la BD simulé
    const hashedPassword = bcrypt.hashSync("password123", 10);
    const mockUser = {
      _id: "mockUserId123",
      userName: "testuser",
      email: "test@example.com",
      password: hashedPassword,
      token: "mockToken123",
    };
    // le mockUser sera retourné lors du findOne
    User.findOne.mockResolvedValue(mockUser);


    const response = await request(app)
      .post("/users/signin")
      .send({ email: "test@example.com", password: "wrongpass" })
      .expect(200);

    expect(response.body.result).toBe(false);
    expect(response.body.error).toBe("wrong password");
  });

  // Utilisateur non trouvé
  test("Échec, l'utilisateur n'existe pas", async () => {
    User.findOne.mockResolvedValue(null);

    const response = await request(app)
      .post("/users/signin")
      .send({ email: "notfound@example.com", password: "any" })
      .expect(200);

    expect(response.body.result).toBe(false);
    expect(response.body.error).toBe("user not found");
  });


  // Champs manquant
  test("Échec, champs sont manquants", async () => {
    const response = await request(app)
      .post("/users/signin")
      .send({ email: "test@example.com" }) // pas de password
      .expect(200);

    expect(response.body.result).toBe(false);
    expect(response.body.error).toBe("Missing or empty fields");
  });
});
