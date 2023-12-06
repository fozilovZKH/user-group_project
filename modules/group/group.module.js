const path = require("path");
const DataSource = require("../../lib/dataSource");
const bodyParser = require("../../lib/bodyParser");
const { Group } = require("../../lib/groupClass");

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

class GroupModule {
  static getGroup(req, res) {
    const groups = groupData.read();

    res.writeHead(200, { "Content-Type": "Application/json" });
    res.end(JSON.stringify(groups));
  }

  static getGroupById(req, res, groupId) {
    const groups = groupData.read();

    const foundGroup = groups.find((group) => group.id === groupId);

    if (!foundGroup) {
      res.writeHead(404, { "Content-Type": "Application/json" });
      return res.end(JSON.stringify("Group not found"));
    }

    res.writeHead(200, { "Content-Type": "Application/json" });
    res.end(JSON.stringify(foundGroup));
  }

  static async createGroup(req, res) {
    const body = await bodyParser(req);

    if (!body.name || !body.shortName) {
      res.writeHead(400, { "Content-Type": "Application/json" });
      return res.end(JSON.stringify("name and shortName must be required"));
    }

    const groups = groupData.read();

    let generateId = 0;

    for (let i = 0; i < groups.length; i++) {
      const group = groups[i];

      if (generateId < group.id) {
        generateId = group.id;
      }
    }

    const newGroup = new Group(generateId + 1, body.name, body.shortName);

    if (typeof body.name !== "string" || typeof body.shortName !== "string") {
      res.writeHead(400, { "Content-Type": "Application/json" });
      return res.end(JSON.stringify("Name and shorName must be a string"));
    }

    groups.push(newGroup);
    groupData.write(groups);

    res.writeHead(201, { "Content-Type": "Application/json" });
    return res.end(JSON.stringify(newGroup));
  }

  static async updateGroup(req, res, groupId) {
    const body = await bodyParser(req);

    if (!body.name || !body.shortName) {
      res.writeHead(400, { "Content-Type": "Application/json" });
      return res.end(JSON.stringify("name and shortName must be required"));
    }

    const groups = groupData.read();

    let foundGroup;

    const filterGroups = groups.filter((group) => {
      if (group.id !== groupId) {
        return true;
      } else {
        foundGroup = group;
      }
    });

    if (!foundGroup) {
      res.writeHead(404, { "Content-Type": "Application/json" });
      return res.end(JSON.stringify("Group not found"));
    }

    foundGroup.name = body.name;
    foundGroup.short_name = body.shortName;

    if (typeof body.name !== "string" || typeof body.shortName !== "string") {
      res.writeHead(400, { "Content-Type": "Application/json" });
      return res.end(JSON.stringify("Name and shorName must be a string"));
    }

    filterGroups.push(foundGroup);
    groupData.write(filterGroups);

    res.writeHead(201, { "Content-Type": "Application/json" });
    return res.end(JSON.stringify(foundGroup));
  }
  static deleteGroup(req, res, groupId) {
    const groups = groupData.read();

    const foundGroupIndex = groups.findIndex((groups) => groups.id === groupId);

    if (foundGroupIndex === -1) {
      res.writeHead(404, { "Content-Type": "Application/json" });
      return res.end(JSON.stringify("Group not found"));
    }

    const userGroups = userGroupData.read();

    // Ushbu foydalanuvchi userlarni topamiz

    const users = userData.read();
    let result = [];
    const filteruser = userGroups.filter((uG) => groupId === uG.group_id);

    filteruser.forEach((uG) =>
      result.push(users.filter((user) => user.id === uG.user_id))
    );
    if (filteruser.length) {
      // Foydalanuvchi guruhlarga kiritilgan bo'lsa
      res.writeHead(400, { "Content-Type": "Application/json" });
      return res.end(JSON.stringify(result));
    }

    const [deletedGroup] = groups.splice(foundGroupIndex, 1);
    groupData.write(groups);

    res.writeHead(200, { "Content-Type": "Application/json" });
    return res.end(JSON.stringify(deletedGroup));
  }
}

module.exports = GroupModule;
