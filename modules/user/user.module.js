const path = require("path");
const DataSource = require("../../lib/dataSource");
const bodyParser = require("../../lib/bodyParser");
const { User } = require("../../lib/userClass");
const { group } = require("console");

const groupDatabasePath = path.join(__dirname, "../../database", "groups.json");
const userDatabasePath = path.join(__dirname, "../../database", "users.json");
const userGroupDatabasePath = path.join(
  __dirname,
  "../../database",
  "user_groups.json"
);

const userData = new DataSource(userDatabasePath);
const groupData = new DataSource(groupDatabasePath);
const userGroupData = new DataSource(userGroupDatabasePath);

class UserModule {
  static getUsers(req, res) {
    const users = userData.read();

    res.writeHead(200, { "Content-Type": "Application/json" });
    res.end(JSON.stringify(users));
  }

  static getUserById(req, res, userId) {
    const users = userData.read();

    const foundUser = users.find((user) => user.id === userId);

    if (foundUser) {
      res.writeHead(200, { "Content-Type": "Application/json" });
      res.end(JSON.stringify(foundUser));
    } else {
      res.writeHead(404, { "Content-Type": "Application/json" });
      res.end(JSON.stringify("User not found"));
    }
  }

  static async createUser(req, res) {
    const body = await bodyParser(req);

    if (!body.firstName || !body.lastName || !body.login || !body.age) {
      res.writeHead(400, { "Content-Type": "Application/json" });
      return res.end(JSON.stringify("name and login and age must be required"));
    }

    const users = userData.read();

    const foundUserByLogin = users.find((user) => user.login === body.login);

    if (foundUserByLogin) {
      res.writeHead(400, { "Content-Type": "Application/json" });
      return res.end(JSON.stringify("This login already exist"));
    }

    let generateId = 0;

    users.forEach((user) => {
      if (generateId < user.id) {
        generateId = user.id;
      }
    });

    const newUser = new User(
      generateId + 1,
      body.firstName,
      body.lastName,
      body.login,
      body.age
    );
    if (
      typeof body.firstName !== "string" ||
      typeof body.lastName !== "string" ||
      typeof body.login !== "string"
    ) {
      res.writeHead(400, { "Content-Type": "Application/json" });
      return res.end(JSON.stringify("Full name and login must be a string"));
    }
    if (typeof body.age !== "number" || !Number.isInteger(body.age)) {
      res.writeHead(400, { "Content-Type": "Application/json" });
      return res.end(JSON.stringify("Age must be a integer"));
    }

    users.push(newUser);

    userData.write(users);

    res.writeHead(201, { "Content-Type": "Application/json" });
    res.end(JSON.stringify(newUser));
  }

  static async updateUser(req, res, userId) {
    const body = await bodyParser(req);

    if (!body.firstName || !body.lastName || !body.login || isNaN(body.age)) {
      res.writeHead(400, { "Content-Type": "Application/json" });
      return res.end(JSON.stringify("fullName must be required"));
    }

    const users = userData.read();

    const foundUserIndex = users.findIndex((user) => user.id === userId);

    const foundUserByLogin = users.find((user) => user.login === body.login);

    if (foundUserIndex === -1) {
      res.writeHead(404, { "Content-Type": "Application/json" });
      return res.end(JSON.stringify("User not found"));
    }

    const [foundUser] = users.splice(foundUserIndex, 1);

    if (foundUserByLogin && foundUser.login !== body.login) {
      res.writeHead(400, { "Content-Type": "Application/json" });
      return res.end(JSON.stringify("This login already exist"));
    }

    foundUser.first_name = body.firstName;
    foundUser.last_name = body.lastName;
    foundUser.login = body.login;
    foundUser.age = body.age;

    if (
      typeof body.firstName !== "string" ||
      typeof body.lastName !== "string" ||
      typeof body.login !== "string"
    ) {
      res.writeHead(400, { "Content-Type": "Application/json" });
      return res.end(JSON.stringify("Full name and login must be a string"));
    }
    if (typeof body.age !== "number" || !Number.isInteger(body.age)) {
      res.writeHead(400, { "Content-Type": "Application/json" });
      return res.end(JSON.stringify("Age must be a integer"));
    }

    users.push(foundUser);

    userData.write(users);

    res.writeHead(200, { "Content-Type": "Application/json" });
    return res.end(JSON.stringify(foundUser));
  }

  static deleteUser(req, res, userId) {
    const users = userData.read();

    const foundUserIndex = users.findIndex((user) => user.id === userId);

    if (foundUserIndex === -1) {
      res.writeHead(404, { "Content-Type": "Application/json" });
      return res.end(JSON.stringify("User not found"));
    }

    const userGroups = userGroupData.read();

    // Ushbu foydalanuvchi guruhlarini topamiz

    const groups = groupData.read();
    let result = [];
    const filtergroup = userGroups.filter((uG) => userId === uG.user_id);

    filtergroup.forEach((uG) =>
      result.push(groups.find((group) => group.id === uG.group_id))
    );

    if (filtergroup.length) {
      // Foydalanuvchi guruhlarga kiritilgan bo'lsa
      res.writeHead(400, { "Content-Type": "Application/json" });
      return res.end(JSON.stringify(result.sort((a, b) => a.id - b.id)));
    }

    const [deletedUser] = users.splice(foundUserIndex, 1);

    userData.write(users);

    res.writeHead(200, { "Content-Type": "Application/json" });
    res.end(JSON.stringify(deletedUser));
  }
}

module.exports = UserModule;
