  const mongoose = require('mongoose');
  const connectionString = process.env.CONNECTION_STRING
  mongoose.connect(connectionString, { connectTimeoutMS: 2000 })
    .then(() => console.log('KATA Database connected'))
    .catch(error => console.error(error));
  // ne pas oublier de require le fichier dans app