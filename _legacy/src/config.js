export const config = {
  script: {
    src: "/dcs-fiddle-server.lua",
    dest: "%USERPROFILE%\\Saved Games\\DCS\\Scripts\\Hooks\\dcs-fiddle-server.lua",
    destob:
      "%USERPROFILE%\\Saved Games\\DCS.openbeta\\Scripts\\Hooks\\dcs-fiddle-server.lua",
  },
  envs: [
    {
      id: "mission",
      name: "Mission",
      port: 12080,
      states: ["config", "mission", "server"],
    },
    {
      id: "gui",
      name: "GUI",
      port: 12081,
      states: ["config", "mission", "export", "server"],
    },
  ],
};
