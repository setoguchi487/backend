import { DataSource } from "typeorm"
require('dotenv').config();

const AppDataSource = new DataSource({
        type: "postgres", 
        host: process.env.DB_HOST,
        username: process.env.DB_USER,
        password: process.env.DB_PASS,
        database: process.env.DB_NAME,
        entities: ["src/entities/*.ts"],  
        migrations: ["src/migrations/*.ts"], 
        ssl: {
                rejectUnauthorized: false,
        },
})

export default AppDataSource;