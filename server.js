import { ApolloServer, gql } from "apollo-server";
import fetch from "node-fetch";

/**
 * DB대신 메모리 사용
 */
let tweets = [
  {
    id: "1",
    text: "Tweet 1",
    userId: "3",
  },
  {
    id: "2",
    text: "Tweet 2",
    userId: "2",
  },
  {
    id: "3",
    text: "Tweet 3",
    userId: "1",
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
    fullName: "bat",
  },
  {
    id: "3",
    username: "vichani",
    firstName: "chan",
    lastName: "vii",
    email: "viichan@gmail.com",
    birth: "19990213",
    fullName: "gorani",
  },
];

/**
 * gql로 만든 graphql 타입 정의 (SDL: schema definition query)쿼리
 */
const typeDefs = gql`
  type User {
    id: ID!
    username: String!
    firstName: String!
    lastName: String!
    email: String!
    birth: String
    """
    루트쿼리가 아닌 user 타입 리졸버에서 firstName과 lastName을 받아 합치게 되는 필드
    """
    fullName: String!
  }

  type Tweet {
    id: ID!
    text: String!
    author: User
  }

  type Movie {
    id: Int!
    url: String!
    imdb_code: String!
    title: String!
    title_english: String!
    title_long: String!
    slug: String!
    year: Int!
    rating: Float!
    runtime: Float!
    genres: [String!]!
  }

  """
  Query 타입은 /와 같은 루트경로로, 필수로 작성해야함. 루트 쿼리이자 GET과 같은 역할임.
  """
  type Query {
    """
    모든 유저 리스트
    """
    allUsers: [User!]!
    """
    모든 트윗 리스트
    """
    allTweets: [Tweet!]!
    """
    특정 트윗
    """
    tweet(id: ID!): Tweet
    """
    모든 영회
    """
    allMovies(limit: Int): [Movie!]!
    """
    특정 영화
    """
    movie(id: ID!): Movie
  }

  """
  데이터 변경 쿼리. POST, DELETE, PUT 등 변경과 관련된 모든 타입
  """
  type Mutation {
    """
    트윗 생성. 생성 시 userId를 받아 Users에서 해당 유저를 찾고, Tweet의 author 필드에 대입
    """
    postTweet(text: String!, userId: ID!): Tweet
    """
    트윗 제거
    """
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
      // 파라미터 전달 시 리졸버 함수의 2번째 인자로 들어옴
      console.log(`tweet is called`);
      console.log(id);
      return tweets.find((tweet) => tweet.id === id);
    },
    // 참고 영화 API: https://yts.mx/api
    async allMovies(root, { limit }) {
      return await fetch(`https://yts.mx/api/v2/list_movies.json?limit=${limit}`)
        .then((res) => res.json())
        .then((json) => json.data.movies);
    },
    async movie(root, { id }) {
        return await fetch(`https://yts.mx/api/v2/movie_details.json?movie_id=${id}`)
        .then((res) => res.json())
        .then((json) => json.data.movie);
    }
  },
  Mutation: {
    postTweet(root, { text, userId }) {
      console.log(`postTweet is called`);
      console.log(text, userId);
      if (!users.find((user) => user.id === userId)) return null; // user존재유무 유효성검사
      const newTweet = {
        id: parseInt(tweets[tweets.length - 1].id) + 1,
        text,
        userId,
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
  User: {
    // 타입 리졸버. query에서 사용자가 요청한 데이터를 먼저 찾고, 그 이후에 type resolver에서 찾아서 줌
    fullName(root, args) {
      console.log(`fullName is called`);
      //   console.log(root);  // root는 root에서 얻은 부모? 데이터를 보여줌
      return `${root.lastName} ${root.firstName}`;
    },
  },
  Tweet: {
    // 타입 리졸버. query에서 사용자가 요청한 데이터를 먼저 찾고, 그 이후에 type resolver에서 찾아서 줌
    author({ userId }) {
      console.log(`author is called`);
      // console.log(userId);
      return users.find((user) => user.id === userId);
    },
  },
};

const server = new ApolloServer({ typeDefs, resolvers });

server.listen().then(({ url, port }) => {
  console.log(`Running on ${url}, ${port}`);
});
