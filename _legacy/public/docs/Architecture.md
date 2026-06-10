## Architecture

The core Architecture of DCS fiddle is as documented below.

It summarises how the DCS Fiddle executes commands in DCS.

![architecture](/c4.svg)

## Server (HTTP Server)

The server is a simple http server written in pure LUA.

As such this means the LUA scripting environment within DCS is able to run it.

It sits waiting for requests on http://localhost:12080

### API

It has a command processor endpoint exposed at http://localhost:12080/api/.

This endpoint accepts a query parameter `command`. This query parameter contains the string to be executed.

The command query parameter must be base64 encoded, it is decoded when received.

> ️ This is not encryption and is only to make the exchange of characters easier inside a url.

An example request to return the theatre looks like below

```shell
curl --location --request GET 'http://localhost:12080/api/?command=cmV0dXJuIGVudi5taXNzaW9uLnRoZWF0cmU%3D'
```

### Response

The Server responds in JSON, this makes it easier to use the result with standard web technologies.

This application came about mainly as a way to dump information from DCS.

## Client (DCS Fiddle)

The Client is this site, it sends a GET request to the HTTP endpoint exposed by the server.

It's a very simple request and response application and provinces some useful views of the response.

## Security

Unfortunately at present there is no cryptography available in the LUA scripting environment, it would be good
if this could be implemented PRs are welcome!.

If the payload between the client and server could be encrypted and decrypted using a shared
secret it would massively increase the security of this application. At this time however this is NOT the case.

We could rely on a third party, but we would rather not make it cumbersome to use and setup. 

As such we strongly recommend sticking with the default configuration and leaving everything as is.

By default, the server only accepts requests from the localhost, and the site only sends them to localhost.

This prevents any bad actors from accessing the game and running code on your PC. Remember DCS is (relatively) secure,
but allowing arbitrary LUA to run inside it is very much not.

This is unfortunately a risk that we must take, permitting you don't just run any old script, and use this for its intended
purposes there should be no security issues. However as mentioned in the disclaimer

> The Software and code samples available on this website are provided "as is" without warranty of any kind, either express or implied. 
> Use at your own risk.
