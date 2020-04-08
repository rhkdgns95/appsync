# AWS AppSync Setup with Amplify
- using appsync.

## 1. AppSync Schema
[참고](https://aws-amplify.github.io/docs/cli-toolchain/graphql#auth)

- #### [0] (Post)1 : N(Comment)
> - @connection을 입력. (관계하는 모델끼리 같은 name을 입력)
> - 참조하는 필드값을 가져올 때의 정렬은 createdAt을 기준으로 하며, @connection에 sortField 정렬할 명칭 작성)
```
  type Post @model {
    comments: [Comment] @connection(name: "PostComments", sortField: "createdAt")  
  }

  type Comment @model {
    post: Post! @connection(name: "PostComments", sortField: "createdAt")
  }
```


- #### [1] allow: owner
> - 소유주만 업데이트하고 삭제가 가능함.(다른 사람은 검색밖에 안됨.)
> - 또한 owner가 자동으로 생성됨(user pool의 이름으로)
```
  type Post @model @auth(rules: [
    allow: owner, queries: null
  ]) {

  }
```

- #### [2] createdAt
> - createdAt가 자동으로 생성이 됨.
```
  type Comment @model {
    id: ID!
    content: String!
    createdAt: String
  }
```
- #### [3] 삭제예정 - 인자값 
> - queries, mutations

- #### [4] public 
> - public키는 로그인하지 않아도 모든 유저를 API에 접근 시킬 수 있다. 
> - API키를 이용해서 보호될 것 이다.
> - Public접근을 허용할 때엔 API에 접근하도록 configure에 API KEY를 작성해주도록 해야함.
```
  type Post @model @auth([{ allow: public }]) {
    id: ID!
    title: String!
  }
```

- #### [5] private
> - private은 API에 접근할때, Cognito 유저 풀의 JWT Token을 통해서 접근이 가능함.
```
  type Post @model @auth([{ allow: private, provider: iam }]) {
    id: ID!
    title: String!
  }
```

- #### [6] DateTime
> - model의 생성/업데이트 날짜를 알기위해서는 단순히 다음과 같이 명시만 해주면 됨.
```
  type Post @model {
    ...
    createdAt: String
    updatedAt: String
  }
```

- #### [7] 테이블 공유(접근 제어)
> - 테이블 Post는 다른 유저와 공유할 수 있으며, update와 delete 연산은 소유자만 가능함.
> - 즉, 리스트로 가져오거나 하나의 아이템을 조회를 다른 유저도 가능함.
```
  type Post @model @auth(rules: [
    { allow: owner, operations: [delete, update] }
  ]) {
    id: ID!
    owner: String!
  }
```

- #### [7-2] 테이블 공유(접근 제어)
> - Post2 테이블에 대해서 다른유저는 CRU가 가능하다. (생성, 읽기, 업데이트) / delete은 불가능하며 소유자만 가능함.
> - auth의 rules[ ]에서 `operations를 생략` === `operations: [create, read, update, delete]` 와 같다.(다르게 말하면, operations CRUD연산의 제어권이다. 
> - 비어있는경우 모든 제어가 가능하며, operations에 정의된 연산은 소유자 이외의 유저는 사용할 수 없다.)
```
  type Post2 @model @auth(rules: [
    { allow: owner, operations: [ delete ] }
  ]) {
    id: ID!
    owner: String!
  }
```

- #### [7-3] 테이블 공유(접근 제어)
> - Post3의 테이블에서의 권한은 create이다. 소유자에게만 creat연산이 가능하다는것은, owner에 소유자의 정보가 들어가게된다.
> - 이전에 Post1과 Post2에서는 owner필드가 존재하지만, null값이 들어갔을 것 이다.
> - 하지만, Post3에서는 create의 권한을 명시하므로써, 생성된 데이터의 소유자 정보(owner)가 자동으로 저장된다.
```
  type Post3 @model @auth(rules: [
    { allow: owner, ownerField: "owner", operations: [ create ] }
  ]) {
    id: ID!
    owner: String!
  }
```

- #### [7-4] 테이블 공유(접근 제어)
> - Post4의 테이블의 권한은 모든 유저가 공통된 데이터를 읽어오지만, 업데이트나 삭제, 소유권은 각자에게 있음.
> - 또한, Post4의 데이터를 삭제해도 연관된 Comment는 삭제되지 않는다.
```
  type Post4 @model @auth(rules: [
    { allow: owner, ownerField: "owner", operations: [ create, update, delete ] }
  ]) {
    ...
    owner: String
    comment: [Comment] @connection(keyName: "byPost", fields: ["id"])
  }

  type Comment @model @auth(rules: [
    { allow: owner, ownerField: "owner", operation: [ create, update, delete ] }
  ]) @key(name: "byPost", fields: ["postId", "content"]) {
    ...
    content: string
    owner: String
    postId: ID!
    post: Post! @connection(fields: ["postId"])
  }
```


