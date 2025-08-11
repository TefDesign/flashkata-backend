// formatage de reponse avec verification de token
const response = (dBtoken, reqToken, data) => {
        if (dBtoken !== reqToken) {
          return {result : false, message: 'token invalid', error : "token invald"}
        } else if (!data) {
          return {result : false, message: 'donné non trouvé', error : "data not found"} 
        } else if (data) {
          return {result : true, data}
        } else {
          return {result : false, message: 'erreur inconnu', error : "unknown error"}
        }
      }

module.exports = {response}