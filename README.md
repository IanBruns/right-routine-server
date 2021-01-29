# Introduction

Hello!

This is an api done entirely in node.js/express that is meant to:
A) Store users and their passwords through hashing and creating a jason web token
B) Assign execise "routines" to that user
C) assign exercises to the routines and the user

## Use Cases

The Use cases for this are pretty focused, this is for users who create their own workouts
and routines based on what serves them.  Best used with the client created along side this
API.  Repo found here: https://github.com/IanBruns/right-routine-client

## Authorization

Every API request will require a 'bearer ' token created by the json web token library,
there are no elements that does not require authoriztion of a signin.  3 dummy accounts have
been provided in the seed file

No API key required for access

## Responses

Outside of GET requests, you will not recieve a lot of success messages, most responses come
from error in this format:

{
  error: {Message: `this would be the message`}
}

## Status Codes

Right Routine returns the following status codes in its API:

| Status Code | Description |
| :--- | :--- |
| 200 | `OK` |
| 201 | `CREATED` |
| 204 | `NO CONTENT` |
| 400 | `BAD REQUEST` |
| 404 | `NOT FOUND` |
| 500 | `INTERNAL SERVER ERROR` |