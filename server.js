const http = require("http");
const { isBoolean } = require("./lib/isBoolean");
const UserModule = require("./modules/user/user.module");
const GroupModule = require("./modules/group/group.module");
const UserGroupModule = require("./modules/UserGroup/userGroup.module");

const moduls = async (req, res) => {
  const url = req.url.split("/");
  const method = req.method;

  try {
    if (method === "GET" && url[1] === "user" && !url[2]) {
      UserModule.getUsers(req, res);
    } else if (method === "GET" && url[1] === "user" && url[2]) {
      UserModule.getUserById(req, res, Number(url[2]));
    } else if (method === "POST" && url[1] === "user") {
      UserModule.createUser(req, res);
    } else if (method === "PUT" && url[1] === "user" && url[2]) {
      UserModule.updateUser(req, res, Number(url[2]));
    } else if (method === "DELETE" && url[1] === "user" && url[2]) {
      UserModule.deleteUser(req, res, Number(url[2]));
    } else if (method === "GET" && url[1] === "group" && !url[2]) {
      GroupModule.getGroup(req, res);
    } else if (method === "GET" && url[1] === "group" && url[2]) {
      GroupModule.getGroupById(req, res, Number(url[2]));
    } else if (method === "POST" && url[1] === "group") {
      GroupModule.createGroup(req, res);
    } else if (method === "PUT" && url[1] === "group" && url[2]) {
      GroupModule.updateGroup(req, res, Number(url[2]));
    } else if (method === "DELETE" && url[1] === "group" && url[2]) {
      GroupModule.deleteGroup(req, res, Number(url[2]));
    } else if (
      method === "GET" &&
      url[1] === "user-group" &&
      url[2] === "user" &&
      url[3]
    ) {
      UserGroupModule.getUserGroupByUserId(req, res, Number(url[3]));
    } else if (
      method === "GET" &&
      url[1] === "user-group" &&
      url[2] === "group" &&
      url[3]
    ) {
      UserGroupModule.getUserGroupByGroupId(req, res, Number(url[3]));
    } else if (method === "POST" && url[1] === "user-group") {
      UserGroupModule.createUserGroup(req, res);
    } else if (
      method === "DELETE" &&
      url[1] === "user-group" &&
      url[2] && //{userId}/
      url[3] //{groupId}
    ) {
      UserGroupModule.deleteUserGroup(req, res, Number(url[2]), Number(url[3]));
    } else {
      res.writeHead(405, { "Content-Type": "Application/json" });
      res.end(JSON.stringify("Method not allowed"));
    }
  } catch (error) {
    if (isBoolean(error)) {
      res.writeHead(400, { "Content-Type": "Application/json" });
      res.end(JSON.stringify("Bady must be required"));
    } else {
      res.writeHead(500, { "Content-Type": "Application/json" });
      res.end(JSON.stringify(error.message ?? "Server error"));
    }
  }
};

const server = http.createServer(moduls);

const port = 7777;

server.listen(port, () => {
  console.log(`server running on port: ${port}`);
});
