const mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');
const bcryptjs = require('bcryptjs')
const {CUSTOMER} = require('../config/constant');
const { BadRequestError } = require('../utils/errors');
const crypto = require('crypto');

//------------ User Schema ------------//
const UserSchema = new mongoose.Schema({
  username: {type: String, unique : true, required: true},
  email: {type: String, unique : true, required: true},
  password: {type: String, required: true},
  role: {type: String, default: CUSTOMER},
  phone_number: {type: String, default: ''},
  verified: {type: Boolean, default: false},
  resetLink: {type: String, default: ''},
  cart_entry: [{type: mongoose.Schema.Types.ObjectId, ref: 'Cart'}],
  kyc_verified: {type: Boolean, default: false},
  address: {type: Object, default: null},
  wallet_address: { type: String, unique : true, default: null },
  nonce: { type: String, unique : true, default: null },
}, { timestamps: true });

// Pre-save hook for password hashing
UserSchema.pre('save', async function(next) {
  try {
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.email)) {
      return next(new BadRequestError('Invalid email format'));
    }

    // Validate password length
    const passwordRegex = /.{6,}/;
    if (!passwordRegex.test(this.password)) {
      return next(new BadRequestError('Password must be at least 6 characters'));
    }

    let hashedPass = await bcryptjs.hash(this.password, 10)
    this.password = hashedPass

    next();
  } catch (error) {
    next(error);
  }
});

UserSchema.plugin(uniqueValidator, {message: 'is already taken.'});

const User = mongoose.model('User', UserSchema);

UserSchema.methods.toProfileJSONFor = function() {
  return {
    username: this.username,
    email: this.email,
    role: this.role,
    phone_number: this.phone_number,
    verified: this.verified,
    resetLink: this.resetLink,
    cart_entry: this.cart_entry,
    kyc_verified: this.kyc_verified,
    address: this.address,
  };
};

module.exports = User;