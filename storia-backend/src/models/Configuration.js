const mongoose = require("mongoose");

const configurationSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
    },
    value: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    description: String,
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Configuration", configurationSchema);
