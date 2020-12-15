const express = require('express');
const { ApolloServer, gql } = require('apollo-server-express');
 
// Construct a schema, using GraphQL schema language
const typeDefs = gql`
    type Query{
        hello: String!
    }
    type Mutation{
        testCookie: Int!
    }
`;
 
// Provide resolver functions for your schema fields
const resolvers = {
    Query: {
        hello: () => 'Hello world!',
    },
    Mutation:{
        testCookie: (parent, args, ctx, info) => {
            // generate random num 0-1000 to set as value for cookie
            const random = Math.floor(Math.random() * 1000);

            // set cookie
            ctx.res.cookie('test', random, {
                httpOnly: true,
                maxAge: 1000 * 60 * 60 * 24 * 365, // oneyear cookie 
                secure: true,
                sameSite: "none",
            });
            return random;
        }
    }
};
 
// create ApolloServer
const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: ctx => ({ ...ctx }),
})
 
// make the express server
// we will add more middleware later, so we need this
const app = express();

// set cors
const corsOptions = {
    credentials: true, // <-- REQUIRED backend setting
    origin: process.env.NODE_ENV === "production" ? 'https://corstest-frontend.vercel.app' : "http://localhost:7777",
};
    
server.applyMiddleware({
    app,
    path: '/', // keep this or it will become /graphql
    cors: corsOptions,
})

app.listen({ port: process.env.PORT || 4444 }, () => {
    console.log(`🚀 Server ready at http://localhost:4444${server.graphqlPath}`)
});