// <User.js> //
//==dependencies==//
const { use } = require('express/lib/application');
const mongoose = require('mongoose');


//==schema==//
const userSchema = mongoose.Schema({
    username:{type:String, required:[true, 'Username is required!'], unique:true},
    password:{type:String, required:[true, 'Password is required!'], select:false},  //db에서 읽어오지 않음
    name:{type:String, required:[true, 'Name is required!']},
    email:{type:String}
}, {
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
userSchema.path('password').validate(function(v) {
    let user = this;

    //create user//
    if(user.isNew) {
        if(!user.passwordConfirmation) {
            user.invalidate('passwordConfirmation', 'Password Confirmation is required.');
        }

        if(user.password !== user.passwordConfirmation) {
            use.invalidate('passwordConfirmation', 'Password Confirmation does not matched!');
        }
    }

    //update user//
    if(!user.isNew) {
        if(!user.currentPasswowrd) {
            user.invalidate('currentPassword', 'Current Password is required!');
        }
        else if(user.currentPasswowrd != user.originalPassword) {
            user.invalidate('currentPassword', 'Current Password is invalid!');
        }

        if(user.newPassword !== user.passwordConfirmation) {
            user.invalidate('passwordConfirmation', 'Password Confirmation does not matched!');
        }
    }
});

const User = mongoose.model('user', userSchema);
module.exports = User;