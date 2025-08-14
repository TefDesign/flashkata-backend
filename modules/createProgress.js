// fonction pour créer les progressions d'un utilisateur
const createProgress = async ({ list, userId, ProgressModel, idField }) => {
  const progressIds = [];

  for (const item of list) {
    const newProgress = await new ProgressModel({
      [idField]: item._id,
      userId: userId,
      isValidated: false,
      validatedAt: new Date(),
      name: item.name,
      responseTime: 0,
      nbViews: 0,
      nbCorrect: 0,
      nbWrong: 0,
      isFavorite: false,
      priority: 0.5,
    }).save();

    progressIds.push(newProgress._id);
  }

  return progressIds;
};

module.exports = { createProgress };