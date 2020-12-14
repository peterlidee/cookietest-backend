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
                //secure: true,
                //sameSite: "none",
            });
            return random;
        }
    }
};
 
// create ApolloServer
const server = new ApolloServer({
    typeDefs,
    resolvers,
    // resolverValidationOptions: {
    //     requireResolversForResolveType: false
    // },
    context: ctx => ({ ...ctx }),
})
 
// make the express server
const app = express();

server.applyMiddleware({ app });

// set cors
const corsOptions = {
    credentials: true, // <-- REQUIRED backend setting
    //origin: process.env.FRONTEND_URL, // you'd think this would work but it only does locally, not on heroku
    //origin: "https://10votes-frontend.peterlidee.vercel.app/",
    //origin: true, // so we just set true and it works, dunno why but it took me long enough
    origin: process.env.NODE_ENV === "production" ? 'https://10votes-frontend.peterlidee.vercel.app/' : "http://localhost:7777",
};

console.log('what is env?', process.env.NODE_ENV, 'corsoptions', corsOptions)

    
server.applyMiddleware({
    app,
    path: '/', // keep this or it will become /graphql
    cors: corsOptions,
})

app.listen({ port: process.env.PORT || 4444 }, () => {
    console.log(`🚀 Server ready at http://localhost:4444${server.graphqlPath}`)
});