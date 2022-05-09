// <Comment.js> //
//==dependencies==//
const mongoose = require('mongoose');


//==schema==//
const commentSchema = mongoose.Schema({
    post:{type:mongoose.Schema.Types.ObjectId, ref:'post', required:true},   
    author:{type:mongoose.Schema.Types.ObjectId, ref:'user', required:true}, //author와 user 연관관계
    parentComment:{type:mongoose.Schema.Types.ObjectId, ref:'comment'}, //대댓글의 부모
    text:{type:String, required:[true,'text is required!']},
    isDeleted:{type:Boolean}, //대댓글의 부모가 삭제되면 고아 객체가 되버림.이때 표시되지 않도록 함
    createdAt:{type:Date, default:Date.now},
    updatedAt:{type:Date},
},{
    toObject:{virtuals:true}
});
commentSchema.virtual('childComments')  //대댓글의 자식
    .get(() => { return this._childComment; })
    .set((value) => { this._childComment=value;});
//댓글의 부모자식관계 매핑

const Comment = mongoose.model('comment', commentSchema);
module.exports = Comment;