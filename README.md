# AWS AppSync Setup with Amplify
- using appsync.

## Todo
- [x] AWS appsync setup with amplify
- [x] Using Formik, GraphQL Mutation with Apollo and AppSync Client
- [x] Querying AppSync and Using Css Grid + Subscription

## Install
- npm install -g @aws-amplify/cli
- yarn add aws-appsync react-apollo aws-appsync-react
- yarn add @material-ui/core
- yarn add @material-ui-icons
- yarn add formik
- yarn add apollo-boost
- yarn add immer

## Bugs
- yarn upgrade react-apollo@2.5.8 
> * aws-appsync-react는 react-apollo 3.x.x 버전은 에러가 발생함.
> * 1. 버전을 변경하여 Rehydrated컴포넌트의 의존성을 해결하라고 함.
> * 2. Rehydrated가 Aws의 AppSync에 Client가 연결이 될 때까지 앱의 렌더링을 기다려야하지만, react-apollo의 3.x이상부터 에러가 발생하여, 방법으로는 다음 두가지 Rehydrated의 커스텀하게 사용하는 방법 또는 2.5.8로 버전을 낮추는 방법중 react-apollo를 최신버전으로 사용하고 Rehydrated를 컴포넌트가 렌더링 된 이후에 App을 Wrapper하는 방법으로 사용하기.
> * [참고1](https://github.com/aws-samples/aws-serverless-appsync-app/issues/8)
> * [참고2](https://github.com/awslabs/aws-mobile-appsync-sdk-js/issues/448)
- Chrome Secret Mode Not working.


## Study
- 1. tsconfig 
> 1) tsconfig의 lib: lib는 사용할 라이브러리를 배열형태로 저장시키는데, lib항목이 없는경우 ECMAScript의 버전에 따라 기본값을 사용함.
>> (ES5의 기본값: [dom, es5, scripthost], ES6의 기본값: [dom, dom.iterable, es6, scripthost])
>> 예를들어, ES6의 Promise를 사용하려면, es2015.promise라는 라이브러리를 정의하여 인젝션 해주도록 해야함.
> 2) skipLibCheck: true // 모든 선언파일의 (*.d.ts)의 유형검사를 건너띌지 여부
> 3) > react-hooks의 Query사용
>> useMutation은 동작되지만, useQuery가 에러가 발생함.
>> 그래서 해결책으로 useApolloClient()를 통해 client객체를 직접 호출하여 데이터에 접근하였더니 동작함.
>> 하지만 다시 에러가 발생함. 
>> 예를들어, const data = client.readQuery({ query: MeQuery });로 사용시, 맨 처음 호출된 경우라면(맨 처음의 캐시는 비어있는 상태라고 가정) client에서 쿼리를 읽어오려고 하지만 ROOTE_QUERY는 정의되지 않아서 readQuery undefined가 됨.
>> 그러므로 읽으려는 쿼리가(readQuery) 캐시에 없다면, 오류가 발생함. 그래서 항상 readQuery나 readFragment는 try ~ catch로 예외처리를 할 수 있도록 해주어야 함.
>> [참고](https://github.com/apollographql/react-apollo/issues/1776) 

## Amplify CLI [문서](https://aws-amplify.github.io/docs/cli-toolchain/quickstart?sdk=js)
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