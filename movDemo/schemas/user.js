var mongoose = require('mongoose');
var bcrypt = require('bcrypt');
var SALT_WORK_FACTOR = 10;// 计算强度
var UserSchema = new mongoose.Schema({
    name: {
      type: String,
      unique: true
    },
    password: String,
    meta: {
        createAt: {
            type: Date,
            default: Date.now()
        },
        update: {
            type: Date,
            default: Date.now()
        }
    }
})

UserSchema.pre('save', function(next){
  var user = this
    if (this.isNew) {
        this.meta.createAt = this.meta.updateAt = Date.now()
    } else {
        this.meta.updateAt = Date.now()
    }
    bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt){// 生成随机盐
      if(err) {
        return next(err)
      }
      bcrypt.hash(user.password, salt, function(err, hash){
        if(err) {
          return next(err)
        }
        user.password = hash;
        next()
      })
    })
  
})

UserSchema.statics = {
    fetch: function(cb) {
        return this
            .find({})
            .sort('meta.updateAt')
            .exec(cb)
    },
    findById: function(id, cb) {
        return this
            .findOne({_id: id})
            .exec(cb)
    }
}
module.exports = UserSchema
