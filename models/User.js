// <User.js> //
//==dependencies==//
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { use } = require('express/lib/application');


//==schema==//
const userSchema = mongoose.Schema({
    username:{
      type:String,
      required:[true,'Username is required!'],
      match:[/^.{4,12}$/,'Should be 4-12 characters!'],  //4이상 12이하의 길이
      trim:true,
      unique:true
    },
    password:{
      type:String,
      required:[true,'Password is required!'],
      select:false
    },
    name:{
      type:String,
      required:[true,'Name is required!'],
      match:[/^.{4,12}$/,'Should be 4-12 characters!'],
      trim:true
    },
    email:{
      type:String,
      match:[/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,'Should be a vaild email address!'],
      trim:true
    }
  },{
    toObject:{virtuals:true}
});


//==virtuals==//
/*
<DB에 저장되는 값 이외의 항목이 필요할 땐 virtual 항목으로 만듭니다>
pw관련 객체들은 db에 저장될 필요가 없다.
이처럼 DB에 저장될 필요는 없지만, 
model에서 사용하고 싶은 항목들은 virtual로 만듭니다.
*/
userSchema.virtual('passwordConfirmation')
    .get(() => { return this._passwordConfirmation; })
    .set((value) => { this._passwordConfirmation=value; });
userSchema.virtual('originalPassword')
    .get(() => { return this._originalPassword; })
    .set((value) => { this._originalPassword=value; });
userSchema.virtual('currentPassword')
    .get(() => { return this._currentPasswowrd; })
    .set((value) => { this._currentPasswowrd=value; });
userSchema.virtual('newPassword')
    .get(() => { return this._newPassword; })
    .set((value) => { this._newPassword=value; });


//==password validation==//
const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,16}$/;
const passwordRegexErrorMessage = 'Should be minimum 8 characters of alphabet and number combination!';
userSchema.path('password').validate(function(v) {
    let user = this;

    //create user//
    if(user.isNew) {
        if(!user.passwordConfirmation) {
            user.invalidate('passwordConfirmation', 'Password Confirmation is required.');
        }

        if(!passwordRegex.test(user.password)) {
            user.invalidate('password', passwordRegexErrorMessage);
        } else if(user.password !== user.passwordConfirmation) {
            user.invalidate('passwordConfirmation', 'Password Confirmation does not matched!');
        }
    }

    //update user//
    if(!user.isNew) {
        if(!user.currentPasswowrd) {
            user.invalidate('currentPassword', 'Current Password is required!');
        }
        else if(!bcrypt.compareSync(user.currentPassword, user.originalPassword)){ 
            user.invalidate('currentPassword', 'Current Password is invalid!');
        }

        if(user.newPassword && !passwordRegex.test(user.newPassword)) {
            user.invalidate('newPassword', passwordRegexErrorMessage);
        } else if(user.newPassword !== user.passwordConfirmation) {
            user.invalidate('passwordConfirmation', 'Password Confirmation does not matched!');
        }
    }
});


//==hash password==//
userSchema.pre('save', (next) => {
    let user = this;
    if(!user.isModified('password')) {
        return next();
    } else {
        user.password = bcrypt.hashSync(user.password);
        return next();
    }
});


//==model methods==//
userSchema.methods.authenticate = function (password) {
    var user = this;
    return bcrypt.compareSync(password,user.password);
};


const User = mongoose.model('user', userSchema);
module.exports = User;