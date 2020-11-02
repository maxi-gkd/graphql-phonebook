const dotenv = require('dotenv');
const { ApolloServer, UserInputError, gql } = require('apollo-server')
const  Logging  = require('./log')

const Person = require('./models/person')
const User = require('./models/user')
const mongo = require('./mongo')
const jwt = require('jsonwebtoken');
const LogPlugin = require('./log');

dotenv.config();

const jwtSecret = process.env.JWT_SECRET

const typeDefs = gql`
enum YesNo {
  YES
  NO
}

type Address {
  street: String!
  city: String! 
}

type Person {
  name: String!
  phone: String
  address: Address!
  id: ID!
}

type User {
  username: String!
  friends: [Person!]!
  id: ID!
}

type Token {
  value: String!
}

type Query {
  personCount: Int!
  allPersons(phone: YesNo): [Person!]!
  findPerson(name: String!): Person
  me: User
}

type Mutation {
  addPerson(
    name: String!
    phone: String
    street: String!
    city: String!
  ): Person
  addAsFriend(
    name: String!
  ): User
  editNumber(
    name: String!
    phone: String!
  ): Person
  createUser(
    username: String!
  ): User
  login(
    username: String!
    password: String!
  ): Token
}
`

const resolvers = {
  Query: {
    personCount: () => Person.collection.countDocuments(),
    allPersons: (root, args) => {
      if (!args.phone) {
        return Person.find({})
      }

      return Person.find({ phone: { $exists: args.phone === 'YES' } })
    },
    findPerson: (root, args) => Person.findOne({ name: args.name }),
    me: (root, args, context) => {
      return context.currentUser
    }
  },
  Person: {
    address: root => {
      return {
        street: root.street,
        city: root.city
      }
    }
  },
  Mutation: {
    addPerson: async (root, args, context) => {
      const person = new Person({ ...args })
      const currentUser = context.currentUser

      if (!currentUser) {
        throw new AuthenticationError("not authenticated")
      }

      try {
        await person.save()
        currentUser.friends = currentUser.friends.concat(person)
        await currentUser.save()
      } catch (error) {
        throw new UserInputError(error.message, {
          invalidArgs: args,
        })
      }

      return person
    },
    addAsFriend: async (root, args, { currentUser }) => {
      const nonFriendAlready = (person) => 
        !currentUser.friends.map(f => f._id).includes(person._id)
  
      if (!currentUser) {
        throw new AuthenticationError("not authenticated")
      }
  
      const person = await Person.findOne({ name: args.name })
      if ( nonFriendAlready(person) ) {
        currentUser.friends = currentUser.friends.concat(person)
      }
  
      await currentUser.save()
  
      return currentUser
    },
    editNumber: async (root, args) => {
      const person = await Person.findOne({ name: args.name })
      person.phone = args.phone

      try {
        await person.save()
      } catch (error) {
        throw new UserInputError(error.message, {
          invalidArgs: args,
        })
      }
      return person
    },
    createUser: (root, args) => {
      const user = new User({ username: args.username })

      return user.save()
        .catch(error => {
          throw new UserInputError(error.message, {
            invalidArgs: args,
          })
        })
    },
    login: async (root, args) => {
      const user = await User.findOne({ username: args.username })

      if (!user || args.password !== 'secred') {
        throw new UserInputError("wrong credentials")
      }

      const userForToken = {
        username: user.username,
        id: user._id,
      }

      return { value: jwt.sign(userForToken, jwtSecret) }
    },
  }
}

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: async ({ req }) => {
    const auth = req ? req.headers.authorization : null
    if (auth && auth.toLowerCase().startsWith('bearer ')) {
      const decodedToken = jwt.verify(
        auth.substring(7), jwtSecret
      )
      const currentUser = await User.findById(decodedToken.id).populate('friends')
      return { currentUser }
    }
  },
  plugins: [LogPlugin]
})

server.listen().then(({ url }) => {
  console.log(`Server ready at ${url}`)
})