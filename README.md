# typescript-mongoose-typegoose-mongoose-graphql

Template starter project to develop `TypeScript` backend with `GraphQL` strongly typed models
`NodeJS`, `MongoDB`, `GraphQL`, `Apollo` and `Express`.

# In order to run project put in .env file something like:
DATABASE_URL=mongodb://localhost:27017/typegoose
PORT=2020
PASSWORD_SALT=xx

# Running
* clone the repo
* npm i
* npm run dev
* go to localhost:2020/graphql

# GraphQL Queries:

    # getUser
    query{ getUser(id: "5ce1b0dc0b3d81401b0971a1") {
      username
      id
      role
    }}

# GraphQL Mutations:


    # createUser
    mutation {
      createUser( name:"adyx", password:"123456") {
        id
        username
      }
    }

    # login
    mutation{ login(req: { username: "adyx", password: "123456"} ) {
      jwt
    }}

# Credits
Inital fork of this project came from
https://github.com/Veetaha/typegraphql-typegoose-express-react-template
