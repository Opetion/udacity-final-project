# Serverless Home Finder

Capstone Project from "Cloud Developer Nanodegree Program" in Udacity. The work is based on the previous [project](https://github.com/Opetion/udacity-todo-serverless).

## Description
The project implements a simple buy/sell properties using AWS Lambda and Serverless framework.

For this project it was implemented the following functionalities:
- Login;
- Create/Delete Property;
- (Anonymous) List Properties;
- (Logged in) List Own Properties;
 

# Functionality of the application

All the functionalities should be possible to use via Postman with the included file home-finder.postman_collection.json 

This application will allow creating/removing/updating/fetching TODO items. Each TODO item can optionally have an attachment image. Each user only has access to TODO items that he/she has created.

# How to run the application

## Backend

To deploy an application run the following commands:

```
cd backend
npm install
sls deploy -v
```

## Frontend

To run a client application first edit the `client/src/config.ts` file to set correct parameters. And then run the following commands:

```
cd client
npm install
npm run start
```

This should start a development server with the React application that will interact with the serverless TODO application.

