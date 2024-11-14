require("dotenv").config();
// Global configurations object contains Application Level variables such as:
// client secrets, passwords, connection strings, and misc flags
const configurations = {
  ConnectionStrings: {
    MongoDB: "mongodb+srv://kartik50:Kingkato@cluster0.cn9uj.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0",
  },
  Authentication: {
    Google: {
      ClientId: "773061681692-l3sevcai15f6m8i93va95ds87d8uvbjh.apps.googleusercontent.com",
      ClientSecret:"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",
      CallbackUrl: "http://localhost:3000/auth/google/callback"

    },
  },
};
module.exports = configurations;