- #### [8] 테이블에 연관된 데이터가 있는경우 데이터가 종속되는지? (1:N의 경우, 1을 삭제할경우? N도 cascade가 되는지?)
> - Post에 속하는 comment가 여러개 있는 상황을 예로 들어보자.
> - Post를 삭제하면, 연관된 comment가 삭제될까?  → 그렇지 않다.
```
  type Post @model @auth(rules: [ 
    { allow: owner, ownerField: "owner", operations: [] }
  ]){
    id: ID!
    owner: String
    comme	nts: [Comment] @connection(keyName: "byPost", fields: ["id"])
  }

  type Comment @model @auth(rules: [
    { allow: owner, ownerField: "owner", operations: [delete]
  ]) @key(name: "byPost", fields: ["postId, "content""]) {
    ... 
    post: Post! @connection(fields: ["postId"])
  }
```

- #### [9] 1:1 관계
```
  type Project @model {
    ...
    teamId: ID!
    team: Team @connection(fields: ["teamId"])
  }

  type Team @model {
    id: ID!
    name: String!
  }
```

- #### [10] 1:N의 참조하는 값 정렬 시켜 출력하기.
```
  type Post @model {
    id: ID!
    title: String!
    comments: [Comment] @connection(name: "PostComments", sortField: "createdAt")
  }

  type Comment @model {
    id: ID!
    title: String!
    post: Post! @connection(name: "PostComments", sortField: "createdAt")
    createdAt: String
  }
```
- #### [11] Has Many
> - Post는 여러 Comment를 갖음.
> - field값의 'postId'와 'content'는 Post의 comments를 가져올때, postId를 갖고 content를 기본으로 정렬해서 가져옴.
```
  type Post @model {
    id: ID!
    title: String!
    comments: [Comment] @connection(keyName: "byPost", fields: ["id"])
  }

  type Comment @model
    @key(name: "byPost", fields: ["postID", "content"]) {
    id: ID!
    postID: ID!
    content: String!
  }
```



## 2. AppSync Schema Example
0) Example
> - Simplest (모든  CRUD 권한은 소유자에게 있음1) 
```
  type Post @model @auth(rules: [{ allow: owner }]) {
    id: ID!
    title: String!
  }
```
> - long form way (모든  CRUD 권한은 소유자에게 있음2)
```
  type Post @model @auth(rules: [
    { allow: owner, ownerField: "owner", operations: [create, update, delete, read] }
  ]) {
    id: ID!
    title: String!
    owner: String
  }
```
1) Example
```
  type Post @model @auth(rules: [
    { allow: owner, ownerField: "owner", queries: null }
  ]) {
    id: ID!
    title: String!
    comments: [Comment] @connection(name: "PostComments", sortField: "createdAt")
  }

  type Comment @model {
    id: ID!
    content: String!
    post: Post! @connection(name: "PostComments", sortField: "createdAt")
    createdAt: String
  }

  type Event @model @key(name: "queryName", fields: [
    "queryName", "createdAt"
  ], queryField: "itemsByDate") {
    id: ID!
    name: String!
    createdAt: String!
    queryName: String!
  }
```
2) Example
```
  type Blog @model {
    id: ID!
    name: String!
    posts: [Post] @connection(keyName: "byBlog", fields: ["id"])
  }

  type Post @model @key(name: "byBlog", fields: ["blogID"]) {
    id: ID!
    title: String!
    blogID: String!
    blog: Blog @connection(fields: ["blogID"])
    comments: [Comment] @connection(keyName: "byPost", fields: ["id"])
  }

  type Comment @model @key(name: "byPost", fields: ["postID", "content"]) {
    id: ID!
    postID: ID!
    post: Post @connection(fields: ["postID"])
    content: String!
  }
```
3) Example 
```
  type Post @model @auth(rules: [
    { allow: owner, ownerField: "owner", operations: [ create, delete, update ]}
  ]){
    id: ID!
    title: String!

    ownerId: ID
    owner: String

    comments: [Comment] @connection(keyName: "byPost", fields: ["id"])

    createdAt: String
    updatedAt: String
  }

  type Comment @model @auth(rules: [
    { allow: owner, operations: [ delete, create, update ] }
  ])
  @key(name: "byPost", fields: ["postId", "content"]){
    id: ID!
    postId: ID!
    post: Post @connection(fields: ["postId"])
    content: String!
    owner: String
    createdAt: String
    updatedAt: String
  }
```


