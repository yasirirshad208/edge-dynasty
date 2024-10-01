
const sendToken = (user, statusCode, res) => {
    
  
    // options for cookie
    const options = {
      expires: new Date(
        Date.now() + process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000
      ),
      httpOnly: true,
    };
  
    
  };
  
  module.exports = sendToken;