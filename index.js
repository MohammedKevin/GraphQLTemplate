const express = require('express')
const cors = require('cors')
var { graphqlHTTP } = require('express-graphql');
const gql = require('graphql-tag')
const { buildASTSchema } = require('graphql')

const app = express()
app.use(cors())

const PEOPLE = new Map()
const POSTS = new Map()

class Post {
  constructor (data) { Object.assign(this, data) }
  get author () {
    return PEOPLE.get(this.authorId)
  }
}

class Person {
  constructor (data) { Object.assign(this, data) }
  get posts () {
    return [...POSTS.values()].filter(post => post.authorId === this.id)
  }
}

const schema = buildASTSchema(gql`
  type Hello{
      hello: String
  }

  type Query {
    hello: String

    posts: [Post]
    post(id: ID): Post
    authors: [Person]
    author(id: ID): Person
  }

  type Post {
    id: ID
    author: Person
    body: String
  }

  type Person {
    id: ID
    posts: [Post]
    firstName: String
    lastName: String
  }

  type Mutation {
    submitPost(input: PostInput!): Post
    deletePost(id: ID!): Boolean
  }

  input PostInput {
    id: ID
    body: String!
  }
`)
  

const rootValue = {
  hello: () => 'Hello, GraphQL is cool!!!',

  posts: () => POSTS.values(),
  post: ({ id }) => POSTS.get(id),
  authors: () => PEOPLE.values(),
  author: ({ id }) => PEOPLE.get(id),
  deletePost: async ({ id }, { headers }) => {
    if (!POSTS.has(id)) return false

    POSTS.delete(id)

    return true
  }
}

const initializeData = () => {
    const fakePeople = [
      { id: '1', firstName: 'Kevin', lastName: 'Mohammed' },
      { id: '2', firstName: 'Huber', lastName: 'Franz' }
    ]
  
    fakePeople.forEach(person => PEOPLE.set(person.id, new Person(person)))
  
    const fakePosts = [
      { id: '1', authorId: '1', body: 'Servus' },
      { id: '2', authorId: '2', body: 'Griaß die!' }
    ]
  
    fakePosts.forEach(post => POSTS.set(post.id, new Post(post)))
  }
initializeData()

app.use('/graphql', graphqlHTTP({
  schema: schema,
  rootValue: rootValue,
  graphiql: true,
}));
app.listen(4000);