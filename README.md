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

6. updatePost 2
- 이전 updatePost의 두가지 주요한 문제가 있음.
> - 1) 필드를 하나만 업데이트하고자 하는경우에도 모든 인자값을 업데이트하도록 값을 넣어주어야 함.(업데이트를 원하는 필드만 인자로 넣어서 실행하기.)
> - 2) 두 사람이 객체를 수정하는 경우 정보가 손실될 수 있음(업데이트 Version관리를 version 필드를 통해서 해결)
- 이러한 문제를 해결하기 위해서 요청에 지정된 인수만 수정한 다음, UpdateItem 작업에 조건을 추가하도록 updatePost변형을 수정해야함.
- 먼저 선택한 필드에 한에서만 업데이트 되도록 필수값을 의미하는 ! 표시를 제거하도록 함.
- 주의(#과 $를 혼동하지 않도록)
```
  {
    "version" : "2017-02-28",
    "operation" : "UpdateItem",
    "key" : {
      "id" : $util.dynamodb.toDynamoDBJson($context.arguments.input.id)
    },
      
    #set( $expSet = {} )		## Update될 Fields.
    #set( $expNames = {} )  	## 예약어들.
    #set( $expValues = {} )		## 값들.
    #set( $expAdd = {} )		## ADD될 Fields
    #set( $expRemove = [] )		## REMOVE될 Fields
    
    ## Added Field.
    $!{expAdd.put("version", ":one")}
    $!{expValues.put(":one", { "N" : 1 })}
    
    
    ## Filter 1 { Fields Not "id" && "expectedVersion"}
    ## Filter 2 { Null / Not Null } 
    #foreach( $entry in $context.arguments.input.entrySet() )
      #if( $entry.key != "id" && $entry.key != "expectedVersion" )
          #if( (!$entry.value) || ("$!{entry.value}" == "") )	## <참고> $$가 아니라 ||으로 변경되어야하지 않나?
              ## 잘못된 표현
              ## $!{expRemove.add("#${entry.key}")}   
                
                #set( $discard = $expRemove.add("#${entry.key}") )
              $!{expNames.put("#${entry.key}", $entry.key)}
            #else
              $!{expSet.put("#${entry.key}", ":${entry.key}")}
                $!{expNames.put("#${entry.key}", $entry.key)}  ## <참고> 시도1. "${entry.key}" -> $entry.key로 변경해보기.
                $!{expValues.put(":${entry.key}", { "S" : "${entry.value}" })} ## <참고> 시도2. "${entry.value}" -> $entry.value / { "S" : "" } -> $util.toJson($entry.value) 두 가지 변경해보기.
            #end
        #end
    #end
    
    ## SET 내용들 분리
    ## Filter 1 { expSet is Not Empty }
    #set( $expression = "" )
    #if( !$expSet.isEmpty() )  ## <참고> 시도. $!{entrySet.isEmpty()}로 변경해보기.
    #set( $expression = "SET" )
        #foreach( $entry in $expSet.entrySet() )
          #set( $expression = "${expression} ${entry.key} = ${entry.value}" )
            #if( $foreach.hasNext )
              #set( $expression = "${expression}," )
            #end
        #end
    #end
    
    ## ADD 내용들 분리
    #if( !$expAdd.isEmpty() )
      #set( $expression = "${expression} ADD" )
    #foreach( $entry in $expAdd.entrySet() )
          #set( $expression = "${expression} ${entry.key} ${entry.value}" )
          #if( $foreach.hasNext )
              #set( $expression = "${expression}," )
            #end
        #end
    #end
    
    ## REMOVE 내용들 분리
    #if( !$expRemove.isEmpty() )
      #set( $expression = "${expression} REMOVE")
      #foreach( $entry in $expRemove )
        #set( $expression = "${expression} ${entry}")
            #if( $foreach.hasNext )
              #set( $expression = "${expression}," )
            #end        
        #end
    #end
    
    ## Expression.
    "update" : {
      "expression" : "$expression"
      #if( !$expNames.isEmpty() )
        ,"expressionNames" : $utils.toJson($expNames)
      #end
      #if( !$expValues.isEmpty() )
        ,"expressionValues" : $utils.toJson($expValues)
      #end
    },
    
    ## Condition.
    "condition" : {
      "expression" : "#version = :version",
      "expressionNames" : {
        "#version" : "version"
      },
      "expressionValues" : {
        ":version" : $util.dynamodb.toDynamoDBJson($context.arguments.input.expectedVersion)
      }
    }
  }
```
6. upvotePost - 게시물의 [좋아요] 갯수 증가
```
  {
    "version" : "2017-02-28",
    "operation" : "UpdateItem",
    "key" : {
      "id" : $util.dynamodb.toDynamoDBJson($ctx.args.id)
    },
    "update" : {
      ## 주의! ADD로 데이터를 증가시키려면, =을 붙이면 안됨!
      "expression" : "ADD #ups :plusOne, #version :plusOne",
      "expressionNames" : {
        "#ups" : "ups",
        "#version" : "version"
      },
      "expressionValues" : {
        ":plusOne" : { "N" : 1 }
      }
    }
  }
```

7. downvotePost - 게시물의 [싫어요] 갯수 증가
```
  {
    "version" : "2017-02-28",
    "operation" : "UpdateItem",
    "key" : {
      "id" : $util.dynamodb.toDynamoDBJson($ctx.args.id)
    },
    "update" : {
      "expression" : "ADD #downs :plusOne, #version :plusOne",
      "expressionNames" : {
        "#downs" : "down",
        "#version" : "version"
      },
      "expressionValues" : {
        ":plusOne" : { "N" : 1 }
      }
    }
  }
```
8. deleteTestPost - 게시물의 인자값 expectedVersion이 있는경우만 제거하며, 조건식으로는 version과 값이 같아야함(expectedVersion이 없는경우 임의로 생성한 값 리턴함.)
```
  {
    "version" : "2017-02-28",
    #if( $ctx.args.containsKey("expectedVersion") )
      "operation" : "DeleteItem",
      "key" : {
        "id" : $util.dynamodb.toDynamoDBJson($ctx.args.id)
      },
      "condition" : {
        "expression" : "#version = :version",
        "expressionNames" : {
          "#version" : "version"
        },
        "expressionValues" : {
          ":version" : { "N" : $ctx.args.expectedVersion }
        }
      }
    #else
      #return ({
        "id": "ID_NO",
          "author": "AUTHOR_NO",
          "title": "TITLE_NO",
          "content": "Content____",
          "url": "ORORORORORO",
          "ups": 6,
          "downs": 3,
          "version": 15
      })
    #end
  }
```
9. allTestPost
> - 전체 데이터를 가져오되, listTestPost와 다른점이있음.
> - 바로 리턴값으로 list도 전체값을 가져오지만, pagination기능이 있는 allTestPost와는 다르게 리턴값(response 매핑)을 주어야함.
```
  ## Request mapping
  {
    "version" : "2017-02-28",
    "operation" : "Scan"
    #if( $ctx.args.count )  #가져올 데이터를 제한.
      ,"limit" : $util.toJson($ctx.args.count)
    #end
    #if( $ctx.args.nextToken )
      ,"nextToken" : $util.toJson($ctx.args.nextToken)
    #end
  }
  
  ## Response Mapping
  {
    "testPosts" : $util.toJson($ctx.result.items) ## listTestPosts와 다른 리턴값을 작성함.
    #if( $ctx.result.nextToken )
      ,"nextToken" : $util.toJson($ctx.args.nextToken)
    #end
  }
```
10. allTestPost(2) - Filter를 활용.
> - 

```
```


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



## QnA
1) AppSync에서 Pipeline Resolver와 Lambda 사용의 차이
- Pipeline Resolver는 추가비용이 발생하지 않으며, Lambda의 추가홉을 만들 필요가 없으며, 속도가 더 빠름.
- Lambda는 친숙한 프로그래밍 모델을 제공하며, AppSync에서 VTL로 달성할 수 없는 복잡한 다른작업을 수행 할 수 있음.
- `즉, 여러 데이터 소스에 엑세스하기 위해서 Pipe line resolver가 반드시 필요한것은 아님(동일한 요청에서 실행될 수 있는 여러 Resolver를 사용하여 여러 데이터 소스를 설정할 수 있음)`

