export const asyncHandler = (func) => {
  return (req, res, next) => {
    func(req, res, next).catch((error) => {
      //console.log("error: ", error); 
      return next(error);
    }); 
  };
};
