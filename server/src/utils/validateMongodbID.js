import mongoose from "mongoose";

const validateMongodbID = (id) => {
  const isValid = mongoose.Types.ObjectId.isValid(id);
  if (!isValid) throw new Error("This is not a valid MongoDB Object ID");
};

export default validateMongodbID;
