const mongoose = require('mongoose');

const planSchema = new mongoose.Schema({
  name: { type: String, required: true },
  planType: { type: String, enum: ['strength', 'cardio', 'flexibility', 'balance'] },
  startDate: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Plan', planSchema);
