const {User} = require('../models');
const {signToken} = require('../utils/auth');
const {AuthenticationError} = require('apollo-server-express');

const resolvers = {
    Query: {
        me: async (parent, args, context) => {
            if(context.user) {
                const uData = await User.findOne({ _id: context.user._id}).select('-__v -password')
                return uData;
            }
            throw new AuthenticationError("Couldn't log in!");
        },  
    },
    Mutation: {
        addUser: async (partent, args) => {
            const user = await User.create(args);
            const toke = signToken(user);
            return {toke, user};
        },
        login: async (parent, {email, password}) => {
            const user = await User.findOne({email});
            if (!user) {
                throw new AuthenticationError('User not found!');
            }
            const corrPw = await user.isCorrectPassword(password);
            if (!corrPw) {
                throw new AuthenticationError('Credentials incorrect');
            }
            const toke = signToken(user);
            return {token,user};
        },
        saveBook: async (parent, {newBook}, context) => {
            if (context.user) {
                const updateUser = await User.findByIdAndUpdate(
                    {_id: context.user._id},
                    {$push: {savedBooks: newBook}},
                    {new: true}
                )
                return updateUser;
            }
            throw new AuthenticationError('Log in first!');
        },
        removeBook: async (parent, {bookId}, context) => {
            if (context.user) {
                const updateUser = await User.findByIdAndUpdate(
                    {_id: context.user._id},
                    {$pull: {savedBooks: {bookId}}},
                    {new: true}
                );
                return updateUser;
            }
            throw new AuthenticationError('Log in first!');
        },
    }
};

module.exports = resolvers;