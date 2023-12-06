const path = require("path");
const DataSource = require("../../lib/dataSource");
const bodyParser = require("../../lib/bodyParser");
const { UserGroup } = require("../../lib/userGroupClass");

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

class UserGroupModule {
  static getUserGroupByUserId(req, res, userId) {
    const userGroups = userGroupData.read();

    const groups = groupData.read();

    const filtergroups = [];

    for (let i = 0; i < groups.length; i++) {
      const group = groups[i];
      for (let j = 0; j < userGroups.length; j++) {
        const userGroup = userGroups[j];

        if (group.id === userGroup.group_id && userGroup.user_id === userId) {
          filtergroups.push(group);
        }
      }
    }

    if (!filtergroups.length) {
      res.writeHead(404, { "Content-Type": "Application/json" });
      return res.end(JSON.stringify("Groups not found"));
    }

    res.writeHead(200, { "Content-Type": "Application/json" });
    res.end(JSON.stringify(filtergroups));
  }
  static getUserGroupByGroupId(req, res, groupId) {
    const userGroups = userGroupData.read();

    const users = userData.read();

    const filterUsers = [];

    for (let i = 0; i < users.length; i++) {
      const user = users[i];
      for (let j = 0; j < userGroups.length; j++) {
        const userGroup = userGroups[j];

        if (user.id === userGroup.user_id && userGroup.group_id === groupId) {
          filterUsers.push(user);
        }
      }
    }
    if (!filterUsers.length) {
      res.writeHead(404, { "Content-Type": "Application/json" });
      return res.end(JSON.stringify("Users not found"));
    }

    res.writeHead(200, { "Content-Type": "Application/json" });
    res.end(JSON.stringify(filterUsers));
  }
  static async createUserGroup(req, res) {
    const body = await bodyParser(req);
    if (!body.userId || !body.groupId) {
      res.writeHead(404, { "Content-Type": "Application/json" });
      return res.end(JSON.stringify("userId and groupId must be reqiured"));
    }

    const users = userData.read();
    const groups = groupData.read();

    const foundUser = users.find((user) => user.id === body.userId);
    const foundGroup = groups.find((group) => group.id === body.groupId);

    if (!foundUser) {
      res.writeHead(404, { "Content-Type": "Application/json" });
      return res.end(JSON.stringify("user not found"));
    }
    if (!foundGroup) {
      res.writeHead(404, { "Content-Type": "Application/json" });
      return res.end(JSON.stringify("group not found"));
    }

    const userGroups = userGroupData.read();

    const foundUserGroup = userGroups.find(
      (userGroup) =>
        userGroup.user_id === body.userId && userGroup.group_id === body.groupId
    );

    if (foundUserGroup) {
      res.writeHead(404, { "Content-Type": "Application/json" });
      return res.end(JSON.stringify("This user already had a group"));
    }

    let generatedId = 0;
    for (let i = 0; i < userGroups.length; i++) {
      const userGroup = userGroups[i];

      if (generatedId < userGroup.id) {
        generatedId = userGroup.id;
      }
    }

    const newUserGroup = new UserGroup(
      generatedId + 1,
      body.userId,
      body.groupId
    );

    userGroups.push(newUserGroup);
    userGroupData.write(userGroups);

    res.writeHead(201, { "Content-Type": "Application/json" });
    res.end(JSON.stringify(newUserGroup));
  }
  static deleteUserGroup(req, res, userId, groupId) {
    const userGroups = userGroupData.read();
    const users = userData.read();
    const groups = groupData.read();

    const foundUserGroupIndex = userGroups.findIndex(
      (userGroup) =>
        userGroup.user_id === userId && userGroup.group_id == groupId
    );

    if (foundUserGroupIndex === -1) {
      res.writeHead(404, { "Content-Type": "Application/json" });
      return res.end(JSON.stringify("UserGroup not found"));
    }

    const [deletedUserGroup] = userGroups.splice(foundUserGroupIndex, 1);

    userGroupData.write(userGroups);
    userData.write(users);
    groupData.write(groups);

    res.writeHead(200, { "Content-Type": "Application/json" });
    res.end(JSON.stringify(deletedUserGroup));
  }
}

module.exports = UserGroupModule;