## 3. 해석기 매핑 템플릿 
0. $utils.dynamodb 
> - `$utils.dynamodb.toDynamoDBJson(...)`
> - Amazon DynamoDB에 데이터 쓰기 및 읽기를 더 용이하게 해주는 핼퍼 메서드(자동 유형 매핑 및 형식지원) 
> - 이러한 메소드는 기본유형 및 목록을 적절한 DynamoDB 입력 형식({ "type" : VALUE } 형식의 Map)에 자동으로 매핑하도록 설계되어 있다.

1. DynamoDB 표현 2가지
> - 객체를 반환하는 버전 → `$utils.dynamodb.toString(...)`
> - 객체를 JSON문자열로 반환하는 버전 → `$utils.dynamodb.toStringJson(...)`

2. addPost - DynamoDB의 형식은 모든키와 속성값에 생성(PutItem)
```
  # 요청 매핑 템플릿
  {
    "version": "2017-02-28",
    "operation" : "PutItem",
    "key": {
      "id" : $util.dynamodb.toDynamoDBJson($context.arguments.id) # 키 값을 인자로 받아서 사용하는 경우,
       # "id" : $util.dynamodb.toDynamoDBJson($util.autoId()) # 키 값을 인자로 받지 않고 자동생성하는 경우,
    },
    "attributeValues": {
      "author" : $util.dynamodb.toDynamoDBJson($context.arguments.author),
      "title" : $util.dynamoDB.toDynamoDBJson($context.arguments.title),
      "content" : $util.

      "ups": { "N" : 1 },
      "downs": { "N" : 0 },
      "version": { "N" : 1 }
      ...
    }
  }
  # 응답 매핑 템플릿

  $util.toJson($context.result)
```

3. getPost
```
  # 요청 매핑 템플릿
  {
    "version": "2017-02-28",
    "operation" : "GetItem",
    "key" : {
      "id" : { "S" : $context.arguments.id }  # 방법 1(실패 - 타입에러)
      "id" : $context.arguments.id  # 방법 2(실패 - 타입에러)
      "id" : $util.dynamoDB.toDynamoDBJson($context.arguments.id) # 방법 3(성공)
      "id" : $util.dynamoDB.toDynamoDBJson($ctx.args.id) # 방법 4(성공)
    }
  }
  # 응답 매핑 템플릿  
  $util.toJson($context.result) 
  # $util.toJson($ctx.result)  ## 위와 동일함.


  - 다음과 같은 작업이 수행된 것.
    1. AWS AppSync에서 getPost 쿼리요청을 수신.
    2. AWS AppSync에서 요청 및 요청 매핑 템플릿을 받아 요청 매핑문서를 생성(아래와 같은 형태)
      {
        "version" : "2017-02-28",
        "operation" : "GetItem",
        "key" : {
          "id" : { "S" : "9a418941-5c57-4bdc-bde5-dc614d047be8" }  
        }
      }
    3. AWS AppSync에서 요청 매핑 문서를 사용해 DynamoDB GetItem요청을 생성 및 실행.
    4. AWS AppSync에서 GetItem 요청의 결과를 받아 GraphQL형식으로 반환(아래와 같음)
      {
        "id" : "9a418941-5c57-4bdc-bde5-dc614d047be8",
        "author" : "KKH",
        "title" : "First post",
        "content" : "This is first post",
        "url" : "https://aws.amazon.com/appsync/",
        "ups" : 1,
        "downs" : 0,
        "version" : 1
      }
```
4. $util.dynamodb.toDynamoDB(Object) : Map
- 입력 객체를 적절한 DynamoDB 표현으로 변환하는 DynamoDB용 일반 객체 변환 도구.
- 이 도구는 몇 가지 형식을 표현하는 방법에 대해 독자적인 방식을 가지고 있습니다. 
- 예를 들어 집합("SS", "NS", "BS")보다는 목록("L")을 사용합니다. 
- DynamoDB 속성 값을 설명하는 객체를 반환합니다.

