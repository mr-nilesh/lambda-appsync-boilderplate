# Lambda Appsync Boilerplate

## Prerequisite

```bash
NodeJS20.x
```

## Installation

```bash
$ npm install
```

## Running the app

```bash
# local
$ npm run local
```

## Development guide
This architecture is based on microservices using AWS Lambda, AWS AppSync and Serverless framework. We have made this architecture modular as much as possible. Every module has its own yml file and graphql file. You can see in the codebase that we have functions directive. This directive has sub modules based on the project modules.

For example: For auth module we have directive src/functions/auth. This directive has its own .yml and .schema file(NOTE: If you are adding new module, then you do not need to create these two files manually. You need to create only sub folder and these two files gets generated auto).
All the AWS lambdas which are related to auth module should go to src/functions/auth/ directive. To manage all the lambdas and it's AppSync query/mutation we have automated our process of keeping entries of lambdas and schema in yml file. To do this you need to add suffix to the lambda name. If lambda is associated to AppSync query then lambda name should have Query suffix, the same way if the lambda is associated to AppSync mutation then lambda name should have Mutation suffix.
For example: getUserQuery.ts, loginMutation.ts, logoutMutation.ts. This suffix allows our automation script to keep lambdas entry into .yml file in a particular module.

This automation happens when you run the application in local using command
```bash
$ npm run local
```

NOTE: Lambda name and AppSync query/mutation name should be same (without suffix). For example: loginMutation.ts lambda file should be associated to login AppSync mutation.
Why do we need to do this, because our automation script creates the mapping-templates for this query/mutation.


## What does our automation script do?
It reads Query/Mutation suffix from the lambda name.

It adds the entry of lambda function to a partucular module's .yml file

It adds the entry of lambda datasource to a partucular module's .yml file

It add the entry of schema file to a partucular module's .yml file

It creates the mapping-template(inside mapping-templates directive which is located in the root directive) to map the AppSync query/mutation to the particular lambda as a datasource.

## serverless.yml updates

If you are creating a new module and creating a new folder inside src/functions directive, make sure you add 3 entries in serverless.yml file which are schema, mappingTemplates and dataSources.
For example:
```bash
schema:
  - ${file(src/functions/users/users.yml):schema}
mappingTemplates:
  - ${file(src/functions/users/users.yml):mappingTemplates}
dataSources:
  - ${file(src/functions/users/users.yml):dataSources}
```