### Mapping 작성 TIP
- 문자열에는 ""의 쌍따옴표가 있으며, 문자열에서 변수를 참조하려면 "${}"표시.
```
  $set( $firstName = "Jeff" ) 
  $!(myMapp.put("Firstname", "${firstName}"))
```
- 변수를 표현하기 (문자열 안에서 변수를 사용하는 것("${변수명}")과 오직 사용되는 변수만 쓰이는것("$변수명")은 같은의미이지만, 다르게 표현이 될 수 있음.
```
#set( $myData = "KKH" )

## 같은의미 ($userName1 == $userName2)
#set( $userName1 = "${myData}" )    ## "KKH"
#set( $userName2 = "$myData" )      ## "KKH"


## 다른의미 ($userName1 != $userName2)
#set( $userName1 = "${myData}_OK" ) ## "KKH"
#set( $userName2 = "$myData_OK" )   ## "$myData_OK"
```
- 표현식: $!{}
```
  ## 1) Map의 put연산 
  ## 2) Array의 add연산
  ##  즉, 메소드 사용시 $!{} 형태로 구분하도록 해야함.
  {
    ...
    #set( $data = "MyData" )
    #set( $myArr = [] )
    #set( $myMap = {} )
    
    $!{myArr.add(6666)}
    $!{myMap.put("Item", "${data}")}
  }
```
- expression 작성시 주의
```
  ## [1]
  "expression" : $expression,   ## 틀린 표현식
  ...

  ## [2]
  "expression" : "${expression}" ## 맞는 표현식
  
  * update, condition 등 Table의 데이터와 비교하는 표현식을 작성할때에는 반드시, ""문자열로 표현하도록 해야함.
```
- foreach( $item in $items )
```
  #set( $myMap = {} )  ## Map
  #set( $myArray = [] ) ## Array
  
  #foreach( $objItem in $myMap.entrySet() )  ## Map명.entrySet()

  #end

  #foreach( $arrItem in $myArray )  ## 단순 Array명

  #end
```
- Array 데이터 추가 (#set을 사용하도록)
```
  #set( $myArr = [] )
  #set( $data = "55" )

  $myArr.add($data) # 잘못된 표현(직접적으로 .add()를 호출하면 에러가 발생)
  #set( $discard = $myArr.add($data)) # 올바른 표현
```
- Map 데이터 추가 ($!{} 문법으로 표현)
```
  #set( $myMap = {} )
  #set( $data = "55" )

  $!{myMap.put("KEY", $data)}
```
- $ctx.stash
> - Stash는 각 리졸버와 매핑 템플릿에서 사용할 수 있는 Map이다.
> - 주로 파이프라인에서 사용되어지며, 앞단에서의 작성되어지면 해당 리졸버와 뒷단과의 데이터를 공유하게 된 셈이다.
```
  $util.qr($ctx.stash.put("userId", $ctx.args.filter.id))
  $util.qr($ctx.stash.put("userName", $ctx.identity.username))
```
- #return
> - #return(data: Object)은 매핑 템플릿에서 조기에 반환하는경우 유용함.
> - 프로그래밍언어의 return과 비슷하며, 이는 리졸버 매핑 템플릿에서 반환된다는 의미임.
> - 하지만 주의점으로 파이프로 이루어진 함수들을 건너뛰긴하지만, 파이프라인의 마지막 응답 해석기는 거쳐서 간다는 것을 주의.
```
  #if($ctx.stash.callId == "")
    #return($ctx.prev.result)
  #else
    {
      "operation" : "GetItem",
      "key" : {
        "id" : "XXXXXXXX"
      }
    }
  #end
```
- attribute_not_exists(id) / attribute_exists(id)
> - attribute_exists : 조건식 '해당 속성이 존재한다면'
> - attribute_not_exists : 조건식 '해당 속성이 존재하지 않는다면'

- containsKey()
> - 인자에 null값이 있을 수 있다. 이때, null인지 아닌지 확인하기 위한 방법.
```
  #if( $ctx.args.containsKey("expectedVersion") )  ## 주의점으로 ""로 문자열형태로 만들어 줄 것.
    ## IF TRUE
  #end
```


### 재활용
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
- [해석기 문법 Document](http://velocity.apache.org/engine/1.7/user-guide.html#quiet-reference-notation)
- [권한부여 사용사례](https://docs.aws.amazon.com/ko_kr/appsync/latest/devguide/security-authorization-use-cases.html)
- [파이프라인 이해](https://medium.com/@dabit3/intro-to-aws-appsync-pipeline-functions-3df87ceddac1)
- [해석기 매핑 템플릿 컨텍스트 참조](https://docs.aws.amazon.com/ko_kr/appsync/latest/devguide/resolver-context-reference.html#dynamodb-helpers-in-util-dynamodb)
- [DynamoDB 해석기 자습서](https://docs.aws.amazon.com/ko_kr/appsync/latest/devguide/tutorial-dynamodb-resolvers.html)
- [DynamoDB 해석기 자습서2](https://docs.aws.amazon.com/ko_kr/appsync/latest/devguide/resolver-mapping-template-reference-dynamodb.html#aws-appsync-resolver-mapping-template-reference-dynamodb-condition-expressions)
- [AppSync이해](https://dev.classmethod.jp/articles/appsync-resolver-vtl-tutorial-ko/)
- [DynamoDB 해석기](https://docs.aws.amazon.com/ko_kr/appsync/latest/devguide/tutorial-dynamodb-resolvers.html)
- [Resolver Utils](https://docs.aws.amazon.com/ko_kr/appsync/latest/devguide/resolver-util-reference.html)
- [$ctx ? $context ?](https://stackoverflow.com/questions/55243969/aws-appsync-ctx-vs-context-in-resolvers)
- [General Auth](https://docs.aws.amazon.com/ko_kr/cognito/latest/developerguide/cognito-scenarios.html#scenario-aws-and-user-pool)
- [Using Pipeline Resolver? OR Lambda?](https://stackoverflow.com/questions/59879849/aws-amplify-pipeline-resolvers-vs-lambda-resolvers)
- [Enhance appsync dynamodb example with multiple table relationships](https://github.com/serverless/serverless-graphql/issues/248)
- [Pipeline Resolvers](https://github.com/serverless/serverless-graphql/issues/248)
- [Amplify DataStore](https://medium.com/open-graphql/create-a-multiuser-graphql-crud-l-app-in-5-minutes-with-the-amplify-datastore-902764f27404)
- [Amplify Infos](https://awesomeopensource.com/project/dabit3/awesome-aws-amplify)
- [Amplify 강의1](https://egghead.io/lessons/react-native-create-interact-with-a-serverless-rest-api-with-aws-lambda-from-react)
- [DynamoDB 조건식](https://docs.aws.amazon.com/ko_kr/amazondynamodb/latest/developerguide/Expressions.OperatorsAndFunctions.html#Expressions.OperatorsAndFunctions.Syntax)