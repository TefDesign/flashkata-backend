const request = require("supertest");
const { checkBody } = require("../modules/checkBody");


// Test simple pour la route signup sans dépendances complexes
describe("module CheckBody", () => {

  test("Doit retourner une erreur pour des champs manquants", () => {

    const incompleteData = {
      username: "testuser",
      email: "test@example.com",
      // password manquant
    };

    const result = checkBody(incompleteData, ["username", "password", "email"]);
    expect(result).toBe(false);
  });


  test("Doit valider des champs complets", () => {

    const completeData = {
      username: "testuser",
      email: "test@example.com",
      password: "password123",
    };

    const result = checkBody(completeData, ["username", "password", "email"]);
    expect(result).toBe(true);
  });

});
