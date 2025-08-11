// Configuration Jest pour les tests
// Ce fichier est exécuté avant chaque fichier de test

// Configuration du timeout global pour les tests
jest.setTimeout(10000);

// Mock des variables d'environnement pour les tests
process.env.NODE_ENV = 'test';
process.env.CONNECTION_STRING = 'mongodb://localhost:27017/test';
