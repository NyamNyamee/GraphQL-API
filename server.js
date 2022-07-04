import { ApolloServer, gql } from "apollo-server";

/**
 * DB대신 메모리 사용
 */
let tweets = [
  {
    id: "1",
    text: "Tweet 1",
    author: {
      id: "1",
      username: "inboo",
      firstName: "Inwoo",
      lastName: "Lee",
      email: "jopelee2@gmail.com",
    },
  },
  {
    id: "2",
    text: "Tweet 2",
    author: {
      id: "2",
      username: "invu",
      firstName: "Segu",
      lastName: "Go",
      email: "gosegu@gmail.com",
      birth: "19970213",
    },
  },
  {
    id: "3",
    text: "Tweet 3",
    author: {
      id: "3",
      username: "chani",
      firstName: "chan",
      lastName: "vii",
      email: "viichan@gmail.com",
      birth: "19990213",
    },
  },
];

let users = [
  {
    id: "1",
    username: "ine",
    firstName: "ne",
    lastName: "hi",
    email: "ine@gmail.com",
    birth: "19950213",
  },
  {
    id: "2",
    username: "lilpa",
    firstName: "pa",
    lastName: "lil",
    email: "lilpa@gmail.com",
    birth: "19960213",
    fullName: "bat"
  },
];

/**
 * gql로 만든 graphql 타입 정의
 */
const typeDefs = gql`
  type User {
    id: ID!
    username: String!
    firstName: String!
    lastName: String!
    email: String!
    birth: String
    fullName: String!
  }

  type Tweet {
    id: ID!
    text: String!
    author: User
  }

  """
  Query 타입은 /와 같은 루트경로로, 필수로 작성해야함. 루트 쿼리이자 GET과 같은 역할임.
  """
  type Query {
    allUsers: [User!]!
    allTweets: [Tweet!]!
    tweet(id: ID!): Tweet
  }

  """
  데이터 변경 쿼리. POST, DELETE, PUT 등 변경과 관련된 모든 타입
  """
  type Mutation {
    postTweet(text: String!, userId: ID!): Tweet!
    deleteTweet(id: ID!): Boolean!
  }
`;

/**
 * 클라이언트에서 요청 시 실제 수행되는 서비스 로직
 */
const resolvers = {
  Query: {
    allUsers() {
      console.log("allUsers is called");
      return users;
    },
    allTweets() {
      console.log("allTweets is called");
      return tweets;
    },
    tweet(root, { id }) {
      // 파라미터 전달 시 리졸버 함수의 2번째 인자에 들어옴
      console.log(`tweet is called`);
      console.log(id);
      return tweets.find((tweet) => tweet.id === id);
    },
  },
  Mutation: {
    postTweet(root, { text, userId }) {
      console.log(`postTweet is called`);
      console.log(text, userId);
      const newTweet = {
        id: parseInt(tweets[tweets.length - 1].id) + 1,
        text,
      };
      tweets.push(newTweet);

      return newTweet;
    },
    deleteTweet(root, { id }) {
      console.log(`deleteTweet is called`);
      console.log(id);
      let result = true;
      if (!tweets.find((tweet) => tweet.id === id)) result = false;
      else tweets = tweets.filter((tweet) => tweet.id !== id);
      return result;
    },
  },
  User: {  // 타입 리졸버. query에서 사용자가 요청한 데이터를 먼저 찾고, 그 이후에 type resolver에서 찾아서 줌
    fullName(root, args) {
      console.log(`fullName is called`);
      console.log(root);  // root는 root에서 얻은 부모? 데이터를 보여줌
      return `${root.lastName} ${root.firstName}`;
    },
  },
};

const server = new ApolloServer({ typeDefs, resolvers });

server.listen().then(({ url, port }) => {
  console.log(`Running on ${url}, ${port}`);
});