5. updatePost
```
  # Update되는 필드: author, title, content, url, version
  # 예약어: url
  # 증분: version

  # version은 ADD기능을 넣어주므로 1씩 증가 할 것임.
  {
    "version" : "2017-02-28",
    "operation" : "UpdateItem",
    "key": {
      "id": $util.dynamodb.toDynamoDBJson($ctx.args.id)
    },
    "update": {
      "expression": "SET author = :author, content = :content, title = :title, #MYUrl = :url ADD version :one",
      "expressionNames": {
        "#MYUrl" : "url"
      },
      "expressionValues": {
        ":author" : $util.dynamodb.toDynamoDBJson($ctx.args.author),
          ":content" : $util.dynamodb.toDynamoDBJson($ctx.args.content),
          ":title": $util.dynamodb.toDynamoDBJson($ctx.args.title),
          ":url" : $util.dynamodb.toDynamoDBJson($ctx.args.url),
          ":one" : { "N" : 1 }
      }
    }
  }
```
- 크게 PutItem작업과 다른 DynamoDB UpdateItem작업을 사용함.
- 전체항목을 작성하는 대신, 특정속성을 업데이트 하도록 DynamoDB에 요청함.
- DynamoDB 업데이트 표현식을 사용하여 요청.
- 표현식 자체는 `expression` 섹션의 `update`필드에서 지정.
- 이 표현식은 author, title, content 및 url 속성을 설정한 다음 version 필드를 증분하도록 함.
- 사용되는 값은 표현식 자체에 나타나지 않으며, 대신 표현식에서 이름이 콜론으로 시작되는 자리표시자가 있음.
- 표현식은 `expressionValues`필드에서 정의.
- 마지막으로 DynamoDB에는 `expression`에 표시할 수 없는 예약어가 있음.
- 예를들어, `url은 예약어`이므로 url 필드를 업데이트 하려면 이름 자리 표시자를 사용해서 `expressionNames`필드에 해당 자리표시자를 정의.



## N. Amplify CLI [문서](https://aws-amplify.github.io/docs/cli-toolchain/quickstart?sdk=js)
- amplify add api 
> AWS Appsync의 api를 추가. (GraphQL을 선택 등 셋팅작업)
- amplify status
> amplify 확인하기.
- amplify update
> 기존에 생성한 amplify를 업데이트 하기.
- amplify remove
> amplify 서비스를 더이상 사용하고 싶지 않은 경우.
- amplify delete
> amplify의 init을 실행하지 않은것처럼 로컬 혹은 클라우드에서 전체 프로젝트를 통채로 삭제.
- amplify add codegen --API_KEY
> 정의한 Schema를 바탕으로 GraphQL의 API를 생성해줌.
> 참고: https://github.com/aws-amplify/amplify-cli/issues/553




## 재활용
```
query GetTestPost {
  getTestPost(id: "9a418941-5c57-4bdc-bde5-dc614d047be8") {
    ...ItemTestPost
  }
}

mutation TestUpdatePost {
  testUpdatePost(id: "9a418941-5c57-4bdc-bde5-dc614d047be8" author:"Updated2 KKH", title:"Updated2 title", content:"Updated2 Content", url:"Update2.com") {
    ...ItemTestPost
  }
}

mutation TestAddPost {
  testAddPost(
    author: "AUTHORNAME"
    title: "Our first post!"
    content: "This is our first post."
    url: "https://aws.amazon.com/appsync/"
  ) {
    ...ItemTestPost
  }
}

fragment ItemTestPost on TestPost {
  id
  author
  title
  content
  url
  ups
  downs
  version
}
```

## Etc
- [ClientId]: 71ghl2i72iafl2s2e8pokmhbf1
- Congnito-id: amhkyhlzsklacloxgx@ttirv.com
- [DynamoDB 해석기 자습서](https://docs.aws.amazon.com/ko_kr/appsync/latest/devguide/tutorial-dynamodb-resolvers.html)
- [AppSync이해](https://dev.classmethod.jp/articles/appsync-resolver-vtl-tutorial-ko/)
- [DynamoDB 해석기](https://docs.aws.amazon.com/ko_kr/appsync/latest/devguide/tutorial-dynamodb-resolvers.html)
- [Resolver Utils](https://docs.aws.amazon.com/ko_kr/appsync/latest/devguide/resolver-util-reference.html)
- [$ctx ? $context ?](https://stackoverflow.com/questions/55243969/aws-appsync-ctx-vs-context-in-resolvers)
- [General Auth](https://docs.aws.amazon.com/ko_kr/cognito/latest/developerguide/cognito-scenarios.html#scenario-aws-and-user-pool)