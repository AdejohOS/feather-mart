const config = {
    appName: "FeatherMart",
    appDescription:
      "FeatherMart is where poultry farmers meet product buyers.",
    domainName:
      process.env.NODE_ENV === "development"
        ? "http://localhost:3000"
        : "https://feathermart.com",
  };
  
  export default config;