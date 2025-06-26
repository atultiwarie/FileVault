const mongoose = require('mongoose')

const fileSchema = new mongoose.Schema(
  {
    path: {
      type: String,
      required: [true, "Path is required"],
    },
    public_id: {
      type: String,
      required: true,
    },
    originalname: {
      type: String,
      required: [true, "Originalname is required"],
    },
    resource_type: {
      type: String,
      required: [true, "Resource type is required"],
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: [true, "User is required"],
    },
  },
  { timestamps: true }
);

const file = mongoose.model('file',fileSchema)

module.exports=file
 