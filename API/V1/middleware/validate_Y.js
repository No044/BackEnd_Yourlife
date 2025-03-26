module.exports.isValidRequest = (body, requiredFields) => {
    if (!body || Object.keys(body).length === 0) return false;
  
    return requiredFields.every((field) => body[field] !== undefined && body[field] !== null && body[field] !== "");
  };