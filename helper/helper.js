const nodemailer = require('nodemailer');

module.exports.paginet = (start,limit,count) => {
    const pagination = {
        start : 1, 
        limit : 4,
    }
    if(limit){
      pagination.limit = parseInt(limit)
    }
    if(start && start <= Math.ceil(count / pagination.limit) ){
        pagination.start = parseInt(start)
    }
  
    pagination.skip =( pagination.start - 1) * pagination.limit
    pagination.count = Math.ceil(count / pagination.limit)
    return pagination
}

module.exports.timenow = () => {
    const vietnamTimezoneOffset = 7; // GMT+7 for Vietnam
    let now = new Date(); // Current date and time in user's timezone
    let localTime = now.getTime();
    let localOffset = now.getTimezoneOffset() * 60000; // convert to milliseconds
    let utc = localTime + localOffset;
    let vietnamTime = utc + (3600000 * vietnamTimezoneOffset);
    let vietnamDate = new Date(vietnamTime);

    // Format date as 'dd-mm-yyyy hh:mm:ss'
    let day = vietnamDate.getDate().toString().padStart(2, '0');
    let month = (vietnamDate.getMonth() + 1).toString().padStart(2, '0'); // getMonth() is zero-based
    let year = vietnamDate.getFullYear();
    let hours = vietnamDate.getHours().toString().padStart(2, '0');
    let minutes = vietnamDate.getMinutes().toString().padStart(2, '0');
    let seconds = vietnamDate.getSeconds().toString().padStart(2, '0');

    return (`${day}-${month}-${year} ${hours}:${minutes}:${seconds}`);
}


module.exports.YearNow = () => {
  const vietnamTimezoneOffset = 7; // GMT+7 for Vietnam
  let now = new Date(); // Current date and time in user's timezone
  let localTime = now.getTime();
  let localOffset = now.getTimezoneOffset() * 60000; // convert to milliseconds
  let utc = localTime + localOffset;
  let vietnamTime = utc + (3600000 * vietnamTimezoneOffset);
  let vietnamDate = new Date(vietnamTime);

  // Format date as 'dd-mm-yyyy hh:mm:ss'
  let day = vietnamDate.getDate().toString().padStart(2, '0');
  let month = (vietnamDate.getMonth() + 1).toString().padStart(2, '0'); // getMonth() is zero-based
  let year = vietnamDate.getFullYear();


  return (`${year}-${month}-${day}`);
}


module.exports.generateRandomStringNumber = (length) => {
    const characters =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

       let result = "";

        for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }

    return result;
    
}

module.exports.generateRandomNumber = (length) => {
    const characters = "0123456789";
  
    let result = "";
  
    while (result.length < length) {
      result += characters.charAt(Math.floor(Math.random() * characters.length)); 
    }
  
    return result
}

module.exports.SendMail = async (email, subject, content) => {
  console.log("📨 Sending email to:", email);

  try {
      const transporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
              user: "yourlifefitnessBH@gmail.com", 
              pass: "diierkxonkqmuhji" // Chú ý: Không nên để mật khẩu trực tiếp trong code
          }
      });

      const mailOptions = {
          from: "yourlifefitnessBH@gmail.com",
          to: email,
          subject: subject,
          html: content
      };

      const info = await transporter.sendMail(mailOptions);
      console.log("✅ Email sent:", info.response);
      return { success: true, message: "Email sent successfully!" };
  } catch (error) {
      console.error("❌ Error sending email:", error);
      return { success: false, message: "Failed to send email!", error };
  }
};