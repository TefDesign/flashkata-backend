// formatage de reponse avec verification de token
const response = (dBtoken, reqToken, data) => {
        if (dBtoken !== reqToken) {
          return {result : false, error : "token invald"}
        } else if (!data) {
          return {result : false, error : "data not found"} 
        } else if (data) {
          return {result : true , data}
        } else {
          return {result : false, error : "unknown error"}
        }
      }

module.exports = {response}