const jsonOptions = {
  virtuals: true,
  versionKey: false,
  transform(_doc, ret) {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    delete ret.password;
    delete ret.refreshToken;
    delete ret.resetToken;
    delete ret.resetTokenExpiry;
    delete ret.loginAttempts;
    delete ret.lockUntil;
    return ret;
  },
};

export { jsonOptions };
