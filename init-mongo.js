db.createUser(
    {
        user: "d3ctf2023350j2tsykyydglx8",
        pwd: "d3ctf2023aw2obp8tincqw6od",
        roles: [
            {
                role: "readWrite",
                db: "userInfoDB"
            }
        ]
    }
);

var collectionName = "userinfo";

db = db.getSiblingDB("userInfoDB");
db.createCollection(collectionName);
db.userinfo.insertOne({username:"admin",password:"dob2xdriaqpytdyh6jo3"});